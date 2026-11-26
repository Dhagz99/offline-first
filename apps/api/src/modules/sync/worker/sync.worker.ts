
import { appConfig } from "@/config/app.config";

import {
    synchronizeBranchService,
} from "../apply/sync-apply.service";


import type {
    SyncWorkerState,
} from "./sync-worker.types";
import { reportBranchHeartbeat } from "../hearbeat/branch-heartbeat.client";

class BranchSyncWorker {

    private timer:
        ReturnType<typeof setTimeout> | null = null;

    private activeCycle:
        Promise<void> | null = null;

    private started = false;

    private stopping = false;

    private lastKnownCentralVersion:
        string | null = null;

    private heartbeatFailures = 0;

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

    /* =========================
       GET WORKER STATE
    ========================= */

    public getState(): SyncWorkerState {
        return {
            ...this.state,
        };
    }

    /* =========================
       START WORKER
    ========================= */

    public start(): void {

        if (
            this.started ||
            this.stopping
        ) {
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

        console.info(
            "[SYNC WORKER] Started",
            {
                branch: appConfig.branch.code,

                intervalMs:
                    appConfig.sync.intervalMs,

                batchSize:
                    appConfig.sync.batchSize,

                maxRetryDelayMs:
                    appConfig.sync.maxRetryDelayMs,

                heartbeatEnabled: true,
            }
        );

        this.scheduleNext(0);
    }

    /* =========================
       SCHEDULE NEXT CYCLE
    ========================= */

    private scheduleNext(
        delayMs: number
    ): void {

        if (
            !this.started ||
            this.stopping
        ) {
            return;
        }

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.state.nextRunAt =
            new Date(
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

            this.activeCycle =
                this.runCycle().finally(() => {
                    this.activeCycle = null;
                });

        }, delayMs);
    }

    /* =========================
       RETRY BACKOFF
    ========================= */

    private calculateRetryDelay(): number {

        const interval =
            appConfig.sync.intervalMs;

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

        const delay =
            interval * Math.pow(2, exponent);

        const jitter =
            Math.floor(Math.random() * 1000);

        return Math.min(
            delay + jitter,
            maximum
        );
    }

    /* =========================
       REPORT HEARTBEAT
    ========================= */

    private async sendHeartbeat(
        nextDelay: number
    ): Promise<void> {

        if (
            !this.started ||
            this.stopping
        ) {
            return;
        }

        try {

            const nextRetryAt =
                this.state.consecutiveFailures > 0
                    ? new Date(
                        Date.now() +
                        nextDelay
                    ).toISOString()
                    : null;

            await reportBranchHeartbeat({
                state: this.getState(),

                lastKnownCentralVersion:
                    this.lastKnownCentralVersion,

                nextRetryAt,
            });

            if (this.heartbeatFailures > 0) {

                console.info(
                    "[HEARTBEAT] Reporting recovered",
                    {
                        branch:
                            appConfig.branch.code,

                        previousFailures:
                            this.heartbeatFailures,
                    }
                );
            }

            this.heartbeatFailures = 0;

            console.info(
                "[HEARTBEAT] Reported successfully",
                {
                    branch:
                        appConfig.branch.code,
                }
            );

        } catch {

            this.heartbeatFailures += 1;

            console.warn(
                "[HEARTBEAT] Reporting failed",
                {
                    branch:
                        appConfig.branch.code,

                    consecutiveFailures:
                        this.heartbeatFailures,
                }
            );

            // Heartbeat failures must never
            // invalidate successful synchronization.
        }
    }

    /* =========================
       RUN SYNCHRONIZATION
    ========================= */

    private async runCycle(): Promise<void> {

        if (
            this.state.running ||
            this.stopping
        ) {
            return;
        }

        const startedAt = Date.now();

        this.state.running = true;
        this.state.status = "SYNCING";

        this.state.totalCycles += 1;

        this.state.lastStartedAt =
            new Date().toISOString();

        let nextDelay =
            appConfig.sync.intervalMs;

        try {

            const previousFailures =
                this.state.consecutiveFailures;

            const result =
                await synchronizeBranchService();

            /* =========================
               STORE CENTRAL VERSION
            ========================= */

            this.lastKnownCentralVersion =
                result.latestVersion;

            /* =========================
               SUCCESSFUL CYCLE
            ========================= */

            this.state.successfulCycles += 1;

            this.state.consecutiveFailures = 0;

            this.state.lastSuccessfulAt =
                new Date().toISOString();

            this.state.lastError = null;

            if (previousFailures > 0) {

                console.info(
                    "[SYNC WORKER] Central connection recovered",
                    {
                        branch:
                            appConfig.branch.code,

                        previousFailures,
                    }
                );
            }

            console.info(
                "[SYNC WORKER] Synchronization completed",
                {
                    branch:
                        appConfig.branch.code,

                    initialVersion:
                        result.initialVersion,

                    finalVersion:
                        result.finalVersion,

                    centralVersion:
                        result.latestVersion,

                    totalBatches:
                        result.totalBatches,

                    receivedEvents:
                        result.receivedEvents,

                    appliedEvents:
                        result.appliedEvents,

                    skippedEvents:
                        result.skippedEvents,

                    hasMore:
                        result.hasMore,

                    durationMs:
                        result.durationMs,
                }
            );

        } catch {

            /* =========================
               FAILED CYCLE
            ========================= */

            this.state.failedCycles += 1;

            this.state.consecutiveFailures += 1;

            this.state.lastFailedAt =
                new Date().toISOString();

            this.state.lastError =
                "Synchronization cycle failed";

            nextDelay =
                this.calculateRetryDelay();

            console.warn(
                "[SYNC WORKER] Synchronization failed",
                {
                    branch:
                        appConfig.branch.code,

                    consecutiveFailures:
                        this.state.consecutiveFailures,

                    retryInMs:
                        nextDelay,
                }
            );

        } finally {

            this.state.lastCompletedAt =
                new Date().toISOString();

            this.state.lastDurationMs =
                Date.now() - startedAt;

            /* =========================
               REPORT HEARTBEAT
            ========================= */

            await this.sendHeartbeat(
                nextDelay
            );

            this.state.running = false;

            /* =========================
               SCHEDULE NEXT CYCLE
            ========================= */

            if (
                !this.stopping &&
                this.started
            ) {
                this.scheduleNext(
                    nextDelay
                );
            }
        }
    }

    /* =========================
       STOP WORKER
    ========================= */

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

        console.info(
            "[SYNC WORKER] Stopped"
        );
    }
}

export const branchSyncWorker =
    new BranchSyncWorker();
