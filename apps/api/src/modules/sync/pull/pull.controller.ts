import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    syncPullQuerySchema,
} from "@repo/shared";

import type {
    AuthenticatedBranch,
} from "@/middleware/branch-auth.middleware";

import { AppError } from "@/errors/app-error";

import { ErrorCodes } from "@/errors/error-codes";

import {
    pullChangesService,
} from "./pull.service";

/* =========================
   GET SYNCHRONIZATION EVENTS
========================= */

export async function pullChangesController(
    req: Request,

    res: Response,

    next: NextFunction
) {
    try {

        /* =========================
           PREVENT RESPONSE CACHING
        ========================= */

        res.setHeader(
            "Cache-Control",
            "no-store, private"
        );

        res.setHeader(
            "Pragma",
            "no-cache"
        );

        res.setHeader(
            "Vary",
            "x-branch-api-key"
        );

        /* =========================
           AUTHENTICATED BRANCH
        ========================= */

        const branch =
            res.locals.authenticatedBranch as
                AuthenticatedBranch | undefined;

        if (!branch) {
            throw new AppError(
                "Invalid branch credentials",
                401,
                ErrorCodes.INVALID_BRANCH_CREDENTIAL
            );
        }

        /* =========================
           VALIDATE QUERY
        ========================= */

        const validation =
            syncPullQuerySchema.safeParse(
                req.query
            );

        if (!validation.success) {
            throw new AppError(
                "Invalid synchronization query parameters",
                400,
                ErrorCodes.VALIDATION_ERROR
            );
        }

        /* =========================
           RETRIEVE EVENTS
        ========================= */

        const result =
            await pullChangesService(
                branch,

                validation.data
            );

        /* =========================
           SUCCESS RESPONSE
        ========================= */

        return res.status(200).json({
            success: true,

            message:
                "Synchronization events retrieved successfully",

            data: result,
        });

    } catch (error) {

        next(error);
    }
}