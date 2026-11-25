import type { Prisma } from "../../generated/prisma/client";

export async function seedRoles(
    tx: Prisma.TransactionClient
) {
    const roles = [
        {
            name: "ADMIN",
            description: "Central system administrator",
            permissions: [
                "USER_MANAGE",
                "ADMIN_MANAGE",
                "BRANCH_MANAGE",
                "BRANCH_VIEW",
                "SYNC_VIEW",
                "SYNC_MANAGE",
            ],
        },
        {
            name: "BRANCH_ADMIN",
            description: "Local branch administrator",
            permissions: [
                "BRANCH_VIEW",
                "SYNC_VIEW",
            ],
        },
        {
            name: "USER",
            description: "Regular system user",
            permissions: [],
        },
    ];

    for (const role of roles) {
        const createdRole = await tx.role.upsert({
            where: {
                name: role.name,
            },
            update: {
                description: role.description,
            },
            create: {
                name: role.name,
                description: role.description,
            },
        });

        for (const permissionCode of role.permissions) {
            const permission = await tx.permission.findUnique({
                where: {
                    code: permissionCode,
                },
            });

            if (!permission) {
                throw new Error(
                    `Permission "${permissionCode}" not found.`
                );
            }

            await tx.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: createdRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: createdRole.id,
                    permissionId: permission.id,
                },
            });
        }

        console.log(`Role seeded: ${role.name}`);
    }

    console.log("Roles seeded successfully");
}