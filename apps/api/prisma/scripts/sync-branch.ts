import {
    prisma,
} from "../../src/lib/database/prisma";

import {
    synchronizeBranchService,
} from "../../src/modules/sync/apply/sync-apply.service";

import {
    SyncApplyError,
} from "../../src/modules/sync/apply/sync-apply.types";

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
        "        BRANCH SYNCHRONIZATION"
    );

    console.log(
        "========================================"
    );

    console.log("");

    try {

        const result =
            await synchronizeBranchService();

        console.table({
            Branch:
                result.branchCode,

            "Initial Version":
                result.initialVersion,

            "Final Version":
                result.finalVersion,

            "Central Version":
                result.latestVersion,

            "Total Batches":
                result.totalBatches,

            "Received Events":
                result.receivedEvents,

            "Applied Events":
                result.appliedEvents,

            "Skipped Events":
                result.skippedEvents,

            "Has More":
                result.hasMore,

            Duration:
                `${result.durationMs} ms`,
        });

        console.log("");

        if (result.hasMore) {

            console.log(
                "Synchronization batch limit reached."
            );

            console.log(
                "Run synchronization again to continue."
            );

        } else {

            console.log(
                "Branch synchronization completed successfully."
            );
        }

        console.log("");

    } catch (error) {

        console.error("");

        console.error(
            "========================================"
        );

        console.error(
            "         SYNCHRONIZATION FAILED"
        );

        console.error(
            "========================================"
        );

        if (
            error instanceof SyncApplyError ||
            error instanceof BranchPullError
        ) {

            console.error(
                `Code: ${error.code}`
            );

            console.error(
                `Message: ${error.message}`
            );

            if (
                error instanceof SyncApplyError &&
                error.eventId
            ) {
                console.error(
                    `Event ID: ${error.eventId}`
                );
            }

        } else {

            console.error(
                "Unexpected synchronization failure"
            );
        }

        console.error(
            "Previously committed batches remain saved."
        );

        console.error(
            "Any failed application transaction is rolled back."
        );

        process.exitCode = 1;

    } finally {

        await prisma.$disconnect();
    }
}

main().catch(() => {

    console.error(
        "Unexpected synchronization script failure"
    );

    process.exitCode = 1;
});