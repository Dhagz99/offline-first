import "dotenv/config";

import { prisma } from "../src/lib/database/prisma";

import {
    seedPermissions,
    seedRoles,
    seedSyncCounter,
} from "./seeders";

async function main() {
    const appMode = process.env.APP_MODE;

    // Only allow central database initialization.
    if (appMode !== "CENTRAL") {
        throw new Error(
            `Database seeding is only allowed in CENTRAL mode. Current mode: ${appMode}`
        );
    }

    console.log("========================================");
    console.log("Starting Central Database Seed");
    console.log("Application Mode:", appMode);
    console.log("========================================");

    await prisma.$transaction(
        async (tx) => {
            await seedPermissions(tx);

            await seedRoles(tx);

            await seedSyncCounter(tx);
        },
        {
            maxWait: 10000,
            timeout: 30000,
        }
    );

    console.log("========================================");
    console.log("Central database seed completed");
    console.log("========================================");
}

main()
    .catch((error) => {
        console.error("Database seed failed:", error);

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });