import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    branchQuerySchema,
    createBranchSchema,
    updateBranchSchema,
    updateBranchStatusSchema,
} from "@repo/shared";

import { sendSuccess } from "@/lib/http/response";

import { branchIdParamsSchema } from "./branch.schema";

import * as branchService from "./branch.service";

/* =====================
   GET ALL BRANCHES
===================== */

export async function getBranchesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const query = branchQuerySchema.parse(
            req.query
        );

        const result =
            await branchService.getBranches(query);

        sendSuccess(res, result.data, {
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

/* =====================
   GET BRANCH BY ID
===================== */

export async function getBranchController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { branchId } =
            branchIdParamsSchema.parse(req.params);

        const result =
            await branchService.getBranchById(
                branchId
            );

        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
}

/* =====================
   GET BRANCH OPTIONS
===================== */

export async function getBranchOptionsController(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result =
            await branchService.getBranchOptions();

        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
}

/* =====================
   GET BRANCH SUMMARY
===================== */

export async function getBranchSummaryController(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result =
            await branchService.getBranchSummary();

        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
}

/* =====================
   CREATE BRANCH
===================== */

export async function createBranchController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const body = createBranchSchema.parse(
            req.body
        );

        const result =
            await branchService.createBranch(body);

        sendSuccess(res, result, {
            statusCode: 201,
            message: "Branch created successfully",
        });
    } catch (error) {
        next(error);
    }
}

/* =====================
   UPDATE BRANCH
===================== */

export async function updateBranchController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { branchId } =
            branchIdParamsSchema.parse(req.params);

        const body = updateBranchSchema.parse(
            req.body
        );

        const result =
            await branchService.updateBranch(
                branchId,
                body
            );

        sendSuccess(res, result, {
            message: "Branch updated successfully",
        });
    } catch (error) {
        next(error);
    }
}

/* =====================
   UPDATE BRANCH STATUS
===================== */

export async function updateBranchStatusController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { branchId } =
            branchIdParamsSchema.parse(req.params);

        const body =
            updateBranchStatusSchema.parse(req.body);

        const result =
            await branchService.updateBranchStatus(
                branchId,
                body
            );

        sendSuccess(res, result, {
            message: body.isActive
                ? "Branch activated successfully"
                : "Branch deactivated successfully",
        });
    } catch (error) {
        next(error);
    }
}