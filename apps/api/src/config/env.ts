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

    JWT_SECRET: z.string().min(1),
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
});

export const env = envSchema.parse(process.env);