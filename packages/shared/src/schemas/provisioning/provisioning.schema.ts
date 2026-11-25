import { z } from "zod";

/* =========================
   PROVISIONING BRANCH
========================= */

export const provisioningBranchSchema = z.object({
    id: z.uuid(),

    branchCode: z.string(),

    branchName: z.string(),

    address: z.string().nullable(),

    isActive: z.boolean(),

    createdAt: z.iso.datetime(),

    updatedAt: z.iso.datetime(),
});

export type ProvisioningBranch = z.infer<
    typeof provisioningBranchSchema
>;

/* =========================
   PROVISIONING USER
========================= */

export const provisioningUserSchema = z.object({
    id: z.uuid(),

    name: z.string(),

    username: z.string(),

    email: z.string().nullable(),

    password: z.string().min(1),

    isActive: z.boolean(),

    createdAt: z.iso.datetime(),

    updatedAt: z.iso.datetime(),
});

export type ProvisioningUser = z.infer<
    typeof provisioningUserSchema
>;

/* =========================
   PROVISIONING ROLE
========================= */

export const provisioningRoleSchema = z.object({
    id: z.uuid(),

    name: z.string(),

    description: z.string().nullable(),

    createdAt: z.iso.datetime(),

    updatedAt: z.iso.datetime(),
});

export type ProvisioningRole = z.infer<
    typeof provisioningRoleSchema
>;

/* =========================
   PROVISIONING PERMISSION
========================= */

export const provisioningPermissionSchema = z.object({
    id: z.uuid(),

    code: z.string(),

    name: z.string(),

    description: z.string().nullable(),

    createdAt: z.iso.datetime(),

    updatedAt: z.iso.datetime(),
});

export type ProvisioningPermission = z.infer<
    typeof provisioningPermissionSchema
>;

/* =========================
   USER ROLE RELATIONSHIP
========================= */

export const provisioningUserRoleSchema = z.object({
    userId: z.uuid(),

    roleId: z.uuid(),

    assignedAt: z.iso.datetime(),
});

export type ProvisioningUserRole = z.infer<
    typeof provisioningUserRoleSchema
>;

/* =========================
   ROLE PERMISSION
========================= */

export const provisioningRolePermissionSchema = z.object({
    roleId: z.uuid(),

    permissionId: z.uuid(),
});

export type ProvisioningRolePermission = z.infer<
    typeof provisioningRolePermissionSchema
>;

/* =========================
   USER BRANCH RELATIONSHIP
========================= */

export const provisioningUserBranchSchema = z.object({
    userId: z.uuid(),

    branchId: z.uuid(),

    assignedAt: z.iso.datetime(),
});

export type ProvisioningUserBranch = z.infer<
    typeof provisioningUserBranchSchema
>;

/* =========================
   PROVISIONING SUMMARY
========================= */

export const provisioningSummarySchema = z.object({
    totalUsers: z.number().int().nonnegative(),

    activeUsers: z.number().int().nonnegative(),

    inactiveUsers: z.number().int().nonnegative(),

    totalRoles: z.number().int().nonnegative(),

    totalPermissions: z.number().int().nonnegative(),

    totalUserRoles: z.number().int().nonnegative(),

    totalRolePermissions: z.number().int().nonnegative(),

    totalUserBranches: z.number().int().nonnegative(),
});

export type ProvisioningSummary = z.infer<
    typeof provisioningSummarySchema
>;

/* =========================
   COMPLETE SNAPSHOT
========================= */

export const provisioningSnapshotSchema = z.object({
    schemaVersion: z.literal(1),

    snapshotId: z.uuid(),

    generatedAt: z.iso.datetime(),

    snapshotVersion: z.string().regex(/^\d+$/),

    branch: provisioningBranchSchema,

    users: z.array(provisioningUserSchema),

    roles: z.array(provisioningRoleSchema),

    permissions: z.array(provisioningPermissionSchema),

    userRoles: z.array(provisioningUserRoleSchema),

    rolePermissions: z.array(
        provisioningRolePermissionSchema
    ),

    userBranches: z.array(
        provisioningUserBranchSchema
    ),

    summary: provisioningSummarySchema,
});

export type ProvisioningSnapshot = z.infer<
    typeof provisioningSnapshotSchema
>;