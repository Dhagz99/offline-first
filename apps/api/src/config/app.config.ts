import { env } from "./env";

export const appConfig = {
    mode: env.APP_MODE,

    isCentral: env.APP_MODE === "CENTRAL",

    isBranch: env.APP_MODE === "BRANCH",

    branch: {
        id: env.BRANCH_ID,

        code: env.BRANCH_CODE,

        apiKey: env.BRANCH_API_KEY,
    },

    sync: {
        enabled: env.SYNC_ENABLED,

        centralApiUrl: env.CENTRAL_API_URL,

        intervalMs: env.SYNC_INTERVAL_MS,

        batchSize: env.SYNC_BATCH_SIZE,

        requestTimeoutMs: env.SYNC_REQUEST_TIMEOUT_MS,

        maxResponseBytes:  env.SYNC_MAX_RESPONSE_BYTES,
        
        maxRetryDelayMs: env.SYNC_MAX_RETRY_DELAY_MS,
        maxBatchesPerCycle: env.SYNC_MAX_BATCHES_PER_CYCLE,
    },
};