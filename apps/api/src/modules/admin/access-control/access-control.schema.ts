import { z } from "zod";

import {
    createUserSchema,
    updateUserSchema,
    updateRolePermissionsSchema,
    createRoleSchema,
    updateRoleSchema,
} from "@repo/shared";

/* =====================
   REUSABLE PARAM SCHEMAS
===================== */

export const userIdParamsSchema = z.object({
    userId: z.uuid("Invalid user ID"),
});

export const roleIdParamsSchema = z.object({
    roleId: z.uuid("Invalid role ID"),
});

/* =====================
   USER REQUEST SCHEMAS
===================== */

export const createUserRequestSchema = z.object({
    body: createUserSchema,
});

export const updateUserRequestSchema = z.object({
    params: userIdParamsSchema,

    body: updateUserSchema,
});

export const deleteUserRequestSchema = z.object({
    params: userIdParamsSchema,
});

/* =====================
   ROLE REQUEST SCHEMAS
===================== */

export const createRoleRequestSchema = z.object({
    body: createRoleSchema,
});

export const updateRoleRequestSchema = z.object({
    params: roleIdParamsSchema,

    body: updateRoleSchema,
});

/* =====================
   ROLE PERMISSION REQUEST SCHEMAS
===================== */

export const updateRolePermissionsRequestSchema = z.object({
    params: roleIdParamsSchema,

    body: updateRolePermissionsSchema,
});

/* =====================
   REQUEST TYPES
===================== */

export type CreateUserRequestSchema =
    z.infer<typeof createUserRequestSchema>;

export type UpdateUserRequestSchema =
    z.infer<typeof updateUserRequestSchema>;

export type DeleteUserRequestSchema =
    z.infer<typeof deleteUserRequestSchema>;

export type CreateRoleRequestSchema =
    z.infer<typeof createRoleRequestSchema>;

export type UpdateRoleRequestSchema =
    z.infer<typeof updateRoleRequestSchema>;

export type UpdateRolePermissionsRequestSchema =
    z.infer<typeof updateRolePermissionsRequestSchema>;