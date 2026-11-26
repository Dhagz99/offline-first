import {
    userAccessPayloadSchema,
    userAccessDeletePayloadSchema,
    branchChangePayloadSchema,

    type SyncChangeEvent,
    type UserAccessPayload,
} from "@repo/shared";

import {
    SyncApplyError,
    type ValidatedSyncEvent,
} from "./sync-apply.types";

/* =========================
   UNIQUE VALUES
========================= */

function assertUnique(
    values: string[],

    message: string,

    eventId: string
) {
    if (
        new Set(values).size !== values.length
    ) {
        throw new SyncApplyError(
            "INVALID_RELATIONSHIP",
            message,
            eventId
        );
    }
}

/* =========================
   USER ACCESS RELATIONSHIPS
========================= */

function validateUserAccessRelationships(
    payload: UserAccessPayload,

    event: SyncChangeEvent,

    branchId: string
) {
    const userId = payload.user.id;

    if (userId !== event.entityId) {
        throw new SyncApplyError(
            "INVALID_PAYLOAD",
            "User ID does not match event entity ID",
            event.eventId
        );
    }

    const roleIds = new Set(
        payload.roles.map(
            (role) => role.id
        )
    );

    const permissionIds = new Set(
        payload.permissions.map(
            (permission) => permission.id
        )
    );

    /* =========================
       DUPLICATE VALIDATION
    ========================= */

    assertUnique(
        payload.roles.map((role) => role.id),
        "Duplicate role IDs",
        event.eventId
    );

    assertUnique(
        payload.permissions.map(
            (permission) => permission.id
        ),
        "Duplicate permission IDs",
        event.eventId
    );

    assertUnique(
        payload.userRoles.map(
            (item) => item.roleId
        ),
        "Duplicate user role assignments",
        event.eventId
    );

    assertUnique(
        payload.rolePermissions.map(
            (item) =>
                `${item.roleId}:${item.permissionId}`
        ),
        "Duplicate role permission assignments",
        event.eventId
    );

    /* =========================
       USER BRANCH VALIDATION
    ========================= */

    for (const assignment of payload.userBranches) {
        if (
            assignment.userId !== userId ||
            assignment.branchId !== branchId
        ) {
            throw new SyncApplyError(
                "BRANCH_MISMATCH",
                "Invalid user branch assignment",
                event.eventId
            );
        }
    }

    /* =========================
       USER ROLE VALIDATION
    ========================= */

    for (const assignment of payload.userRoles) {
        if (
            assignment.userId !== userId ||
            !roleIds.has(assignment.roleId)
        ) {
            throw new SyncApplyError(
                "INVALID_RELATIONSHIP",
                "Invalid user role relationship",
                event.eventId
            );
        }
    }

    /* =========================
       ROLE PERMISSION VALIDATION
    ========================= */

    for (const assignment of payload.rolePermissions) {
        if (
            !roleIds.has(assignment.roleId) ||
            !permissionIds.has(
                assignment.permissionId
            )
        ) {
            throw new SyncApplyError(
                "INVALID_RELATIONSHIP",
                "Invalid role permission relationship",
                event.eventId
            );
        }
    }

    /* =========================
       EXACT ROLE REFERENCES
    ========================= */

    const assignedRoleIds = new Set(
        payload.userRoles.map(
            (item) => item.roleId
        )
    );

    if (
        assignedRoleIds.size !== roleIds.size
    ) {
        throw new SyncApplyError(
            "INVALID_RELATIONSHIP",
            "Payload contains unassigned roles",
            event.eventId
        );
    }

    const assignedPermissionIds = new Set(
        payload.rolePermissions.map(
            (item) => item.permissionId
        )
    );

    if (
        assignedPermissionIds.size !==
        permissionIds.size
    ) {
        throw new SyncApplyError(
            "INVALID_RELATIONSHIP",
            "Payload contains unassigned permissions",
            event.eventId
        );
    }
}

/* =========================
   VALIDATE EVENT
========================= */

export function validateSyncEvent(
    event: SyncChangeEvent,

    branchId: string,

    branchCode: string
): ValidatedSyncEvent {

    if (event.branchId !== branchId) {
        throw new SyncApplyError(
            "BRANCH_MISMATCH",
            "Event belongs to another branch",
            event.eventId
        );
    }

    if (event.schemaVersion !== 1) {
        throw new SyncApplyError(
            "UNSUPPORTED_EVENT",
            "Unsupported event schema version",
            event.eventId
        );
    }

    /* =========================
       USER ACCESS EVENTS
    ========================= */

    if (event.entityType === "USER_ACCESS") {

        if (event.operation === "DELETE") {

            const result =
                userAccessDeletePayloadSchema.safeParse(
                    event.payload
                );

            if (!result.success) {
                throw new SyncApplyError(
                    "INVALID_PAYLOAD",
                    "Invalid user access deletion payload",
                    event.eventId
                );
            }

            if (
                result.data.userId !== event.entityId ||
                result.data.branchId !== branchId
            ) {
                throw new SyncApplyError(
                    "BRANCH_MISMATCH",
                    "Invalid user access deletion identity",
                    event.eventId
                );
            }

            return {
                type: "USER_ACCESS_DELETE",
                event,
                payload: result.data,
            };
        }

        if (
            event.operation === "CREATE" ||
            event.operation === "UPDATE"
        ) {

            const result =
                userAccessPayloadSchema.safeParse(
                    event.payload
                );

            if (!result.success) {
                throw new SyncApplyError(
                    "INVALID_PAYLOAD",
                    "Invalid user access payload",
                    event.eventId
                );
            }

            validateUserAccessRelationships(
                result.data,
                event,
                branchId
            );

            return {
                type: "USER_ACCESS_UPSERT",
                event,
                payload: result.data,
            };
        }
    }

    /* =========================
       BRANCH EVENTS
    ========================= */

    if (
        event.entityType === "BRANCH" &&
        (
            event.operation === "CREATE" ||
            event.operation === "UPDATE"
        )
    ) {

        const result =
            branchChangePayloadSchema.safeParse(
                event.payload
            );

        if (!result.success) {
            throw new SyncApplyError(
                "INVALID_PAYLOAD",
                "Invalid branch payload",
                event.eventId
            );
        }

        if (
            result.data.id !== branchId ||
            result.data.id !== event.entityId ||
            result.data.branchCode !== branchCode
        ) {
            throw new SyncApplyError(
                "BRANCH_MISMATCH",
                "Invalid branch payload identity",
                event.eventId
            );
        }

        return {
            type: "BRANCH_UPSERT",
            event,
            payload: result.data,
        };
    }

    throw new SyncApplyError(
        "UNSUPPORTED_EVENT",
        "Unsupported synchronization event",
        event.eventId
    );
}