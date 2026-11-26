
import { appConfig } from "@/config/app.config";
import { env } from "@/config/env";
import { prisma } from "@/lib/database/prisma";

import type {
    SyncWorkerState,
} from "../worker/sync-worker.types";

type HeartbeatOptions = {
    state: SyncWorkerState;
    lastKnownCentralVersion: string | null;
    nextRetryAt: string | null;
};

export async function reportBranchHeartbeat({
    state,
    lastKnownCentralVersion,
    nextRetryAt,
}: HeartbeatOptions): Promise<void> {

    const {
        id: branchId,
        apiKey,
    } = appConfig.branch;

    const {
        centralApiUrl,
        requestTimeoutMs,
        intervalMs,
    } = appConfig.sync;

    if (
        !appConfig.isBranch ||
        !branchId ||
        !apiKey ||
        !centralApiUrl
    ) {
        throw new Error(
            "Invalid heartbeat configuration"
        );
    }

    /* =========================
       LOAD LOCAL SYNC CURSOR
    ========================= */

    const cursor =
        await prisma.syncCursor.findUnique({
            where: {
                branchId,
            },

            select: {
                lastVersion: true,
                lastSuccessfulSyncAt: true,
            },
        });

    if (!cursor) {
        throw new Error(
            "Branch synchronization cursor not found"
        );
    }

    /* =========================
       BUILD HEARTBEAT PAYLOAD
    ========================= */

    const payload = {
        localVersion:
            cursor.lastVersion.toString(),

        lastKnownCentralVersion:
            lastKnownCentralVersion ??
            cursor.lastVersion.toString(),

        syncEnabled:
            state.enabled,

        intervalMs,

        consecutiveFailures:
            state.consecutiveFailures,

        lastSuccessfulSyncAt:
            cursor.lastSuccessfulSyncAt
                ?.toISOString() ?? null,

        nextRetryAt,

        lastErrorCode:
            state.consecutiveFailures > 0
                ? "SYNC_CYCLE_FAILED"
                : null,
    };

    /* =========================
       BUILD CENTRAL URL
    ========================= */

    const url = new URL(
        `${centralApiUrl.replace(/\/+$/, "")}/sync/heartbeat`
    );

    if (
        env.NODE_ENV === "production" &&
        url.protocol !== "https:"
    ) {
        throw new Error(
            "Heartbeat requires HTTPS in production"
        );
    }

    /* =========================
       SEND HEARTBEAT
    ========================= */

    const response = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-branch-api-key": apiKey,
        },

        body: JSON.stringify(payload),

        signal: AbortSignal.timeout(
            requestTimeoutMs
        ),

        redirect: "error",

        cache: "no-store",
    });

    const successful = response.ok;

    await response.body?.cancel();

    if (!successful) {
        throw new Error(
            `Heartbeat rejected: HTTP ${response.status}`
        );
    }
}
