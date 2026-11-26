import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    APP_MODE: z.enum([
    "CENTRAL",
    "BRANCH",
    ]).default("CENTRAL"),

    BRANCH_ID: z.uuid().optional(),

    BRANCH_CODE: z.string().min(1).optional(),

    BRANCH_API_KEY: z
        .string()
        .regex(/^brk_[a-f0-9]{64}$/)
        .optional(),
    
    CENTRAL_API_URL: z.url().optional(),

    SYNC_ENABLED: z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),

    SYNC_INTERVAL_MS: z.coerce
        .number()
        .int()
        .min(1000)
        .default(10000),

    SYNC_BATCH_SIZE: z.coerce
        .number()
        .int()
        .min(1)
        .max(500)
        .default(50),

    PORT: z.coerce.number().default(5000),

    DATABASE_URL: z.string(),

    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("1d"),

    FRONTEND_URL: z.string().url(),
    FRONTEND_LAN_URL: z.string().url(),

    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    SYNC_REQUEST_TIMEOUT_MS: z.coerce
        .number()
        .int()
        .min(1000)
        .max(120000)
        .default(15000),

    SYNC_MAX_RESPONSE_BYTES: z.coerce
        .number()
        .int()
        .min(1024)
        .max(52428800)
        .default(10485760),

    SYNC_MAX_RETRY_DELAY_MS: z.coerce
        .number()
        .int()
        .min(1000)
        .max(3600000)
        .default(300000),

    SYNC_MAX_BATCHES_PER_CYCLE: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),
});

export const env = envSchema
    .superRefine((data, ctx) => {

        if (data.APP_MODE !== "BRANCH") {
            return;
        }

        if (!data.BRANCH_ID) {
            ctx.addIssue({
                code: "custom",
                path: ["BRANCH_ID"],
                message:
                    "BRANCH_ID is required in BRANCH mode",
            });
        }

        if (!data.BRANCH_CODE) {
            ctx.addIssue({
                code: "custom",
                path: ["BRANCH_CODE"],
                message:
                    "BRANCH_CODE is required in BRANCH mode",
            });
        }

        if (data.SYNC_ENABLED) {

            if (!data.CENTRAL_API_URL) {
                ctx.addIssue({
                    code: "custom",
                    path: ["CENTRAL_API_URL"],
                    message:
                        "CENTRAL_API_URL is required when synchronization is enabled",
                });
            }

            if (!data.BRANCH_API_KEY) {
                ctx.addIssue({
                    code: "custom",
                    path: ["BRANCH_API_KEY"],
                    message:
                        "BRANCH_API_KEY is required when synchronization is enabled",
                });
            }
        }
    })
    .parse(process.env);