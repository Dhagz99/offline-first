import { prisma } from "@/lib/database/prisma";

import { AppError } from "@/errors/app-error";

import { ErrorCodes } from "@/errors/error-codes";

type PullChangesInput = {
    branchId: string;

    credentialId: string;

    afterVersion: bigint;

    limit: number;
};

/* =========================
   PULL CHANGE LOG EVENTS
========================= */

export async function pullChangesRepo(
    input: PullChangesInput
) {
    return prisma.$transaction(
        async (tx) => {

            /* =========================
               VALIDATE BRANCH IDENTITY
            ========================= */

            const credential =
                await tx.branchCredential.findUnique({
                    where: {
                        id: input.credentialId,
                    },

                    select: {
                        branchId: true,

                        isActive: true,

                        revokedAt: true,

                        expiresAt: true,

                        branch: {
                            select: {
                                id: true,
                                branchCode: true,
                                isActive: true,
                            },
                        },
                    },
                });

            if (
                !credential ||
                credential.branchId !== input.branchId ||
                !credential.isActive ||
                credential.revokedAt ||
                !credential.branch.isActive ||
                (
                    credential.expiresAt &&
                    credential.expiresAt <= new Date()
                )
            ) {
                throw new AppError(
                    "Invalid branch credentials",
                    401,
                    ErrorCodes.INVALID_BRANCH_CREDENTIAL
                );
            }

            /* =========================
               CURRENT GLOBAL VERSION
            ========================= */

            const counter =
                await tx.syncVersionCounter.findUnique({
                    where: {
                        id: 1,
                    },

                    select: {
                        lastVersion: true,
                    },
                });

            if (!counter) {
                throw new AppError(
                    "Synchronization counter is not initialized",
                    500,
                    ErrorCodes.INTERNAL_SERVER_ERROR
                );
            }

            const latestVersion =
                counter.lastVersion;

            /* =========================
               VALIDATE REQUESTED CURSOR
            ========================= */

            if (
                input.afterVersion >
                latestVersion
            ) {
                throw new AppError(
                    "Synchronization cursor exceeds the central server version",
                    409,
                    ErrorCodes.INVALID_SYNC_CURSOR
                );
            }

            /* =========================
               GET AUTHORIZED EVENTS
            ========================= */

            const records =
                await tx.syncChangeLog.findMany({
                    where: {

                        // Never accept branchId
                        // directly from the client.

                        branchId: input.branchId,

                        version: {
                            gt: input.afterVersion,

                            lte: latestVersion,
                        },
                    },

                    orderBy: {
                        version: "asc",
                    },

                    // Retrieve one extra event
                    // to determine whether another
                    // page is available.

                    take: input.limit + 1,

                    select: {
                        version: true,

                        eventId: true,

                        branchId: true,

                        entityType: true,

                        entityId: true,

                        operation: true,

                        payload: true,

                        schemaVersion: true,

                        entityVersion: true,

                        createdAt: true,
                    },
                });

            /* =========================
               PAGINATION
            ========================= */

            const hasMore =
                records.length > input.limit;

            const events =
                records.slice(0, input.limit);

            /* =========================
               SAFE CURSOR ADVANCEMENT
            ========================= */

            const lastEvent =
                events[events.length - 1];

            const nextVersion =
                hasMore && lastEvent
                    ? lastEvent.version
                    : latestVersion;

            /* =========================
               RETURN CONSISTENT SNAPSHOT
            ========================= */

            return {
                branch: credential.branch,

                fromVersion:
                    input.afterVersion,

                nextVersion,

                latestVersion,

                hasMore,

                events,
            };
        },

        {
            isolationLevel: "RepeatableRead",

            maxWait: 5_000,

            timeout: 15_000,
        }
    );
}