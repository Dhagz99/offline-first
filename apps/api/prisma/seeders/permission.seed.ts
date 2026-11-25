import type { Prisma } from "../../generated/prisma/client";

export async function seedPermissions(
    tx: Prisma.TransactionClient
) {
    const permissions = [
        {
            code: "USER_MANAGE",
            name: "Manage Users",
            description: "Manage system user accounts",
        },
        {
            code: "ADMIN_MANAGE",
            name: "Manage Admin",
            description: "Manage administrative settings",
        },
        {
            code: "BRANCH_MANAGE",
            name: "Manage Branches",
            description: "Create and manage branch registrations",
        },
        {
            code: "BRANCH_VIEW",
            name: "View Branches",
            description: "View registered branches",
        },
        {
            code: "SYNC_VIEW",
            name: "View Synchronization",
            description: "View synchronization status and history",
        },
        {
            code: "SYNC_MANAGE",
            name: "Manage Synchronization",
            description: "Manage synchronization and resolve conflicts",
        },
    ];

    for (const permission of permissions) {
        await tx.permission.upsert({
            where: {
                code: permission.code,
            },
            update: {
                name: permission.name,
                description: permission.description,
            },
            create: permission,
        });
    }

    console.log("Permissions seeded successfully");
}