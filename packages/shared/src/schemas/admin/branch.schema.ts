import { z } from "zod";

/* =====================
   BRANCH CODE
===================== */

const branchCodeSchema = z
    .string()
    .trim()
    .min(2, "Branch code is required")
    .max(50)
    .toUpperCase()
    .regex(
        /^[A-Z0-9_-]+$/,
        "Branch code must contain only letters, numbers, underscores or hyphens"
    );

/* =====================
   CREATE BRANCH
===================== */

export const createBranchSchema = z.object({
    branchCode: branchCodeSchema,

    branchName: z
        .string()
        .trim()
        .min(2, "Branch name is required")
        .max(150),

    address: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),
});

/* =====================
   UPDATE BRANCH
===================== */

export const updateBranchSchema = z.object({
    branchName: z
        .string()
        .trim()
        .min(2)
        .max(150)
        .optional(),

    address: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
);

/* =====================
   BRANCH STATUS
===================== */

export const updateBranchStatusSchema = z.object({
    isActive: z.boolean(),
});

/* =====================
   BRANCH QUERY
===================== */

export const branchQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),

    search: z.string().trim().optional(),

    status: z
        .enum(["all", "active", "inactive"])
        .default("all"),
});

/* =====================
   SCHEMA TYPES
===================== */

export type CreateBranchSchema = z.infer<
    typeof createBranchSchema
>;

export type UpdateBranchSchema = z.infer<
    typeof updateBranchSchema
>;

export type UpdateBranchStatusSchema = z.infer<
    typeof updateBranchStatusSchema
>;

export type BranchQueryParams = z.input<
    typeof branchQuerySchema
>;