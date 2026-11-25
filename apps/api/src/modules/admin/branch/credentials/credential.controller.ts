import type {
    Request,
    Response,
    NextFunction,
} from "express";

import * as credentialService from "./credential.service";

import {
    generateCredentialRequestSchema,
    getCredentialsRequestSchema,
    revokeCredentialRequestSchema,
} from "./credential.schema";

/* =====================
   GENERATE CREDENTIAL
===================== */

export async function generateCredentialController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { params, body } =
            generateCredentialRequestSchema.parse({
                params: req.params,
                body: req.body ?? {},
            });

        const result =
            await credentialService.generateCredential(
                params.branchId,

                body.expiresAt
                    ? new Date(body.expiresAt)
                    : undefined
            );

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        res.status(201).json({
            success: true,
            message: "Branch credential generated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/* =====================
   DISPLAY CREDENTIALS
===================== */

export async function getCredentialsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { params } =
            getCredentialsRequestSchema.parse({
                params: req.params,
            });

        const result =
            await credentialService.getCredentials(
                params.branchId
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/* =====================
   REVOKE CREDENTIAL
===================== */

export async function revokeCredentialController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { params } =
            revokeCredentialRequestSchema.parse({
                params: req.params,
            });

        const result =
            await credentialService.revokeCredential(
                params.branchId,
                params.credentialId
            );

        res.status(200).json({
            success: true,
            message: result.message,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}