import type {
    SyncChangeEvent,
    UserAccessPayload,
    UserAccessDeletePayload,
    BranchChangePayload,
} from "@repo/shared";

/* =========================
   VALIDATED EVENT
========================= */

export type ValidatedSyncEvent =
    | {
        type: "USER_ACCESS_UPSERT";

        event: SyncChangeEvent;

        payload: UserAccessPayload;
    }
    | {
        type: "USER_ACCESS_DELETE";

        event: SyncChangeEvent;

        payload: UserAccessDeletePayload;
    }
    | {
        type: "BRANCH_UPSERT";

        event: SyncChangeEvent;

        payload: BranchChangePayload;
    };

/* =========================
   APPLICATION RESULT
========================= */

export type SyncApplyBatchResult = {
    branchId: string;

    branchCode: string;

    fromVersion: string;

    nextVersion: string;

    latestVersion: string;

    receivedEvents: number;

    appliedEvents: number;

    skippedEvents: number;

    hasMore: boolean;
};

/* =========================
   FULL SYNC RESULT
========================= */

export type BranchSyncResult = {
    branchId: string;

    branchCode: string;

    initialVersion: string;

    finalVersion: string;

    latestVersion: string;

    totalBatches: number;

    receivedEvents: number;

    appliedEvents: number;

    skippedEvents: number;

    hasMore: boolean;

    durationMs: number;
};

/* =========================
   ERROR TYPES
========================= */

export type SyncApplyErrorCode =
    | "INVALID_CONFIGURATION"
    | "INVALID_PAYLOAD"
    | "INVALID_RELATIONSHIP"
    | "UNSUPPORTED_EVENT"
    | "BRANCH_MISMATCH"
    | "BRANCH_NOT_PROVISIONED"
    | "DATABASE_IDENTITY_MISMATCH"
    | "CURSOR_CHANGED"
    | "DUPLICATE_EVENT_MISMATCH"
    | "DATABASE_CONFLICT"
    | "APPLY_FAILED";

export class SyncApplyError extends Error {
    constructor(
        public readonly code: SyncApplyErrorCode,

        message: string,

        public readonly eventId?: string
    ) {
        super(message);

        this.name = "SyncApplyError";
    }
}