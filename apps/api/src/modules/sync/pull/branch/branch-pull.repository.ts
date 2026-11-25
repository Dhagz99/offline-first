import {
    prisma,
} from "@/lib/database/prisma";

import {
    BranchPullError,

    type BranchPullConfig,
} from "./branch-pull.types";

/* =========================
   GET LOCAL PULL STATE
========================= */

export async function getBranchPullStateRepo(
    config: BranchPullConfig
) {

    try {

        return await prisma.$transaction(
            async (tx) => {

                /* =========================
                   DATABASE IDENTITY
                ========================= */

                const database =
                    await tx.$queryRaw<
                        { databaseName: string }[]
                    >`
                        SELECT current_database()
                        AS "databaseName"
                    `;

                const databaseName =
                    database[0]?.databaseName ??
                    "unknown";

                /* =========================
                   PREVENT CENTRAL DB ACCESS
                ========================= */

                const credentialCount =
                    await tx.branchCredential.count();

                if (credentialCount > 0) {
                    throw new BranchPullError(
                        "DATABASE_IDENTITY_MISMATCH",

                        "Configured database contains central branch credentials"
                    );
                }

                /* =========================
                   VERIFY LOCAL BRANCH
                ========================= */

                const branches =
                    await tx.branch.findMany({
                        select: {
                            id: true,

                            branchCode: true,

                            isActive: true,
                        },
                    });

                if (branches.length === 0) {
                    throw new BranchPullError(
                        "BRANCH_NOT_PROVISIONED",

                        "Local branch has not been provisioned"
                    );
                }

                if (
                    branches.length !== 1 ||
                    branches[0]?.id !==
                        config.branchId ||
                    branches[0]?.branchCode !==
                        config.branchCode
                ) {
                    throw new BranchPullError(
                        "DATABASE_IDENTITY_MISMATCH",

                        "Local database does not match the configured branch"
                    );
                }

                /* =========================
                   GET SYNCHRONIZATION CURSOR
                ========================= */

                const cursor =
                    await tx.syncCursor.findUnique({
                        where: {
                            branchId:
                                config.branchId,
                        },

                        select: {
                            id: true,

                            branchId: true,

                            lastVersion: true,

                            lastPullAt: true,

                            lastSuccessfulSyncAt:
                                true,
                        },
                    });

                if (!cursor) {
                    throw new BranchPullError(
                        "BRANCH_NOT_PROVISIONED",

                        "Local synchronization cursor is missing"
                    );
                }

                return {
                    databaseName,

                    branch: branches[0],

                    cursor,
                };
            },

            {
                isolationLevel:
                    "RepeatableRead",

                maxWait: 5000,

                timeout: 10000,
            }
        );

    } catch (error) {

        if (error instanceof BranchPullError) {
            throw error;
        }

        throw new BranchPullError(
            "DATABASE_ERROR",

            "Unable to read local synchronization state"
        );
    }
}