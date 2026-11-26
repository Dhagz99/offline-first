import { createHash } from "node:crypto";

import { prisma } from "@/lib/database/prisma";

import type {
    Prisma,
} from "../../../../generated/prisma/client";

import type {
    SyncChangeEvent,
    SyncPullData,
} from "@repo/shared";

import {
    getBranchPullConfig,
} from "../pull/branch/branch-pull.client";

import {
    validateBranchPullResponse,
} from "../pull/branch/branch-pull.validator";

import {
    applyUserAccessUpsert,
    applyUserAccessDelete,
} from "./handlers/user-access.handler";

import {
    applyBranchUpsert,
} from "./handlers/branch.handler";

import {
    validateSyncEvent,
} from "./sync-apply.validator";

import {
    SyncApplyError,

    type ValidatedSyncEvent,

    type SyncApplyBatchResult,
} from "./sync-apply.types";

/* =========================
   CANONICAL JSON
========================= */

function canonicalJson(
    value: unknown
): string {

    if (Array.isArray(value)) {
        return `[${value
            .map(canonicalJson)
            .join(",")}]`;
    }

    if (
        value !== null &&
        typeof value === "object"
    ) {

        const object =
            value as Record<string, unknown>;

        return `{${Object.keys(object)
            .sort()
            .map(
                (key) =>
                    `${JSON.stringify(key)}:${canonicalJson(
                        object[key]
                    )}`
            )
            .join(",")}}`;
    }

    return JSON.stringify(value) ?? "null";
}

/* =========================
   GENERATE EVENT HASH
========================= */

function generateEventHash(
    event: SyncChangeEvent
): string {

    return createHash("sha256")
        .update(
            canonicalJson(event)
        )
        .digest("hex");
}

/* =========================
   APPLY SINGLE EVENT
========================= */

async function applyEvent(
    tx: Prisma.TransactionClient,

    validated: ValidatedSyncEvent
) {

    const { event } = validated;

    const payloadHash =
        generateEventHash(event);

    /* =========================
       CHECK EXISTING INBOX
    ========================= */

    const existing =
        await tx.syncInbox.findUnique({
            where: {
                id: event.eventId,
            },
        });

    if (existing) {

        if (
            existing.branchId !== event.branchId ||
            existing.entityType !== event.entityType ||
            existing.entityId !== event.entityId ||
            existing.operation !== event.operation ||
            existing.payloadHash !== payloadHash
        ) {
            throw new SyncApplyError(
                "DUPLICATE_EVENT_MISMATCH",
                "Existing event has different content",
                event.eventId
            );
        }

        return {
            applied: false,
        };
    }

    /* =========================
       DISPATCH EVENT
    ========================= */

    switch (validated.type) {

        case "USER_ACCESS_UPSERT":

            await applyUserAccessUpsert(
                tx,

                validated.payload
            );

            break;

        case "USER_ACCESS_DELETE":

            await applyUserAccessDelete(
                tx,

                validated.payload
            );

            break;

        case "BRANCH_UPSERT":

            await applyBranchUpsert(
                tx,

                validated.payload
            );

            break;

        default: {

            const exhaustive: never =
                validated;

            throw new SyncApplyError(
                "UNSUPPORTED_EVENT",
                "Unsupported validated event"
            );
        }
    }

    /* =========================
       RECORD PROCESSED EVENT
    ========================= */

    await tx.syncInbox.create({
        data: {
            id:
                event.eventId,

            branchId:
                event.branchId,

            entityType:
                event.entityType,

            entityId:
                event.entityId,

            operation:
                event.operation,

            payloadHash,
        },
    });

    return {
        applied: true,
    };
}

/* =========================
   APPLY SYNCHRONIZATION BATCH
========================= */

