import { randomUUID } from "node:crypto";

import type {
    Prisma,
} from "../../../../generated/prisma/client";

import type {
    CreateChangeLogInput,
} from "./change-log.types";

/* =========================
   LOCK VERSION COUNTER
========================= */

export async function lockVersionCounter(
    tx: Prisma.TransactionClient
) {
    const rows = await tx.$queryRaw<
        { id: number }[]
    >`
        SELECT id
        FROM sync_version_counters
        WHERE id = 1
        FOR UPDATE
    `;

    if (rows.length !== 1) {
        throw new Error(
            "Synchronization version counter is not initialized"
        );
    }
}

/* =========================
   ALLOCATE NEXT VERSION
========================= */

export async function allocateNextVersion(
    tx: Prisma.TransactionClient
) {
    const counter =
        await tx.syncVersionCounter.update({
            where: {
                id: 1,
            },

            data: {
                lastVersion: {
                    increment: 1n,
                },
            },

            select: {
                lastVersion: true,
            },
        });

    return counter.lastVersion;
}

/* =========================
   GET ENTITY VERSION
========================= */

export async function getNextEntityVersion(
    tx: Prisma.TransactionClient,
    input: CreateChangeLogInput
) {
    const previous =
        await tx.syncChangeLog.findFirst({
            where: {
                branchId: input.branchId,

                entityType: input.entityType,

                entityId: input.entityId,
            },

            orderBy: {
                version: "desc",
            },

            select: {
                entityVersion: true,
            },
        });

    return (previous?.entityVersion ?? 0) + 1;
}

/* =========================
   INSERT CHANGE LOG
========================= */

export async function insertChangeLog(
    tx: Prisma.TransactionClient,
    input: CreateChangeLogInput
) {
    const version =
        await allocateNextVersion(tx);

    const entityVersion =
        await getNextEntityVersion(
            tx,
            input
        );

    return tx.syncChangeLog.create({
        data: {
            version,

            eventId: randomUUID(),

            branchId: input.branchId,

            entityType: input.entityType,

            entityId: input.entityId,

            operation: input.operation,

            payload: input.payload,

            schemaVersion:
                input.schemaVersion ?? 1,

            entityVersion,
        },

        select: {
            version: true,
            eventId: true,
            branchId: true,
            entityType: true,
            entityId: true,
            operation: true,
            entityVersion: true,
            createdAt: true,
        },
    });
}