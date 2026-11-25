import type {
    Request,
    Response,
    NextFunction,
} from "express";

import type {
    AuthenticatedBranch,
} from "@/middleware/branch-auth.middleware";

import {
    getProvisioningSnapshotService,
} from "./provisioning.service";
import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";



/* =========================
   GET PROVISIONING SNAPSHOT
========================= */

export async function getProvisioningSnapshotController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
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

        const snapshot =
            await getProvisioningSnapshotService(
                branch.id
            );

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

        return res.status(200).json({
            success: true,

            message:
                "Branch provisioning snapshot generated successfully",

            data: snapshot,
        });
    } catch (error) {
        next(error);
    }
}