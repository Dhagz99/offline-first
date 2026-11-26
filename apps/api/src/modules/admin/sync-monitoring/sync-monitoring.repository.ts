
import { prisma } from "@/lib/database/prisma";

export async function getSyncMonitoringRepo() {
    return prisma.$transaction(
        async (tx) => {
            const counter = await tx.syncVersionCounter.findUnique({
                where: {
                    id: 1,
                },
                select: {
                    lastVersion: true,
                },
            });

            if (!counter) {
                throw new Error(
                    "Central synchronization version counter is missing"
                );
            }

            const branches = await tx.branch.findMany({
                select: {
                    id: true,
                    branchCode: true,
                    branchName: true,
                    address: true,
                    isActive: true,
                },
                orderBy: {
                    branchCode: "asc",
                },
            });

            const heartbeats = await tx.syncHeartbeat.findMany({
                select: {
                    branchId: true,
                    localVersion: true,
                    lastKnownCentralVersion: true,
                    syncEnabled: true,
                    intervalMs: true,
                    consecutiveFailures: true,
                    lastHeartbeatAt: true,
                    lastSuccessfulSyncAt: true,
                    nextRetryAt: true,
                    lastErrorCode: true,
                },
            });

            return {
                centralVersion: counter.lastVersion,
                branches,
                heartbeats,
            };
        },
        {
            isolationLevel: "RepeatableRead",
            maxWait: 5000,
            timeout: 10000,
        }
    );
}
