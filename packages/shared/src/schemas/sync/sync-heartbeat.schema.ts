import { z } from "zod";

const syncVersionSchema = z
  .string()
  .regex(/^(0|[1-9]\d{0,18})$/)
  .refine(
    (value) => BigInt(value) <= 9223372036854775807n,
    "Invalid synchronization version"
  );

export const syncHeartbeatSchema = z
  .object({
    localVersion: syncVersionSchema,

    lastKnownCentralVersion: syncVersionSchema,

    syncEnabled: z.boolean(),

    intervalMs: z.number()
      .int()
      .min(1000)
      .max(3600000),

    consecutiveFailures: z.number()
      .int()
      .nonnegative()
      .max(2147483647),

    lastSuccessfulSyncAt: z.iso.datetime().nullable(),

    nextRetryAt: z.iso.datetime().nullable(),

    lastErrorCode: z.string()
      .regex(/^[A-Z0-9_]+$/)
      .max(100)
      .nullable(),
  })
  .strict();

export type SyncHeartbeatInput = z.infer<
  typeof syncHeartbeatSchema
>;

export const syncHeartbeatResponseSchema = z.object({
  branchId: z.uuid(),

  branchCode: z.string(),

  localVersion: syncVersionSchema,

  centralVersion: syncVersionSchema,

  receivedAt: z.iso.datetime(),
});

export type SyncHeartbeatResponse = z.infer<
  typeof syncHeartbeatResponseSchema
>;