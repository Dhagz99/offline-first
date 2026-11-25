import type {
    AuthUserRecord,
} from "./auth.repository";

import type {
    AuthUser,
} from "./auth.types";

export function mapAuthenticatedUser(
    user: AuthUserRecord
): AuthUser {

    const roles = [
        ...new Set(
            user.roles.map(
                (userRole) => userRole.role.name
            )
        ),
    ];

    const permissions = [
        ...new Set(
            user.roles.flatMap(
                (userRole) =>
                    userRole.role.permissions.map(
                        (rolePermission) =>
                            rolePermission.permission.code
                    )
            )
        ),
    ];

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        roles,
        permissions,
    };
}