import { z } from "zod";

import {
    provisioningUserSchema,
    provisioningRoleSchema,
    provisioningPermissionSchema,
    provisioningUserRoleSchema,
    provisioningRolePermissionSchema,
    provisioningUserBranchSchema,
    provisioningBranchSchema,
} from "../provisioning/provisioning.schema";

/* =========================
   USER ACCESS PAYLOAD
========================= */

export const userAccessPayloadSchema = z.object({
    user: provisioningUserSchema,

    roles: z.array(
        provisioningRoleSchema
    ),

    permissions: z.array(
        provisioningPermissionSchema
    ),

    userRoles: z.array(
        provisioningUserRoleSchema
    ),

    rolePermissions: z.array(
        provisioningRolePermissionSchema
    ),

    userBranches: z.array(
        provisioningUserBranchSchema
    ).length(1),
}).strict();

/* =========================
   USER ACCESS DELETE
========================= */

export const userAccessDeletePayloadSchema = z.object({
    userId: z.uuid(),

    branchId: z.uuid(),

    reason: z.enum([
        "BRANCH_ACCESS_REMOVED",
        "USER_DELETED",
    ]),
}).strict();

/* =========================
   BRANCH PAYLOAD
========================= */

export const branchChangePayloadSchema =
    provisioningBranchSchema.strict();

/* =========================
   TYPES
========================= */

export type UserAccessPayload = z.infer<
    typeof userAccessPayloadSchema
>;

export type UserAccessDeletePayload = z.infer<
    typeof userAccessDeletePayloadSchema
>;

export type BranchChangePayload = z.infer<
    typeof branchChangePayloadSchema
>;