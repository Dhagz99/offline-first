
import {
    syncMonitoringResponseSchema,
    type BranchConnectionStatus,
    type BranchSyncStatus,
    type BranchSyncMonitoring,
    type SyncMonitoringResponse,
} from "@repo/shared";

import { getSyncMonitoringRepo } from "./sync-monitoring.repository";

const DEFAULT_INTERVAL_MS = 10_000;
const MIN_OFFLINE_THRESHOLD_MS = 30_000;
const HEARTBEAT_INTERVAL_MULTIPLIER = 3;

function getConnectionStatus({
    isActive,
    heartbeatAgeMs,
    offlineThresholdMs,
}: {
    isActive: boolean;
    heartbeatAgeMs: number | null;
    offlineThresholdMs: number;
}): BranchConnectionStatus {
    if (!isActive) {
        return "INACTIVE";
    }

    if (heartbeatAgeMs === null) {
        return "NEVER_CONNECTED";
    }

    if (heartbeatAgeMs >= offlineThresholdMs) {
        return "OFFLINE";
    }

    return "ONLINE";
}

function getSyncStatus({
    connectionStatus,
    syncEnabled,
    consecutiveFailures,
    localVersion,
    centralVersion,
}: {
    connectionStatus: BranchConnectionStatus;
    syncEnabled: boolean | null;
    consecutiveFailures: number;
    localVersion: bigint | null;
    centralVersion: bigint;
}): BranchSyncStatus {
    if (connectionStatus !== "ONLINE") {
        return "UNKNOWN";
    }

    if (syncEnabled === false) {
        return "DISABLED";
    }

    if (consecutiveFailures > 0) {
        return "ERROR";
    }

    if (localVersion === null) {
        return "UNKNOWN";
    }

    // A branch should never be ahead of the central server.
    if (localVersion > centralVersion) {
        return "ERROR";
    }

    if (localVersion < centralVersion) {
        return "BEHIND";
    }

    return "UP_TO_DATE";
}

export async function getSyncMonitoringService():
    Promise<SyncMonitoringResponse> {

    const {
        centralVersion,
        branches,
        heartbeats,
    } = await getSyncMonitoringRepo();

    const now = new Date();

    const heartbeatMap = new Map(
        heartbeats.map((heartbeat) => [
            heartbeat.branchId,
            heartbeat,
        ])
    );

    const monitoringBranches: BranchSyncMonitoring[] =
        branches.map((branch) => {
            const heartbeat = heartbeatMap.get(branch.id);

            const intervalMs =
                heartbeat?.intervalMs ??
                DEFAULT_INTERVAL_MS;

            const offlineThresholdMs = Math.max(
                MIN_OFFLINE_THRESHOLD_MS,
                intervalMs * HEARTBEAT_INTERVAL_MULTIPLIER
            );

            const heartbeatAgeMs =
                heartbeat?.lastHeartbeatAt
                    ? Math.max(
                        0,
                        now.getTime() -
                        heartbeat.lastHeartbeatAt.getTime()
                    )
                    : null;

            const connectionStatus = getConnectionStatus({
                isActive: branch.isActive,
                heartbeatAgeMs,
                offlineThresholdMs,
            });

            const localVersion =
                heartbeat?.localVersion ?? null;

            const syncStatus = getSyncStatus({
                connectionStatus,
                syncEnabled:
                    heartbeat?.syncEnabled ?? null,
                consecutiveFailures:
                    heartbeat?.consecutiveFailures ?? 0,
                localVersion,
                centralVersion,
            });

            const versionLag =
                localVersion === null ||
                localVersion > centralVersion
                    ? null
                    : centralVersion - localVersion;

            return {
                branchId: branch.id,
                branchCode: branch.branchCode,
                branchName: branch.branchName,
                address: branch.address,
                isActive: branch.isActive,

                connectionStatus,
                syncStatus,

                localVersion:
                    localVersion?.toString() ?? null,

                centralVersion:
                    centralVersion.toString(),

                lastKnownCentralVersion:
                    heartbeat?.lastKnownCentralVersion
                        ?.toString() ?? null,

                versionLag:
                    versionLag?.toString() ?? null,

                syncEnabled:
                    heartbeat?.syncEnabled ?? null,

                intervalMs:
                    heartbeat?.intervalMs ?? null,

                consecutiveFailures:
                    heartbeat?.consecutiveFailures ?? 0,

                lastHeartbeatAt:
                    heartbeat?.lastHeartbeatAt
                        ?.toISOString() ?? null,

                heartbeatAgeSeconds:
                    heartbeatAgeMs === null
                        ? null
                        : Math.round(
                            heartbeatAgeMs / 10
                        ) / 100,

                offlineThresholdSeconds:
                    offlineThresholdMs / 1000,

                lastSuccessfulSyncAt:
                    heartbeat?.lastSuccessfulSyncAt
                        ?.toISOString() ?? null,

                nextRetryAt:
                    heartbeat?.nextRetryAt
                        ?.toISOString() ?? null,

                lastErrorCode:
                    heartbeat?.lastErrorCode ?? null,
            };
        });

    const summary = {
        totalBranches: monitoringBranches.length,

        activeBranches: monitoringBranches.filter(
            (branch) => branch.isActive
        ).length,

        inactiveBranches: monitoringBranches.filter(
            (branch) => !branch.isActive
        ).length,

        onlineBranches: monitoringBranches.filter(
            (branch) =>
                branch.connectionStatus === "ONLINE"
        ).length,

        offlineBranches: monitoringBranches.filter(
            (branch) =>
                branch.connectionStatus === "OFFLINE"
        ).length,

        neverConnectedBranches: monitoringBranches.filter(
            (branch) =>
                branch.connectionStatus === "NEVER_CONNECTED"
        ).length,

        upToDateBranches: monitoringBranches.filter(
            (branch) =>
                branch.syncStatus === "UP_TO_DATE"
        ).length,

        behindBranches: monitoringBranches.filter(
            (branch) =>
                branch.syncStatus === "BEHIND"
        ).length,

        errorBranches: monitoringBranches.filter(
            (branch) =>
                branch.syncStatus === "ERROR"
        ).length,

        disabledBranches: monitoringBranches.filter(
            (branch) =>
                branch.syncStatus === "DISABLED"
        ).length,

        unknownBranches: monitoringBranches.filter(
            (branch) =>
                branch.syncStatus === "UNKNOWN"
        ).length,
    };

    return syncMonitoringResponseSchema.parse({
        generatedAt: now.toISOString(),
        centralVersion: centralVersion.toString(),
        summary,
        branches: monitoringBranches,
    });
}
