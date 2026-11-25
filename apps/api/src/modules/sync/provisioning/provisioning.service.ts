import { randomUUID } from "node:crypto";

import {
    provisioningSnapshotSchema,
    type ProvisioningSnapshot,
} from "@repo/shared";

import {
    getProvisioningSnapshotRepo,
} from "./provisioning.repository";
import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";



/* =========================
   GENERATE SNAPSHOT
========================= */

export async function getProvisioningSnapshotService(
    branchId: string
): Promise<ProvisioningSnapshot> {

    const result =
        await getProvisioningSnapshotRepo(
            branchId
        );

    if (!result) {
        throw new AppError(
            "Branch is inactive or unavailable",
            403,
            ErrorCodes.BRANCH_INACTIVE
        );
    }

    /* =========================
       SERIALIZE BRANCH
    ========================= */

    const branch = {
        ...result.branch,

        createdAt:
            result.branch.createdAt.toISOString(),

        updatedAt:
            result.branch.updatedAt.toISOString(),
    };

    /* =========================
       SERIALIZE USERS
    ========================= */

    const users = result.users.map((user) => ({
        ...user,

        createdAt: user.createdAt.toISOString(),

        updatedAt: user.updatedAt.toISOString(),
    }));

    /* =========================
       SERIALIZE ROLES
    ========================= */

    const roles = result.roles.map((role) => ({
        ...role,

        createdAt: role.createdAt.toISOString(),

        updatedAt: role.updatedAt.toISOString(),
    }));

    /* =========================
       SERIALIZE PERMISSIONS
    ========================= */

    const permissions = result.permissions.map(
        (permission) => ({
            ...permission,

            createdAt:
                permission.createdAt.toISOString(),

            updatedAt:
                permission.updatedAt.toISOString(),
        })
    );

    /* =========================
       SERIALIZE USER ROLES
    ========================= */

    const userRoles = result.userRoles.map(
        (userRole) => ({
            ...userRole,

            assignedAt:
                userRole.assignedAt.toISOString(),
        })
    );

    /* =========================
       SERIALIZE USER BRANCHES
    ========================= */

    const userBranches = result.userBranches.map(
        (userBranch) => ({
            ...userBranch,

            assignedAt:
                userBranch.assignedAt.toISOString(),
        })
    );

    /* =========================
       SUMMARY
    ========================= */

    const activeUsers = users.filter(
        (user) => user.isActive
    ).length;

    const inactiveUsers =
        users.length - activeUsers;

    /* =========================
       COMPLETE SNAPSHOT
    ========================= */

    const snapshot: ProvisioningSnapshot = {
        schemaVersion: 1,

        snapshotId: randomUUID(),

        generatedAt: new Date().toISOString(),

        snapshotVersion:
            result.snapshotVersion.toString(),

        branch,

        users,

        roles,

        permissions,

        userRoles,

        rolePermissions: result.rolePermissions,

        userBranches,

        summary: {
            totalUsers: users.length,

            activeUsers,

            inactiveUsers,

            totalRoles: roles.length,

            totalPermissions: permissions.length,

            totalUserRoles: userRoles.length,

            totalRolePermissions:
                result.rolePermissions.length,

            totalUserBranches: userBranches.length,
        },
    };

    return provisioningSnapshotSchema.parse(
        snapshot
    );
}