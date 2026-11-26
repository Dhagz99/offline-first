export type SyncWorkerStatus =
    | "DISABLED"
    | "IDLE"
    | "SYNCING"
    | "WAITING"
    | "RETRYING"
    | "STOPPING"
    | "STOPPED";

export interface SyncWorkerState {
    status: SyncWorkerStatus;

    enabled: boolean;
    running: boolean;

    consecutiveFailures: number;

    totalCycles: number;
    successfulCycles: number;
    failedCycles: number;

    lastStartedAt: string | null;
    lastCompletedAt: string | null;
    lastSuccessfulAt: string | null;
    lastFailedAt: string | null;

    nextRunAt: string | null;

    lastError: string | null;
    lastDurationMs: number | null;
}