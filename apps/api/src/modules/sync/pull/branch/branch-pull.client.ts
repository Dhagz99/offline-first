import {
    appConfig,
} from "@/config/app.config";

import {
    env,
} from "@/config/env";

import {
    syncVersionSchema,

    SYNC_PULL_MAX_LIMIT,

    type SyncPullData,
} from "@repo/shared";

import {
    BranchPullError,

    type BranchPullConfig,

    type BranchPullRequest,
} from "./branch-pull.types";

import {
    validateBranchPullResponse,
} from "./branch-pull.validator";

/* =========================
   GET BRANCH CONFIGURATION
========================= */

export function getBranchPullConfig():
    BranchPullConfig {

    if (!appConfig.isBranch) {
        throw new BranchPullError(
            "INVALID_CONFIGURATION",

            "Synchronization pull is only available in BRANCH mode"
        );
    }

    const {
        id,

        code,

        apiKey,
    } = appConfig.branch;

    const {
        centralApiUrl,

        batchSize,

        requestTimeoutMs,

        maxResponseBytes,
    } = appConfig.sync;

    if (
        !id ||
        !code ||
        !apiKey ||
        !centralApiUrl
    ) {
        throw new BranchPullError(
            "INVALID_CONFIGURATION",

            "Branch synchronization configuration is incomplete"
        );
    }

    let url: URL;

    try {

        url = new URL(centralApiUrl);

    } catch {

        throw new BranchPullError(
            "INVALID_CONFIGURATION",

            "Invalid central API URL"
        );
    }

    if (
        !["http:", "https:"].includes(
            url.protocol
        ) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
    ) {
        throw new BranchPullError(
            "INVALID_CONFIGURATION",

            "Central API URL contains unsupported components"
        );
    }

    if (
        env.NODE_ENV === "production" &&
        url.protocol !== "https:"
    ) {
        throw new BranchPullError(
            "INVALID_CONFIGURATION",

            "Production synchronization requires HTTPS"
        );
    }

    return {
        branchId: id,

        branchCode: code,

        apiKey,

        centralApiUrl,

        batchSize,

        timeoutMs: requestTimeoutMs,

        maxResponseBytes,
    };
}

/* =========================
   READ LIMITED JSON RESPONSE
========================= */

async function readLimitedJson(
    response: Response,

    maxBytes: number
): Promise<unknown> {

    const contentLength =
        response.headers.get(
            "content-length"
        );

    if (
        contentLength &&
        Number(contentLength) > maxBytes
    ) {
        await response.body?.cancel();

        throw new BranchPullError(
            "RESPONSE_TOO_LARGE",

            "Synchronization response exceeds the allowed size"
        );
    }

    if (!response.body) {
        throw new BranchPullError(
            "INVALID_RESPONSE",

            "Synchronization response is empty"
        );
    }

    const reader =
        response.body.getReader();

    const chunks: Uint8Array[] = [];

    let totalBytes = 0;

    try {

        while (true) {

            const {
                done,

                value,
            } = await reader.read();

            if (done) {
                break;
            }

            totalBytes += value.byteLength;

            if (totalBytes > maxBytes) {

                await reader.cancel();

                throw new BranchPullError(
                    "RESPONSE_TOO_LARGE",

                    "Synchronization response exceeds the allowed size"
                );
            }

            chunks.push(value);
        }

    } finally {

        reader.releaseLock();
    }

    try {

        const text = Buffer
            .concat(chunks)
            .toString("utf8");

        return JSON.parse(text);

    } catch {

        throw new BranchPullError(
            "INVALID_RESPONSE",

            "Central server returned invalid JSON"
        );
    }
}

/* =========================
   REQUEST SYNCHRONIZATION
========================= */

export async function pullBranchChanges(
    config: BranchPullConfig,

    request: BranchPullRequest
): Promise<SyncPullData> {

    if (
        !syncVersionSchema.safeParse(
            request.afterVersion
        ).success
    ) {
        throw new BranchPullError(
            "INVALID_CURSOR",

            "Invalid local synchronization cursor"
        );
    }

    if (
        !Number.isInteger(request.limit) ||
        request.limit < 1 ||
        request.limit > SYNC_PULL_MAX_LIMIT
    ) {
        throw new BranchPullError(
            "INVALID_CONFIGURATION",

            "Invalid synchronization batch size"
        );
    }

    /* =========================
       BUILD REQUEST URL
    ========================= */

    const baseUrl =
        config.centralApiUrl.replace(
            /\/+$/,
            ""
        );

    const url = new URL(
        `${baseUrl}/sync/pull`
    );

    url.searchParams.set(
        "afterVersion",

        request.afterVersion
    );

    url.searchParams.set(
        "limit",

        String(request.limit)
    );

    /* =========================
       REQUEST TIMEOUT
    ========================= */

    const controller =
        new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),

        config.timeoutMs
    );

    try {

        /* =========================
           SEND REQUEST
        ========================= */

        const response = await fetch(
            url,

            {
                method: "GET",

                headers: {
                    Accept:
                        "application/json",

                    "x-branch-api-key":
                        config.apiKey,

                    "Cache-Control":
                        "no-store",
                },

                signal:
                    controller.signal,

                redirect: "error",

                cache: "no-store",
            }
        );

        /* =========================
           HANDLE HTTP ERRORS
        ========================= */

        if (!response.ok) {

            await response.body?.cancel();

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                throw new BranchPullError(
                    "AUTHENTICATION_FAILED",

                    "Central server rejected branch authentication",

                    response.status
                );
            }

            if (response.status === 409) {
                throw new BranchPullError(
                    "INVALID_CURSOR",

                    "Central server rejected the synchronization cursor",

                    response.status
                );
            }

            throw new BranchPullError(
                "HTTP_ERROR",

                `Central server returned HTTP ${response.status}`,

                response.status
            );
        }

        /* =========================
           VALIDATE CONTENT TYPE
        ========================= */

        const contentType =
            response.headers.get(
                "content-type"
            );

        if (
            !contentType ||
            !contentType
                .toLowerCase()
                .includes("application/json")
        ) {
            await response.body?.cancel();

            throw new BranchPullError(
                "INVALID_RESPONSE",

                "Central server did not return JSON"
            );
        }

        /* =========================
           READ RESPONSE
        ========================= */

        const body =
            await readLimitedJson(
                response,

                config.maxResponseBytes
            );

        /* =========================
           VALIDATE RESPONSE
        ========================= */

        return validateBranchPullResponse(
            body,

            config,

            request
        );

    } catch (error) {

        if (controller.signal.aborted) {
            throw new BranchPullError(
                "REQUEST_TIMEOUT",

                "Central synchronization request timed out"
            );
        }

        if (error instanceof BranchPullError) {
            throw error;
        }

        throw new BranchPullError(
            "CONNECTION_FAILED",

            "Unable to connect to the central synchronization server"
        );

    } finally {

        clearTimeout(timeout);
    }
}