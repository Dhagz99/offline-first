type AuthUserWithRoles = {
    id: string;
    name: string;
    username: string;

    roles: Array<{
        role: {
            id: string;
            name: string;
            description: string | null;

            permissions: Array<{
                permission: {
                    id: string;
                    code: string;
                    name: string;
                    description: string | null;
                };
            }>;
        };
    }>;
};

export function mapAuthenticatedUser(user: AuthUserWithRoles) {
    const permissions = [
        ...new Set(
            user.roles.flatMap((userRole) =>
                userRole.role.permissions.map(
                    (rolePermission) => rolePermission.permission.code
                )
            )
        ),
    ];

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        roles: user.roles.map(
            (userRole) => userRole.role.name
        ),
        permissions,
    };
}