
import { z } from "zod";

const versionSchema = z.string().regex(/^\d+$/);

export const branchConnectionStatusSchema = z.enum([
    "ONLINE",
    "OFFLINE",
    "NEVER_CONNECTED",
    "INACTIVE",
]);

export const branchSyncStatusSchema = z.enum([
    "UP_TO_DATE",
    "BEHIND",
    "ERROR",
    "DISABLED",
    "UNKNOWN",
]);

export const branchSyncMonitoringSchema = z.object({
    branchId: z.uuid(),
    branchCode: z.string(),
    branchName: z.string(),
    address: z.string().nullable(),
    isActive: z.boolean(),

    connectionStatus: branchConnectionStatusSchema,
    syncStatus: branchSyncStatusSchema,

    localVersion: versionSchema.nullable(),
    centralVersion: versionSchema,
    lastKnownCentralVersion: versionSchema.nullable(),
    versionLag: versionSchema.nullable(),

    syncEnabled: z.boolean().nullable(),
    intervalMs: z.number().int().positive().nullable(),

    consecutiveFailures: z.number().int().nonnegative(),

    lastHeartbeatAt: z.iso.datetime().nullable(),
    heartbeatAgeSeconds: z.number().nonnegative().nullable(),
    offlineThresholdSeconds: z.number().positive(),

    lastSuccessfulSyncAt: z.iso.datetime().nullable(),
    nextRetryAt: z.iso.datetime().nullable(),
    lastErrorCode: z.string().nullable(),
});

export const syncMonitoringSummarySchema = z.object({
    totalBranches: z.number().int().nonnegative(),
    activeBranches: z.number().int().nonnegative(),
    inactiveBranches: z.number().int().nonnegative(),

    onlineBranches: z.number().int().nonnegative(),
    offlineBranches: z.number().int().nonnegative(),
    neverConnectedBranches: z.number().int().nonnegative(),

    upToDateBranches: z.number().int().nonnegative(),
    behindBranches: z.number().int().nonnegative(),
    errorBranches: z.number().int().nonnegative(),
    disabledBranches: z.number().int().nonnegative(),
    unknownBranches: z.number().int().nonnegative(),
});

export const syncMonitoringResponseSchema = z.object({
    generatedAt: z.iso.datetime(),
    centralVersion: versionSchema,

    summary: syncMonitoringSummarySchema,

    branches: z.array(branchSyncMonitoringSchema),
});

export type BranchConnectionStatus = z.infer<
    typeof branchConnectionStatusSchema
>;

export type BranchSyncStatus = z.infer<
    typeof branchSyncStatusSchema
>;

export type BranchSyncMonitoring = z.infer<
    typeof branchSyncMonitoringSchema
>;

export type SyncMonitoringSummary = z.infer<
    typeof syncMonitoringSummarySchema
>;

export type SyncMonitoringResponse = z.infer<
    typeof syncMonitoringResponseSchema
>;
