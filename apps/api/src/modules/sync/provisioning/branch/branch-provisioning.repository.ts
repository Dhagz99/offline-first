import type {
    ProvisioningSnapshot,
} from "@repo/shared";

import { prisma } from "@/lib/database/prisma";

import { appConfig } from "@/config/app.config";
import { env } from "@/config/env";

import {
    validateProvisioningSnapshot,
} from "./branch-provisioning.validator";

/* =========================
   IMPORT SNAPSHOT
========================= */

export async function importProvisioningSnapshotRepo(
    snapshot: ProvisioningSnapshot
) {

    validateProvisioningSnapshot(snapshot);

    const branchId = snapshot.branch.id;

    const snapshotVersion = BigInt(
        snapshot.snapshotVersion
    );

    const incomingUserIds = snapshot.users.map(
        (user) => user.id
    );

    const incomingRoleIds = snapshot.roles.map(
        (role) => role.id
    );

    return prisma.$transaction(
        async (tx) => {

            /* =========================
               DATABASE SAFETY CHECK
            ========================= */

            if (!appConfig.isBranch) {
                throw new Error(
                    "Cannot provision a central server"
                );
            }

            const databaseInfo =
                await tx.$queryRaw<
                    { database_name: string }[]
                >`
                    SELECT current_database()
                    AS database_name
                `;

            const databaseName =
                databaseInfo[0]?.database_name;

            if (!databaseName) {
                throw new Error(
                    "Unable to verify database identity"
                );
            }

            if (databaseName === "central_db") {
                throw new Error(
                    "Provisioning the central database is prohibited"
                );
            }

            /* =========================
               DEVELOPMENT DB GUARD
            ========================= */

            if (env.NODE_ENV === "development") {
                const expectedDatabases:
                    Record<string, string> = {
                        "EMB-MAIN": "branch_a_db",

                        "EMB-ILOILO": "branch_b_db",
                    };

                const expectedDatabase =
                    expectedDatabases[
                        snapshot.branch.branchCode
                    ];

                if (
                    !expectedDatabase ||
                    databaseName !== expectedDatabase
                ) {
                    throw new Error(
                        "Incorrect development database for this branch"
                    );
                }
            }

            /* =========================
               EXISTING BRANCH IDENTITY
            ========================= */

            const otherBranch =
                await tx.branch.findFirst({
                    where: {
                        id: {
                            not: branchId,
                        },
                    },

                    select: {
                        id: true,
                    },
                });

            if (otherBranch) {
                throw new Error(
                    "Database belongs to another branch or contains central branch data"
                );
            }

            /* =========================
               CHECK EXISTING CURSOR
            ========================= */

            const existingCursor =
                await tx.syncCursor.findUnique({
                    where: {
                        branchId,
                    },

                    select: {
                        lastVersion: true,
                    },
                });

            if (
                existingCursor &&
                existingCursor.lastVersion >
                    snapshotVersion
            ) {
                throw new Error(
                    "Cannot import an older provisioning snapshot"
                );
            }

            /* =========================
               1. UPSERT BRANCH
            ========================= */

            const branchData = {
                branchCode:
                    snapshot.branch.branchCode,

                branchName:
                    snapshot.branch.branchName,

                address:
                    snapshot.branch.address,

                isActive:
                    snapshot.branch.isActive,

                createdAt: new Date(
                    snapshot.branch.createdAt
                ),

                updatedAt: new Date(
                    snapshot.branch.updatedAt
                ),
            };

            await tx.branch.upsert({
                where: {
                    id: branchId,
                },

                create: {
                    id: branchId,

                    ...branchData,
                },

                update: branchData,
            });

            /* =========================
               2. UPSERT PERMISSIONS
            ========================= */

            for (const permission of snapshot.permissions) {

                const data = {
                    code: permission.code,

                    name: permission.name,

                    description:
                        permission.description,

                    createdAt: new Date(
                        permission.createdAt
                    ),

                    updatedAt: new Date(
                        permission.updatedAt
                    ),
                };

                await tx.permission.upsert({
                    where: {
                        id: permission.id,
                    },

                    create: {
                        id: permission.id,

                        ...data,
                    },

                    update: data,
                });
            }

            /* =========================
               3. UPSERT ROLES
            ========================= */

            for (const role of snapshot.roles) {

                const data = {
                    name: role.name,

                    description: role.description,

                    createdAt: new Date(
                        role.createdAt
                    ),

                    updatedAt: new Date(
                        role.updatedAt
                    ),
                };

                await tx.role.upsert({
                    where: {
                        id: role.id,
                    },

                    create: {
                        id: role.id,

                        ...data,
                    },

                    update: data,
                });
            }

            /* =========================
               4. RECONCILE ROLE PERMISSIONS
            ========================= */

            await tx.rolePermission.deleteMany({
                where: {
                    roleId: {
                        in: incomingRoleIds,
                    },
                },
            });

            if (snapshot.rolePermissions.length > 0) {
                await tx.rolePermission.createMany({
                    data: snapshot.rolePermissions,
                });
            }

            /* =========================
               5. UPSERT USERS
            ========================= */

            for (const user of snapshot.users) {

                const data = {
                    name: user.name,

                    username: user.username,

                    email: user.email,

                    password: user.password,

                    isActive: user.isActive,

                    createdAt: new Date(
                        user.createdAt
                    ),

                    updatedAt: new Date(
                        user.updatedAt
                    ),
                };

                await tx.user.upsert({
                    where: {
                        id: user.id,
                    },

                    create: {
                        id: user.id,

                        ...data,
                    },

                    update: data,
                });
            }

            /* =========================
               6. RECONCILE USER ROLES
            ========================= */

            await tx.userRole.deleteMany({
                where: {
                    userId: {
                        in: incomingUserIds,
                    },
                },
            });

            if (snapshot.userRoles.length > 0) {
                await tx.userRole.createMany({
                    data: snapshot.userRoles.map(
                        (item) => ({
                            userId: item.userId,

                            roleId: item.roleId,

                            assignedAt: new Date(
                                item.assignedAt
                            ),
                        })
                    ),
                });
            }

            /* =========================
               7. FIND REMOVED ACCOUNTS
            ========================= */

            const removedAssignments =
                await tx.userBranch.findMany({
                    where: {
                        branchId,

                        userId: {
                            notIn: incomingUserIds,
                        },
                    },

                    select: {
                        userId: true,
                    },
                });

            const removedUserIds =
                removedAssignments.map(
                    (item) => item.userId
                );

            /* =========================
               8. RECONCILE BRANCH ASSIGNMENTS
            ========================= */

            await tx.userBranch.deleteMany({
                where: {
                    branchId,
                },
            });

            if (snapshot.userBranches.length > 0) {
                await tx.userBranch.createMany({
                    data: snapshot.userBranches.map(
                        (item) => ({
                            userId: item.userId,

                            branchId: item.branchId,

                            assignedAt: new Date(
                                item.assignedAt
                            ),
                        })
                    ),
                });
            }

            /* =========================
               9. DEACTIVATE UNASSIGNED USERS
            ========================= */

            const deactivatedUsers =
                await tx.user.updateMany({
                    where: {
                        id: {
                            notIn: incomingUserIds,
                        },

                        isActive: true,
                    },

                    data: {
                        isActive: false,
                    },
                });

            /* =========================
               REMOVE STALE USER ROLES
            ========================= */

            await tx.userRole.deleteMany({
                where: {
                    userId: {
                        notIn: incomingUserIds,
                    },
                },
            });

            /* =========================
               10. UPDATE SYNC CURSOR
            ========================= */

            const now = new Date();

            await tx.syncCursor.upsert({
                where: {
                    branchId,
                },

                create: {
                    branchId,

                    lastVersion: snapshotVersion,

                    lastPullAt: now,

                    lastSuccessfulSyncAt: now,
                },

                update: {
                    lastVersion: snapshotVersion,

                    lastPullAt: now,

                    lastSuccessfulSyncAt: now,

                    lastError: null,
                },
            });

            /* =========================
               IMPORT RESULT
            ========================= */

            return {
                databaseName,

                branchId,

                branchCode:
                    snapshot.branch.branchCode,

                snapshotId:
                    snapshot.snapshotId,

                snapshotVersion:
                    snapshot.snapshotVersion,

                importedUsers:
                    snapshot.users.length,

                activeUsers:
                    snapshot.summary.activeUsers,

                inactiveUsers:
                    snapshot.summary.inactiveUsers,

                importedRoles:
                    snapshot.roles.length,

                importedPermissions:
                    snapshot.permissions.length,

                importedUserRoles:
                    snapshot.userRoles.length,

                importedRolePermissions:
                    snapshot.rolePermissions.length,

                importedUserBranches:
                    snapshot.userBranches.length,

                removedAssignments:
                    removedUserIds.length,

                deactivatedUsers:
                    deactivatedUsers.count,

                completedAt: now.toISOString(),
            };
        },

        {
            isolationLevel: "Serializable",

            maxWait: 10_000,

            timeout: 120_000,
        }
    );
}