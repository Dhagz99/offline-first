import { appConfig } from "@/config/app.config";

import {
    synchronizeBranchService,
} from "../apply/sync-apply.service";

import type {
    SyncWorkerState,
} from "./sync-worker.types";

class BranchSyncWorker {
    private timer: ReturnType<typeof setTimeout> | null = null;

    private activeCycle: Promise<void> | null = null;

    private started = false;
    private stopping = false;

    private state: SyncWorkerState = {
        status: "STOPPED",

        enabled: false,
        running: false,

        consecutiveFailures: 0,

        totalCycles: 0,
        successfulCycles: 0,
        failedCycles: 0,

        lastStartedAt: null,
        lastCompletedAt: null,
        lastSuccessfulAt: null,
        lastFailedAt: null,

        nextRunAt: null,

        lastError: null,
        lastDurationMs: null,
    };

    public getState(): SyncWorkerState {
        return { ...this.state };
    }

    public start(): void {
        if (this.started || this.stopping) {
            return;
        }

        if (
            !appConfig.isBranch ||
            !appConfig.sync.enabled
        ) {
            this.state.enabled = false;
            this.state.status = "DISABLED";

            console.info(
                "[SYNC WORKER] Background synchronization disabled"
            );

            return;
        }

        this.started = true;
        this.stopping = false;

        this.state.enabled = true;
        this.state.status = "IDLE";

        console.info("[SYNC WORKER] Started", {
            branch: appConfig.branch.code,
            intervalMs: appConfig.sync.intervalMs,
            batchSize: appConfig.sync.batchSize,
            maxRetryDelayMs:
                appConfig.sync.maxRetryDelayMs,
        });

        // Run the first synchronization immediately.
        this.scheduleNext(0);
    }

    private scheduleNext(delayMs: number): void {
        if (!this.started || this.stopping) {
            return;
        }

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.state.nextRunAt = new Date(
            Date.now() + delayMs
        ).toISOString();

        this.state.status =
            this.state.consecutiveFailures > 0
                ? "RETRYING"
                : "WAITING";

        this.timer = setTimeout(() => {
            this.timer = null;
            this.state.nextRunAt = null;

            if (
                !this.started ||
                this.stopping ||
                this.activeCycle
            ) {
                return;
            }

            this.activeCycle = this.runCycle()
                .finally(() => {
                    this.activeCycle = null;
                });
        }, delayMs);
    }

    private calculateRetryDelay(): number {
        const interval = appConfig.sync.intervalMs;

        const maximum = Math.max(
            interval,
            appConfig.sync.maxRetryDelayMs
        );

        const exponent = Math.min(
            Math.max(
                this.state.consecutiveFailures - 1,
                0
            ),
            20
        );

        const delay = interval * Math.pow(2, exponent);

        // Small random delay to avoid multiple branches
        // reconnecting at exactly the same time.
        const jitter = Math.floor(
            Math.random() * 1000
        );

        return Math.min(delay + jitter, maximum);
    }

    private async runCycle(): Promise<void> {
        if (this.state.running || this.stopping) {
            return;
        }

        const startedAt = Date.now();

        this.state.running = true;
        this.state.status = "SYNCING";
        this.state.totalCycles += 1;

        this.state.lastStartedAt =
            new Date().toISOString();

        let nextDelay = appConfig.sync.intervalMs;

        try {
            const previousFailures =
                this.state.consecutiveFailures;

            const result =
                await synchronizeBranchService();

            this.state.successfulCycles += 1;
            this.state.consecutiveFailures = 0;

            this.state.lastSuccessfulAt =
                new Date().toISOString();

            this.state.lastError = null;

            if (previousFailures > 0) {
                console.info(
                    "[SYNC WORKER] Central connection recovered",
                    {
                        branch: appConfig.branch.code,
                        previousFailures,
                    }
                );
            }

            console.info(
                "[SYNC WORKER] Synchronization completed",
                {
                    branch: appConfig.branch.code,
                    durationMs: Date.now() - startedAt,
                }
            );

            // The existing service handles event application,
            // transactions, inbox records and cursor updates.
            void result;

        } catch {
            this.state.failedCycles += 1;
            this.state.consecutiveFailures += 1;

            this.state.lastFailedAt =
                new Date().toISOString();

            // Do not log raw HTTP errors because they may
            // contain authorization headers or credentials.
            this.state.lastError =
                "Synchronization cycle failed";

            nextDelay = this.calculateRetryDelay();

            console.warn(
                "[SYNC WORKER] Synchronization failed",
                {
                    branch: appConfig.branch.code,
                    consecutiveFailures:
                        this.state.consecutiveFailures,
                    retryInMs: nextDelay,
                }
            );

        } finally {
            this.state.running = false;

            this.state.lastCompletedAt =
                new Date().toISOString();

            this.state.lastDurationMs =
                Date.now() - startedAt;

            if (!this.stopping && this.started) {
                this.scheduleNext(nextDelay);
            }
        }
    }

    public async stop(): Promise<void> {
        this.stopping = true;
        this.started = false;

        this.state.status = "STOPPING";
        this.state.nextRunAt = null;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        if (this.activeCycle) {
            console.info(
                "[SYNC WORKER] Waiting for active cycle"
            );

            await this.activeCycle;
        }

        this.state.running = false;
        this.state.enabled = false;
        this.state.status = "STOPPED";

        this.stopping = false;

        console.info("[SYNC WORKER] Stopped");
    }
}

export const branchSyncWorker =
    new BranchSyncWorker();