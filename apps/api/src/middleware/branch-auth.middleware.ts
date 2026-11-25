import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    hashBranchApiKey,
    isValidBranchApiKey,
} from "@/lib/security/branch-api-key";

import * as credentialRepository from
    "@/modules/admin/branch/credentials/credential.repository";
import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";



export interface AuthenticatedBranch {
    id: string;
    branchCode: string;
    branchName: string;
    credentialId: string;
}

/* =====================
   BRANCH AUTHENTICATION
===================== */

export async function branchAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const apiKey = req.get("x-branch-api-key");

        if (
            !apiKey ||
            !isValidBranchApiKey(apiKey)
        ) {
            throw new AppError(
                "Invalid branch credentials",
                401,
                ErrorCodes.INVALID_BRANCH_CREDENTIAL
            );
        }

        const keyHash = hashBranchApiKey(apiKey);

        const credential =
            await credentialRepository.findCredentialByHash(
                keyHash
            );

        if (
            !credential ||
            !credential.isActive ||
            credential.revokedAt ||
            !credential.branch.isActive ||
            (
                credential.expiresAt &&
                credential.expiresAt <= new Date()
            )
        ) {
            throw new AppError(
                "Invalid branch credentials",
                401,
                ErrorCodes.INVALID_BRANCH_CREDENTIAL
            );
        }

        const authenticatedBranch: AuthenticatedBranch = {
            id: credential.branch.id,
            branchCode: credential.branch.branchCode,
            branchName: credential.branch.branchName,
            credentialId: credential.id,
        };

        res.locals.authenticatedBranch =
            authenticatedBranch;

        await credentialRepository.updateLastUsed(
            credential.id
        );

        next();
    } catch (error) {
        next(error);
    }
}