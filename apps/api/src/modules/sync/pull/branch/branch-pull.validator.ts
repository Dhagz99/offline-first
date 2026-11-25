import {
    syncPullResponseSchema,

    type SyncPullData,
} from "@repo/shared";

import {
    BranchPullError,

    type BranchPullConfig,

    type BranchPullRequest,
} from "./branch-pull.types";

/* =========================
   VALIDATE PULL RESPONSE
========================= */

export function validateBranchPullResponse(
    response: unknown,

    config: BranchPullConfig,

    request: BranchPullRequest
): SyncPullData {

    /* =========================
       VALIDATE SHARED SCHEMA
    ========================= */

    const validation =
        syncPullResponseSchema.safeParse(
            response
        );

    if (!validation.success) {
        throw new BranchPullError(
            "INVALID_RESPONSE",

            "Central server returned an invalid synchronization response"
        );
    }

    const data = validation.data.data;

    /* =========================
       VALIDATE BRANCH IDENTITY
    ========================= */

    if (
        data.branchId !== config.branchId ||
        data.branchCode !== config.branchCode
    ) {
        throw new BranchPullError(
            "BRANCH_MISMATCH",

            "Synchronization response belongs to a different branch"
        );
    }

    /* =========================
       VALIDATE CURSOR
    ========================= */

    const requestedVersion =
        BigInt(request.afterVersion);

    const fromVersion =
        BigInt(data.fromVersion);

    const nextVersion =
        BigInt(data.nextVersion);

    const latestVersion =
        BigInt(data.latestVersion);

    if (fromVersion !== requestedVersion) {
        throw new BranchPullError(
            "INVALID_CURSOR",

            "Response cursor does not match the requested cursor"
        );
    }

    if (
        nextVersion < fromVersion ||
        latestVersion < nextVersion
    ) {
        throw new BranchPullError(
            "INVALID_EVENT_SEQUENCE",

            "Synchronization response contains invalid version boundaries"
        );
    }

    /* =========================
       VALIDATE EVENT COUNT
    ========================= */

    if (
        data.totalEvents !== data.events.length ||
        data.events.length > request.limit
    ) {
        throw new BranchPullError(
            "INVALID_RESPONSE",

            "Synchronization event count is invalid"
        );
    }

    /* =========================
       VALIDATE EACH EVENT
    ========================= */

    let previousVersion = fromVersion;

    const eventIds = new Set<string>();

    for (const event of data.events) {

        const version =
            BigInt(event.version);

        if (
            event.branchId !== config.branchId
        ) {
            throw new BranchPullError(
                "BRANCH_MISMATCH",

                "Synchronization event belongs to another branch"
            );
        }

        if (event.schemaVersion !== 1) {
            throw new BranchPullError(
                "UNSUPPORTED_SCHEMA_VERSION",

                "Synchronization event schema version is not supported"
            );
        }

        if (
            version <= previousVersion ||
            version > nextVersion ||
            version > latestVersion
        ) {
            throw new BranchPullError(
                "INVALID_EVENT_SEQUENCE",

                "Synchronization events are not in valid ascending order"
            );
        }

        if (eventIds.has(event.eventId)) {
            throw new BranchPullError(
                "INVALID_EVENT_SEQUENCE",

                "Duplicate synchronization event detected"
            );
        }

        eventIds.add(event.eventId);

        previousVersion = version;
    }

    /* =========================
       VALIDATE PAGINATION
    ========================= */

    if (data.hasMore) {

        if (
            data.events.length !== request.limit ||
            nextVersion !== previousVersion ||
            nextVersion <= fromVersion ||
            nextVersion >= latestVersion
        ) {
            throw new BranchPullError(
                "INVALID_EVENT_SEQUENCE",

                "Invalid synchronization pagination cursor"
            );
        }

    } else {

        if (nextVersion !== latestVersion) {
            throw new BranchPullError(
                "INVALID_EVENT_SEQUENCE",

                "Final synchronization cursor does not match the latest version"
            );
        }
    }

    return data;
}