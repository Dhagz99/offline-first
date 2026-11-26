import type {
    Prisma,
} from "../../../../../generated/prisma/client";

import type {
    UserAccessPayload,
    UserAccessDeletePayload,
} from "@repo/shared";

/* =========================
   UPSERT USER ACCESS
========================= */

export async function applyUserAccessUpsert(
    tx: Prisma.TransactionClient,

    payload: UserAccessPayload
) {

    /* =========================
       UPSERT PERMISSIONS
    ========================= */

    for (const permission of payload.permissions) {

        const {
            id,
            createdAt,
            updatedAt,
            ...fields
        } = permission;

        const data = {
            ...fields,

            createdAt: new Date(createdAt),

            updatedAt: new Date(updatedAt),
        };

        await tx.permission.upsert({
            where: {
                id,
            },

            create: {
                id,
                ...data,
            },

            update: data,
        });
    }

    /* =========================
       UPSERT ROLES
    ========================= */

    for (const role of payload.roles) {

        const {
            id,
            createdAt,
            updatedAt,
            ...fields
        } = role;

        const data = {
            ...fields,

            createdAt: new Date(createdAt),

            updatedAt: new Date(updatedAt),
        };

        await tx.role.upsert({
            where: {
                id,
            },

            create: {
                id,
                ...data,
            },

            update: data,
        });
    }

    /* =========================
       REPLACE ROLE PERMISSIONS
    ========================= */

    for (const role of payload.roles) {

        const assignments =
            payload.rolePermissions.filter(
                (item) => item.roleId === role.id
            );

        await tx.rolePermission.deleteMany({
            where: {
                roleId: role.id,
            },
        });

        if (assignments.length > 0) {

            await tx.rolePermission.createMany({
                data: assignments,
            });
        }
    }

    /* =========================
       UPSERT USER
    ========================= */

    const {
        id: userId,
        createdAt,
        updatedAt,
        ...userFields
    } = payload.user;

    const userData = {
        ...userFields,

        createdAt: new Date(createdAt),

        updatedAt: new Date(updatedAt),
    };

    await tx.user.upsert({
        where: {
            id: userId,
        },

        create: {
            id: userId,

            ...userData,
        },

        update: userData,
    });

    /* =========================
       REPLACE USER ROLES
    ========================= */

    await tx.userRole.deleteMany({
        where: {
            userId,
        },
    });

    if (payload.userRoles.length > 0) {

        await tx.userRole.createMany({
            data: payload.userRoles.map(
                (assignment) => ({
                    userId:
                        assignment.userId,

                    roleId:
                        assignment.roleId,

                    assignedAt:
                        new Date(
                            assignment.assignedAt
                        ),
                })
            ),
        });
    }

    /* =========================
       REPLACE BRANCH ASSIGNMENT
    ========================= */

    await tx.userBranch.deleteMany({
        where: {
            userId,
        },
    });

    await tx.userBranch.createMany({
        data: payload.userBranches.map(
            (assignment) => ({
                userId:
                    assignment.userId,

                branchId:
                    assignment.branchId,

                assignedAt:
                    new Date(
                        assignment.assignedAt
                    ),
            })
        ),
    });
}

/* =========================
   REMOVE USER ACCESS
========================= */

export async function applyUserAccessDelete(
    tx: Prisma.TransactionClient,

    payload: UserAccessDeletePayload
) {

    const {
        userId,
        branchId,
    } = payload;

    /* =========================
       REMOVE BRANCH ASSIGNMENT
    ========================= */

    await tx.userBranch.deleteMany({
        where: {
            userId,
            branchId,
        },
    });

    /* =========================
       REMOVE USER ROLES
    ========================= */

    await tx.userRole.deleteMany({
        where: {
            userId,
        },
    });

    /* =========================
       DEACTIVATE USER
    ========================= */

    await tx.user.updateMany({
        where: {
            id: userId,
        },

        data: {
            isActive: false,
        },
    });
}