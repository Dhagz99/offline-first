import { z } from "zod";

import {
    createBranchSchema,
    updateBranchSchema,
    updateBranchStatusSchema,
    branchQuerySchema,
} from "@repo/shared";

/* =====================
   BRANCH PARAMS
===================== */

export const branchIdParamsSchema = z.object({
    branchId: z.uuid("Invalid branch ID"),
});

/* =====================
   GET BRANCHES
===================== */

export const getBranchesRequestSchema = z.object({
    query: branchQuerySchema,
});

/* =====================
   GET BRANCH
===================== */

export const getBranchRequestSchema = z.object({
    params: branchIdParamsSchema,
});

/* =====================
   CREATE BRANCH
===================== */

export const createBranchRequestSchema = z.object({
    body: createBranchSchema,
});

/* =====================
   UPDATE BRANCH
===================== */

export const updateBranchRequestSchema = z.object({
    params: branchIdParamsSchema,

    body: updateBranchSchema,
});

/* =====================
   UPDATE STATUS
===================== */

export const updateBranchStatusRequestSchema = z.object({
    params: branchIdParamsSchema,

    body: updateBranchStatusSchema,
});