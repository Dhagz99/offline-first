import { appConfig } from "@/config/app.config";
import {
    getBranchPullConfig,

    pullBranchChanges,
} from "../pull/branch/branch-pull.client";

import {
    getBranchPullStateRepo,
} from "../pull/branch/branch-pull.repository";

import {
    applySyncBatchRepo,
} from "./sync-apply.repository";

import {
    SyncApplyError,

    type BranchSyncResult,
} from "./sync-apply.types";

/* =========================
   SYNCHRONIZATION OPTIONS
========================= */

type BranchSyncOptions = {
    maxBatches?: number;
};

/* =========================
   SYNCHRONIZE BRANCH
========================= */

export async function synchronizeBranchService(
    options: BranchSyncOptions = {}
): Promise<BranchSyncResult> {

    const startedAt = Date.now();

    const {
         maxBatches = appConfig.sync.maxBatchesPerCycle,
    } = options;

    if (
        !Number.isInteger(maxBatches) ||
        maxBatches < 1 ||
        maxBatches > 1000
    ) {
        throw new SyncApplyError(
            "INVALID_CONFIGURATION",
            "Invalid maximum synchronization batch count"
        );
    }

    /* =========================
       LOAD CONFIGURATION
    ========================= */

    const config =
        getBranchPullConfig();

    /* =========================
       READ INITIAL CURSOR
    ========================= */

    const state =
        await getBranchPullStateRepo(
            config
        );

    const initialVersion =
        state.cursor.lastVersion.toString();

    let currentVersion =
        initialVersion;

    let latestVersion =
        initialVersion;

    let totalBatches = 0;

    let receivedEvents = 0;

    let appliedEvents = 0;

    let skippedEvents = 0;

    let hasMore = true;

    /* =========================
       PULL AND APPLY LOOP
    ========================= */

    while (
        hasMore &&
        totalBatches < maxBatches
    ) {

        /* =========================
           PULL NEXT BATCH
        ========================= */

        const data =
            await pullBranchChanges(
                config,

                {
                    afterVersion:
                        currentVersion,

                    limit:
                        config.batchSize,
                }
            );

        /* =========================
           APPLY BATCH
        ========================= */

        const result =
            await applySyncBatchRepo(
                data,

                currentVersion
            );

        /* =========================
           UPDATE RESULT
        ========================= */

        totalBatches+= 1;

        receivedEvents +=
            result.receivedEvents;

        appliedEvents +=
            result.appliedEvents;

        skippedEvents +=
            result.skippedEvents;

        currentVersion =
            result.nextVersion;

        latestVersion =
            result.latestVersion;

        hasMore =
            result.hasMore;
    }

    return {
        branchId:
            config.branchId,

        branchCode:
            config.branchCode,

        initialVersion,

        finalVersion:
            currentVersion,

        latestVersion,

        totalBatches,

        receivedEvents,

        appliedEvents,

        skippedEvents,

        hasMore,

        durationMs:
            Date.now() - startedAt,
    };
}