export async function applySyncBatchRepo(
    data: SyncPullData,

    expectedVersion: string
): Promise<SyncApplyBatchResult> {

    /* =========================
       BRANCH CONFIGURATION
    ========================= */

    const config =
        getBranchPullConfig();

    const {
        branchId,
        branchCode,
    } = config;

    /* =========================
       VALIDATE BATCH ENVELOPE
    ========================= */

    const validatedData =
        validateBranchPullResponse(
            {
                success: true,
                message: "Apply synchronization batch",
                data,
            },

            config,

            {
                afterVersion: expectedVersion,
                limit: config.batchSize,
            }
        );

    /* =========================
       VALIDATE ALL PAYLOADS
    ========================= */

    const validatedEvents =
        validatedData.events.map(
            (event) =>
                validateSyncEvent(
                    event,

                    branchId,

                    branchCode
                )
        );

    try {

        return await prisma.$transaction(
            async (tx) => {

                /* =========================
                   VERIFY DATABASE IDENTITY
                ========================= */

                const credentialCount =
                    await tx.branchCredential.count();

                if (credentialCount > 0) {
                    throw new SyncApplyError(
                        "DATABASE_IDENTITY_MISMATCH",
                        "Central database cannot apply branch events"
                    );
                }

                const branches =
                    await tx.branch.findMany({
                        select: {
                            id: true,

                            branchCode: true,
                        },
                    });

                if (
                    branches.length !== 1 ||
                    branches[0]?.id !== branchId ||
                    branches[0]?.branchCode !== branchCode
                ) {
                    throw new SyncApplyError(
                        "DATABASE_IDENTITY_MISMATCH",
                        "Local database does not match configured branch"
                    );
                }

                /* =========================
                   LOCK LOCAL CURSOR
                ========================= */

                const rows =
                    await tx.$queryRaw<
                        {
                            id: string;

                            lastVersion: bigint;
                        }[]
                    >`
                        SELECT
                            id,
                            last_version AS "lastVersion"
                        FROM sync_cursors
                        WHERE branch_id = ${branchId}::uuid
                        FOR UPDATE
                    `;

                const cursor = rows[0];

                if (!cursor) {
                    throw new SyncApplyError(
                        "BRANCH_NOT_PROVISIONED",
                        "Local synchronization cursor is missing"
                    );
                }

                /* =========================
                   VERIFY CURSOR
                ========================= */

                if (
                    cursor.lastVersion !==
                    BigInt(expectedVersion)
                ) {
                    throw new SyncApplyError(
                        "CURSOR_CHANGED",
                        "Another synchronization process advanced the cursor"
                    );
                }

                let appliedEvents = 0;

                let skippedEvents = 0;

                /* =========================
                   APPLY EVENTS IN ORDER
                ========================= */

                for (const event of validatedEvents) {

                    const result =
                        await applyEvent(
                            tx,

                            event
                        );

                    if (result.applied) {

                        appliedEvents++;

                    } else {

                        skippedEvents++;
                    }
                }

                /* =========================
                   ADVANCE CURSOR
                ========================= */

                const now = new Date();

                await tx.syncCursor.update({
                    where: {
                        id: cursor.id,
                    },

                    data: {
                        lastVersion:
                            BigInt(
                                validatedData.nextVersion
                            ),

                        lastPullAt: now,

                        lastSuccessfulSyncAt: now,

                        lastError: null,
                    },
                });

                return {
                    branchId,

                    branchCode,

                    fromVersion:
                        validatedData.fromVersion,

                    nextVersion:
                        validatedData.nextVersion,

                    latestVersion:
                        validatedData.latestVersion,

                    receivedEvents:
                        validatedData.events.length,

                    appliedEvents,

                    skippedEvents,

                    hasMore:
                        validatedData.hasMore,
                };
            },

            {
                isolationLevel:
                    "ReadCommitted",

                maxWait: 10_000,

                timeout: 60_000,
            }
        );

    } catch (error) {

        if (error instanceof SyncApplyError) {
            throw error;
        }

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            throw new SyncApplyError(
                "DATABASE_CONFLICT",
                "Synchronization encountered a unique record conflict"
            );
        }

        throw new SyncApplyError(
            "APPLY_FAILED",
            "Unable to apply synchronization batch. Transaction rolled back."
        );
    }
}