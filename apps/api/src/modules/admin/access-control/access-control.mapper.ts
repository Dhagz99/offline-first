
import { User } from "@repo/shared";
import { SelectedUser } from "./access-control.repository";
import { Role } from "@repo/shared";
import { Permission } from "@repo/shared";

export function mapUser(user: SelectedUser): User {
    const roles: Role[] = user.roles.map(
        ({ role }) => ({
            id: role.id,
            name: role.name,
            description: role.description,

            permissions: role.permissions.map(
                ({ permission }): Permission => ({
                    id: permission.id,
                    code: permission.code,
                    name: permission.name,
                    description: permission.description ?? "",
                })
            ),
        })
    );

    /* =====================
       COMBINE PERMISSIONS
    ===================== */

    const permissionMap = new Map<string, Permission>();

    for (const role of roles) {
        for (const permission of role.permissions ?? []) {
            permissionMap.set(
                permission.id,
                permission
            );
        }
    }

    /* =====================
       MAP BRANCHES
    ===================== */

    const branches = user.branches.map(
        ({ branch }) => ({
            id: branch.id,
            branchCode: branch.branchCode,
            branchName: branch.branchName,
            isActive: branch.isActive,
        })
    );

    /* =====================
       RETURN USER
    ===================== */

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email ?? "",
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),

        roles,

        permissions: Array.from(
            permissionMap.values()
        ),

        branches,
    };
}
export function mapRole(role: any) {
    return {
        id: role.id,
        name: role.name,
        description: role.description,

        permissions: role.permissions.map(
            (item: any) => ({
                id: item.permission.id,
                code: item.permission.code,
                name: item.permission.name,
            })
        ),
    };
}