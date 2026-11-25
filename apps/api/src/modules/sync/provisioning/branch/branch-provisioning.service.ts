import { appConfig } from "@/config/app.config";

import {
    downloadProvisioningSnapshot,
} from "./branch-provisioning.client";

import {
    validateProvisioningSnapshot,
} from "./branch-provisioning.validator";

import {
    importProvisioningSnapshotRepo,
} from "./branch-provisioning.repository";

/* =========================
   PROVISION BRANCH
========================= */

export async function provisionBranchService() {

    if (!appConfig.isBranch) {
        throw new Error(
            "Provisioning can only run in BRANCH mode"
        );
    }

    if (!appConfig.branch.id) {
        throw new Error(
            "BRANCH_ID is not configured"
        );
    }

    if (!appConfig.branch.code) {
        throw new Error(
            "BRANCH_CODE is not configured"
        );
    }

    console.log(
        "[PROVISIONING] Starting branch provisioning"
    );

    console.log(
        `[PROVISIONING] Branch: ${appConfig.branch.code}`
    );

    /* =========================
       DOWNLOAD SNAPSHOT
    ========================= */

    const snapshot =
        await downloadProvisioningSnapshot();

    /* =========================
       VALIDATE SNAPSHOT
    ========================= */

    validateProvisioningSnapshot(snapshot);

    console.log(
        `[PROVISIONING] Users: ${snapshot.summary.totalUsers}`
    );

    console.log(
        `[PROVISIONING] Roles: ${snapshot.summary.totalRoles}`
    );

    console.log(
        `[PROVISIONING] Permissions: ${snapshot.summary.totalPermissions}`
    );

    /* =========================
       IMPORT DATABASE RECORDS
    ========================= */

    console.log(
        "[PROVISIONING] Importing snapshot into local database..."
    );

    const result =
        await importProvisioningSnapshotRepo(
            snapshot
        );

    console.log(
        "[PROVISIONING] Database transaction completed"
    );

    return result;
}