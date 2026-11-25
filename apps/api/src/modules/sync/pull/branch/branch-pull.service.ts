import {
    getBranchPullConfig,

    pullBranchChanges,
} from "./branch-pull.client";

import {
    getBranchPullStateRepo,
} from "./branch-pull.repository";

import type {
    BranchPullPreviewResult,
} from "./branch-pull.types";

/* =========================
   BRANCH PULL PREVIEW
========================= */

export async function previewBranchPullService():
    Promise<BranchPullPreviewResult> {

    const startedAt = Date.now();

    /* =========================
       LOAD CONFIGURATION
    ========================= */

    const config =
        getBranchPullConfig();

    /* =========================
       READ LOCAL CURSOR
    ========================= */

    const state =
        await getBranchPullStateRepo(
            config
        );

    const localVersion =
        state.cursor.lastVersion.toString();

    /* =========================
       REQUEST CENTRAL CHANGES
    ========================= */

    const data =
        await pullBranchChanges(
            config,

            {
                afterVersion:
                    localVersion,

                limit:
                    config.batchSize,
            }
        );

    /* =========================
       RETURN PREVIEW
    ========================= */

    return {
        branchId:
            config.branchId,

        branchCode:
            config.branchCode,

        databaseName:
            state.databaseName,

        localVersion,

        durationMs:
            Date.now() - startedAt,

        data,
    };
}