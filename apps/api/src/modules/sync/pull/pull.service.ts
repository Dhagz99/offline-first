import {
    syncPullDataSchema,

    type SyncPullQuery,

    type SyncPullData,
} from "@repo/shared";

import type {
    AuthenticatedBranch,
} from "@/middleware/branch-auth.middleware";

import {
    pullChangesRepo,
} from "./pull.repository";

/* =========================
   PULL SYNCHRONIZATION EVENTS
========================= */

export async function pullChangesService(
    branch: AuthenticatedBranch,

    query: SyncPullQuery
): Promise<SyncPullData> {

    const result =
        await pullChangesRepo({
            branchId: branch.id,

            credentialId:
                branch.credentialId,

            afterVersion:
                BigInt(query.afterVersion),

            limit: query.limit,
        });

    /* =========================
       SERIALIZE RESPONSE
    ========================= */

    const response = {
        branchId:
            result.branch.id,

        branchCode:
            result.branch.branchCode,

        fromVersion:
            result.fromVersion.toString(),

        nextVersion:
            result.nextVersion.toString(),

        latestVersion:
            result.latestVersion.toString(),

        hasMore:
            result.hasMore,

        totalEvents:
            result.events.length,

        serverTime:
            new Date().toISOString(),

        events: result.events.map(
            (event) => ({
                version:
                    event.version.toString(),

                eventId:
                    event.eventId,

                branchId:
                    event.branchId,

                entityType:
                    event.entityType,

                entityId:
                    event.entityId,

                operation:
                    event.operation,

                payload:
                    event.payload,

                schemaVersion:
                    event.schemaVersion,

                entityVersion:
                    event.entityVersion,

                createdAt:
                    event.createdAt.toISOString(),
            })
        ),
    };

    /* =========================
       VALIDATE RESPONSE CONTRACT
    ========================= */

    return syncPullDataSchema.parse(
        response
    );
}