import { prisma } from "@/lib/database/prisma";

import type {
  SyncHeartbeatInput,
} from "@repo/shared";

export async function saveHeartbeatRepo(
  branchId: string,
  input: SyncHeartbeatInput
) {
  return prisma.$transaction(async (tx) => {
    const counter = await tx.syncVersionCounter.findUniqueOrThrow({
      where: {
        id: 1,
      },
      select: {
        lastVersion: true,
      },
    });

    const now = new Date();

    const heartbeatData = {
      localVersion: BigInt(input.localVersion),

      lastKnownCentralVersion: BigInt(
        input.lastKnownCentralVersion
      ),

      syncEnabled: input.syncEnabled,

      intervalMs: input.intervalMs,

      consecutiveFailures: input.consecutiveFailures,

      lastSuccessfulSyncAt: input.lastSuccessfulSyncAt
        ? new Date(input.lastSuccessfulSyncAt)
        : null,

      nextRetryAt: input.nextRetryAt
        ? new Date(input.nextRetryAt)
        : null,

      lastErrorCode: input.lastErrorCode,

      lastHeartbeatAt: now,
    };

    const heartbeat = await tx.syncHeartbeat.upsert({
      where: {
        branchId,
      },

      create: {
        branchId,
        ...heartbeatData,
      },

      update: heartbeatData,
    });

    return {
      heartbeat,
      centralVersion: counter.lastVersion,
    };
  });
}