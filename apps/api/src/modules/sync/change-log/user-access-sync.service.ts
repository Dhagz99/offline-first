import type {
    Prisma,
} from "../../../../generated/prisma/client";

import {
    SyncEntityType,
} from "./change-log.types";

import {
    appendChangeLog,
} from "./change-log.service";

/* =========================
   GET USER BRANCH IDS
========================= */

export async function getUserBranchIds(
    tx: Prisma.TransactionClient,
    userId: string
): Promise<string[]> {

    const assignments =
        await tx.userBranch.findMany({
            where: {
                userId,
            },

            select: {
                branchId: true,
            },
        });

    return assignments.map(
        (assignment) => assignment.branchId
    );
}

/* =========================
   BUILD USER ACCESS PAYLOAD
========================= */

export async function buildUserAccessPayload(
    tx: Prisma.TransactionClient,
    userId: string,
    branchId: string
): Promise<Prisma.InputJsonObject> {

    const user =
        await tx.user.findUniqueOrThrow({
            where: {
                id: userId,
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
        });

    const userBranches =
        await tx.userBranch.findMany({
            where: {
                userId,
                branchId,
            },

            select: {
                userId: true,
                branchId: true,
                assignedAt: true,
            },
        });

    if (userBranches.length !== 1) {
        throw new Error(
            "User is not assigned to the target branch"
        );
    }

    const userRoles =
        await tx.userRole.findMany({
            where: {
                userId,
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
                (item) => item.roleId
            )
        ),
    ];

    const roles =
        await tx.role.findMany({
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
        });

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
        });

    return {
        user: {
            ...user,

            createdAt:
                user.createdAt.toISOString(),

            updatedAt:
                user.updatedAt.toISOString(),
        },

        roles: roles.map((role) => ({
            ...role,

            createdAt:
                role.createdAt.toISOString(),

            updatedAt:
                role.updatedAt.toISOString(),
        })),

        permissions: permissions.map(
            (permission) => ({
                ...permission,

                createdAt:
                    permission.createdAt.toISOString(),

                updatedAt:
                    permission.updatedAt.toISOString(),
            })
        ),

        userRoles: userRoles.map(
            (assignment) => ({
                ...assignment,

                assignedAt:
                    assignment.assignedAt.toISOString(),
            })
        ),

        rolePermissions,

        userBranches: userBranches.map(
            (assignment) => ({
                ...assignment,

                assignedAt:
                    assignment.assignedAt.toISOString(),
            })
        ),
    };
}

/* =========================
   PUBLISH USER ACCESS
========================= */

export async function publishUserAccessChanges(
    tx: Prisma.TransactionClient,

    userId: string,

    previousBranchIds: string[]
) {

    const currentBranchIds =
        await getUserBranchIds(
            tx,
            userId
        );

    const previous =
        new Set(previousBranchIds);

    const current =
        new Set(currentBranchIds);

    /* =========================
       REMOVED BRANCH ASSIGNMENTS
    ========================= */

    for (const branchId of previous) {

        if (!current.has(branchId)) {

            await appendChangeLog(tx, {
                branchId,

                entityType:
                    SyncEntityType.USER_ACCESS,

                entityId: userId,

                operation: "DELETE",

                payload: {
                    userId,
                    branchId,

                    reason:
                        "BRANCH_ACCESS_REMOVED",
                },
            });
        }
    }

    /* =========================
       CURRENT BRANCH ASSIGNMENTS
    ========================= */

    for (const branchId of current) {

        const payload =
            await buildUserAccessPayload(
                tx,
                userId,
                branchId
            );

        await appendChangeLog(tx, {
            branchId,

            entityType:
                SyncEntityType.USER_ACCESS,

            entityId: userId,

            operation: previous.has(branchId)
                ? "UPDATE"
                : "CREATE",

            payload,
        });
    }
}

/* =========================
   PUBLISH USER DELETION
========================= */

export async function publishUserDeletion(
    tx: Prisma.TransactionClient,

    userId: string,

    branchIds: string[]
) {

    for (const branchId of new Set(branchIds)) {

        await appendChangeLog(tx, {
            branchId,

            entityType:
                SyncEntityType.USER_ACCESS,

            entityId: userId,

            operation: "DELETE",

            payload: {
                userId,
                branchId,

                reason: "USER_DELETED",
            },
        });
    }
}

/* =========================
   PUBLISH ROLE CHANGES
========================= */

export async function publishRoleAccessChanges(
    tx: Prisma.TransactionClient,
    roleId: string
) {

    const assignments =
        await tx.userRole.findMany({
            where: {
                roleId,
            },

            select: {
                userId: true,
            },
        });

    const userIds = [
        ...new Set(
            assignments.map(
                (assignment) =>
                    assignment.userId
            )
        ),
    ];

    for (const userId of userIds) {

        const branchIds =
            await getUserBranchIds(
                tx,
                userId
            );

        await publishUserAccessChanges(
            tx,
            userId,
            branchIds
        );
    }
}