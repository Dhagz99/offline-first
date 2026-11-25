import type {
    SyncPullData,
} from "@repo/shared";

/* =========================
   BRANCH PULL CONFIGURATION
========================= */

export type BranchPullConfig = {
    branchId: string;

    branchCode: string;

    apiKey: string;

    centralApiUrl: string;

    batchSize: number;

    timeoutMs: number;

    maxResponseBytes: number;
};

/* =========================
   PULL REQUEST
========================= */

export type BranchPullRequest = {
    afterVersion: string;

    limit: number;
};

/* =========================
   PULL PREVIEW RESULT
========================= */

export type BranchPullPreviewResult = {
    branchId: string;

    branchCode: string;

    databaseName: string;

    localVersion: string;

    durationMs: number;

    data: SyncPullData;
};

/* =========================
   PULL ERROR
========================= */

export type BranchPullErrorCode =
    | "INVALID_CONFIGURATION"
    | "BRANCH_NOT_PROVISIONED"
    | "DATABASE_IDENTITY_MISMATCH"
    | "DATABASE_ERROR"
    | "CONNECTION_FAILED"
    | "REQUEST_TIMEOUT"
    | "AUTHENTICATION_FAILED"
    | "INVALID_CURSOR"
    | "HTTP_ERROR"
    | "RESPONSE_TOO_LARGE"
    | "INVALID_RESPONSE"
    | "BRANCH_MISMATCH"
    | "INVALID_EVENT_SEQUENCE"
    | "UNSUPPORTED_SCHEMA_VERSION";

export class BranchPullError extends Error {
    constructor(
        public readonly code: BranchPullErrorCode,

        message: string,

        public readonly statusCode?: number
    ) {
        super(message);

        this.name = "BranchPullError";
    }
}