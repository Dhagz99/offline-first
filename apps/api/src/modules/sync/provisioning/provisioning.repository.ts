import { prisma } from "@/lib/database/prisma";

/* =========================
   PROVISIONING SNAPSHOT
========================= */

export async function getProvisioningSnapshotRepo(
    branchId: string
) {
    return prisma.$transaction(
        async (tx) => {

            /* =========================
               BRANCH IDENTITY
            ========================= */

            const branch = await tx.branch.findUnique({
                where: {
                    id: branchId,
                },

                select: {
                    id: true,
                    branchCode: true,
                    branchName: true,
                    address: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!branch || !branch.isActive) {
                return null;
            }

            /* =========================
               SYNCHRONIZATION VERSION
            ========================= */

            const versionCounter =
                await tx.syncVersionCounter.findUnique({
                    where: {
                        id: 1,
                    },

                    select: {
                        lastVersion: true,
                    },
                });

            if (!versionCounter) {
                throw new Error(
                    "Synchronization version counter is not initialized"
                );
            }

            /* =========================
               ASSIGNED USERS
            ========================= */

            const users = await tx.user.findMany({
                where: {
                    branches: {
                        some: {
                            branchId,
                        },
                    },
                },

                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    password: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },

                orderBy: {
                    username: "asc",
                },
            });

            const userIds = users.map(
                (user) => user.id
            );

            /* =========================
               USER ROLE ASSIGNMENTS
            ========================= */

            const userRoles = await tx.userRole.findMany({
                where: {
                    userId: {
                        in: userIds,
                    },
                },

                select: {
                    userId: true,
                    roleId: true,
                    assignedAt: true,
                },
            });

            const roleIds = [
                ...new Set(
                    userRoles.map(
                        (userRole) => userRole.roleId
                    )
                ),
            ];

            /* =========================
               REQUIRED ROLES
            ========================= */

            const roles = await tx.role.findMany({
                where: {
                    id: {
                        in: roleIds,
                    },
                },

                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                },

                orderBy: {
                    name: "asc",
                },
            });

            /* =========================
               ROLE PERMISSIONS
            ========================= */

            const rolePermissions =
                await tx.rolePermission.findMany({
                    where: {
                        roleId: {
                            in: roleIds,
                        },
                    },

                    select: {
                        roleId: true,
                        permissionId: true,
                    },
                });

            const permissionIds = [
                ...new Set(
                    rolePermissions.map(
                        (item) => item.permissionId
                    )
                ),
            ];

            /* =========================
               REQUIRED PERMISSIONS
            ========================= */

            const permissions =
                await tx.permission.findMany({
                    where: {
                        id: {
                            in: permissionIds,
                        },
                    },

                    select: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        createdAt: true,
                        updatedAt: true,
                    },

                    orderBy: {
                        code: "asc",
                    },
                });

            /* =========================
               LOCAL BRANCH ASSIGNMENTS
            ========================= */

            const userBranches =
                await tx.userBranch.findMany({
                    where: {
                        branchId,

                        userId: {
                            in: userIds,
                        },
                    },

                    select: {
                        userId: true,
                        branchId: true,
                        assignedAt: true,
                    },
                });

            /* =========================
               RETURN SNAPSHOT
            ========================= */

            return {
                branch,

                snapshotVersion:
                    versionCounter.lastVersion,

                users,

                roles,

                permissions,

                userRoles,

                rolePermissions,

                userBranches,
            };
        },

        {
            isolationLevel: "RepeatableRead",

            maxWait: 5_000,

            timeout: 30_000,
        }
    );
}