import {
    prisma,
} from "../../src/lib/database/prisma";

import {
    previewBranchPullService,
} from "../../src/modules/sync/pull/branch/branch-pull.service";

import {
    BranchPullError,
} from "../../src/modules/sync/pull/branch/branch-pull.types";

/* =========================
   MAIN SCRIPT
========================= */

async function main() {

    console.log("");

    console.log(
        "========================================"
    );

    console.log(
        "       BRANCH SYNC PULL PREVIEW"
    );

    console.log(
        "========================================"
    );

    console.log("");

    try {

        const result =
            await previewBranchPullService();

        const data = result.data;

        /* =========================
           SUMMARY
        ========================= */

        console.log(
            "Synchronization response validated successfully."
        );

        console.log("");

        console.table({
            Branch:
                result.branchCode,

            Database:
                result.databaseName,

            "Local Version":
                result.localVersion,

            "From Version":
                data.fromVersion,

            "Next Version":
                data.nextVersion,

            "Central Version":
                data.latestVersion,

            "Received Events":
                data.totalEvents,

            "Has More":
                data.hasMore,

            Duration:
                `${result.durationMs} ms`,
        });

        /* =========================
           DISPLAY EVENT METADATA
        ========================= */

        if (data.events.length > 0) {

            console.log("");

            console.log(
                "Received synchronization events:"
            );

            console.table(
                data.events.map(
                    (event) => ({
                        Version:
                            event.version,

                        Entity:
                            event.entityType,

                        Operation:
                            event.operation,

                        "Entity Version":
                            event.entityVersion,

                        "Entity ID":
                            event.entityId,
                    })
                )
            );

        } else {

            console.log("");

            console.log(
                "No pending synchronization events."
            );
        }

        /* =========================
           PREVIEW NOTICE
        ========================= */

        console.log("");

        console.log(
            "PREVIEW ONLY: No database changes were applied."
        );

        console.log(
            "Local synchronization cursor remains unchanged."
        );

        console.log("");

    } catch (error) {

        console.error("");

        console.error(
            "========================================"
        );

        console.error(
            "          SYNC PULL FAILED"
        );

        console.error(
            "========================================"
        );

        if (
            error instanceof BranchPullError
        ) {

            console.error(
                `Code: ${error.code}`
            );

            console.error(
                `Message: ${error.message}`
            );

            if (error.statusCode) {

                console.error(
                    `HTTP Status: ${error.statusCode}`
                );
            }

        } else {

            console.error(
                "Unexpected synchronization failure"
            );
        }

        process.exitCode = 1;

    } finally {

        await prisma.$disconnect();
    }
}

main().catch(() => {

    console.error(
        "Unexpected branch pull script failure"
    );

    process.exitCode = 1;
});