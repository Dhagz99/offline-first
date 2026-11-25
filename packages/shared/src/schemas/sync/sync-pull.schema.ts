import { z } from "zod";

/* =========================
   SYNCHRONIZATION CONSTANTS
========================= */

export const SYNC_PULL_DEFAULT_LIMIT = 50;

export const SYNC_PULL_MAX_LIMIT = 500;

export const MAX_SYNC_VERSION =
    9223372036854775807n;

/* =========================
   VERSION SCHEMA
========================= */

export const syncVersionSchema = z
    .string()
    .max(19)
    .regex(
        /^(0|[1-9]\d*)$/,
        "Invalid synchronization version"
    )
    .refine(
        (value) =>
            /^\d{1,19}$/.test(value) &&
            BigInt(value) <= MAX_SYNC_VERSION,
        "Synchronization version exceeds maximum value"
    );

/* =========================
   PULL QUERY SCHEMA
========================= */

export const syncPullQuerySchema = z
    .object({
        afterVersion: syncVersionSchema
            .default("0"),

        limit: z
            .string()
            .regex(/^[1-9]\d{0,2}$/)
            .transform(Number)
            .pipe(
                z.number()
                    .int()
                    .min(1)
                    .max(SYNC_PULL_MAX_LIMIT)
            )
            .default(SYNC_PULL_DEFAULT_LIMIT),
    })
    .strict();

/* =========================
   SYNCHRONIZATION OPERATION
========================= */

export const syncOperationSchema = z.enum([
    "CREATE",
    "UPDATE",
    "DELETE",
]);

/* =========================
   SYNCHRONIZATION ENTITY
========================= */

export const syncEntityTypeSchema = z.enum([
    "USER_ACCESS",
    "BRANCH",
]);

/* =========================
   CHANGE EVENT SCHEMA
========================= */

export const syncChangeEventSchema = z.object({
    version: syncVersionSchema,

    eventId: z.uuid(),

    branchId: z.uuid(),

    entityType: syncEntityTypeSchema,

    entityId: z.string().min(1).max(191),

    operation: syncOperationSchema,

    payload: z.record(
        z.string(),
        z.json()
    ),

    schemaVersion: z.number()
        .int()
        .positive(),

    entityVersion: z.number()
        .int()
        .positive(),

    createdAt: z.iso.datetime(),
});

/* =========================
   PULL RESPONSE DATA
========================= */

export const syncPullDataSchema = z.object({
    branchId: z.uuid(),

    branchCode: z.string().min(1),

    fromVersion: syncVersionSchema,

    nextVersion: syncVersionSchema,

    latestVersion: syncVersionSchema,

    hasMore: z.boolean(),

    totalEvents: z.number()
        .int()
        .nonnegative(),

    serverTime: z.iso.datetime(),

    events: z.array(
        syncChangeEventSchema
    ).max(SYNC_PULL_MAX_LIMIT),
});

/* =========================
   COMPLETE API RESPONSE
========================= */

export const syncPullResponseSchema = z.object({
    success: z.literal(true),

    message: z.string(),

    data: syncPullDataSchema,
});

/* =========================
   TYPES
========================= */

export type SyncPullQuery = z.infer<
    typeof syncPullQuerySchema
>;

export type SyncChangeEvent = z.infer<
    typeof syncChangeEventSchema
>;

export type SyncPullData = z.infer<
    typeof syncPullDataSchema
>;

export type SyncPullResponse = z.infer<
    typeof syncPullResponseSchema
>;