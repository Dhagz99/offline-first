import type {
    ProvisioningSnapshot,
} from "@repo/shared";

import { appConfig } from "@/config/app.config";

/* =========================
   DUPLICATE VALIDATION
========================= */

function assertUnique(
    values: string[],
    label: string
) {
    if (new Set(values).size !== values.length) {
        throw new Error(
            `Duplicate records detected: ${label}`
        );
    }
}

/* =========================
   SNAPSHOT VALIDATION
========================= */

export function validateProvisioningSnapshot(
    snapshot: ProvisioningSnapshot
): void {

    if (!appConfig.isBranch) {
        throw new Error(
            "Provisioning requires BRANCH mode"
        );
    }

    const branchId = appConfig.branch.id;

    const branchCode = appConfig.branch.code;

    if (!branchId || !branchCode) {
        throw new Error(
            "Local branch identity is not configured"
        );
    }

    /* =========================
       BRANCH IDENTITY
    ========================= */

    if (snapshot.branch.id !== branchId) {
        throw new Error(
            "Provisioning branch ID mismatch"
        );
    }

    if (snapshot.branch.branchCode !== branchCode) {
        throw new Error(
            "Provisioning branch code mismatch"
        );
    }

    if (!snapshot.branch.isActive) {
        throw new Error(
            "Cannot provision an inactive branch"
        );
    }

    /* =========================
       SNAPSHOT VERSION
    ========================= */

    if (
        BigInt(snapshot.snapshotVersion) >
        9223372036854775807n
    ) {
        throw new Error(
            "Snapshot version exceeds PostgreSQL BigInt range"
        );
    }

    /* =========================
       DUPLICATE RECORDS
    ========================= */

    assertUnique(
        snapshot.users.map((user) => user.id),
        "users"
    );

    assertUnique(
        snapshot.users.map((user) => user.username),
        "usernames"
    );

    assertUnique(
        snapshot.users.flatMap(
            (user) => user.email === null
                ? []
                : [user.email]
        ),
        "user emails"
    );

    assertUnique(
        snapshot.roles.map((role) => role.id),
        "roles"
    );

    assertUnique(
        snapshot.permissions.map(
            (permission) => permission.id
        ),
        "permissions"
    );

    assertUnique(
        snapshot.userRoles.map(
            (item) => `${item.userId}:${item.roleId}`
        ),
        "user roles"
    );

    assertUnique(
        snapshot.rolePermissions.map(
            (item) =>
                `${item.roleId}:${item.permissionId}`
        ),
        "role permissions"
    );

    assertUnique(
        snapshot.userBranches.map(
            (item) => `${item.userId}:${item.branchId}`
        ),
        "user branches"
    );

    /* =========================
       RELATIONSHIP SETS
    ========================= */

    const userIds = new Set(
        snapshot.users.map((user) => user.id)
    );

    const roleIds = new Set(
        snapshot.roles.map((role) => role.id)
    );

    const permissionIds = new Set(
        snapshot.permissions.map(
            (permission) => permission.id
        )
    );

    /* =========================
       USER ROLES
    ========================= */

    for (const item of snapshot.userRoles) {
        if (!userIds.has(item.userId)) {
            throw new Error(
                "User role references an unknown user"
            );
        }

        if (!roleIds.has(item.roleId)) {
            throw new Error(
                "User role references an unknown role"
            );
        }
    }

    /* =========================
       ROLE PERMISSIONS
    ========================= */

    for (const item of snapshot.rolePermissions) {
        if (!roleIds.has(item.roleId)) {
            throw new Error(
                "Role permission references an unknown role"
            );
        }

        if (!permissionIds.has(item.permissionId)) {
            throw new Error(
                "Role permission references an unknown permission"
            );
        }
    }

    /* =========================
       USER BRANCHES
    ========================= */

    const assignedUserIds = new Set<string>();

    for (const item of snapshot.userBranches) {
        if (!userIds.has(item.userId)) {
            throw new Error(
                "Branch assignment references an unknown user"
            );
        }

        if (item.branchId !== branchId) {
            throw new Error(
                "Snapshot contains another branch assignment"
            );
        }

        assignedUserIds.add(item.userId);
    }

    /* =========================
       VERIFY EVERY USER
    ========================= */

    for (const user of snapshot.users) {
        if (!assignedUserIds.has(user.id)) {
            throw new Error(
                "Snapshot contains an unassigned user"
            );
        }
    }

    /* =========================
       VERIFY SUMMARY
    ========================= */

    const activeUsers = snapshot.users.filter(
        (user) => user.isActive
    ).length;

    const summary = snapshot.summary;

    if (
        summary.totalUsers !== snapshot.users.length ||
        summary.activeUsers !== activeUsers ||
        summary.inactiveUsers !==
            snapshot.users.length - activeUsers ||
        summary.totalRoles !== snapshot.roles.length ||
        summary.totalPermissions !==
            snapshot.permissions.length ||
        summary.totalUserRoles !==
            snapshot.userRoles.length ||
        summary.totalRolePermissions !==
            snapshot.rolePermissions.length ||
        summary.totalUserBranches !==
            snapshot.userBranches.length
    ) {
        throw new Error(
            "Provisioning snapshot summary mismatch"
        );
    }

    console.log(
        "[PROVISIONING] Snapshot validation passed"
    );
}