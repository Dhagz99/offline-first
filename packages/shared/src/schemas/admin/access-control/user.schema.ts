import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().trim().min(1).max(150),

    username: z.string().trim().min(3).max(100),

    email: z.email().nullable().optional(),

    password: z.string().min(8),

    roleIds: z.array(
        z.uuid("Invalid role ID")
    ).min(1, "Select at least one role"),

    branchIds: z.array(
        z.uuid("Invalid branch ID")
    ).default([]),
});

export const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(150).optional(),

    username: z.string().trim().min(3).max(100).optional(),

    email: z.email().nullable().optional(),

    password: z.union([
        z.string().min(8),
        z.literal(""),
    ]).optional(),

    isActive: z.boolean().optional(),

    roleIds: z.array(
        z.uuid("Invalid role ID")
    ).min(1).optional(),

    branchIds: z.array(
        z.uuid("Invalid branch ID")
    ).optional(),
});

export type CreateUserSchema = z.infer<
    typeof createUserSchema
>;

export type UpdateUserSchema = z.infer<
    typeof updateUserSchema
>;