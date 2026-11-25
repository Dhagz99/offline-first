import { AppError } from "@/errors/app-error";
import * as credentialRepository from "./credential.repository";

import {
    generateBranchApiKey,
} from "@/lib/security/branch-api-key";
import { ErrorCodes } from "@/errors/error-codes";


/* =====================
   VALIDATE BRANCH
===================== */

async function getBranch(branchId: string) {
    const branch =
        await credentialRepository.findBranchById(
            branchId
        );

    if (!branch) {
        throw new AppError(
            "Branch not found",
            404,
            ErrorCodes.BRANCH_NOT_FOUND
        );
    }

    return branch;
}

/* =====================
   GENERATE CREDENTIAL
===================== */

export async function generateCredential(
    branchId: string,
    expiresAt?: Date
) {
    const branch = await getBranch(branchId);

    if (!branch.isActive) {
        throw new AppError(
            "Cannot generate credentials for an inactive branch",
            400,
            ErrorCodes.BRANCH_INACTIVE
        );
    }

    const {
        apiKey,
        keyPrefix,
        keyHash,
    } = generateBranchApiKey();

    const credential =
        await credentialRepository.rotateCredential({
            branchId,
            keyPrefix,
            keyHash,
            expiresAt,
        });

    if (!credential) {
        throw new AppError(
            "Branch is inactive or unavailable",
            400,
            ErrorCodes.BRANCH_INACTIVE
        );
    }

    return {
        ...credential,

        branch,

        // Returned only during credential generation.
        apiKey,
    };
}

/* =====================
   DISPLAY CREDENTIALS
===================== */

export async function getCredentials(
    branchId: string
) {
    await getBranch(branchId);

    return credentialRepository.findCredentialsByBranch(
        branchId
    );
}

/* =====================
   REVOKE CREDENTIAL
===================== */

export async function revokeCredential(
    branchId: string,
    credentialId: string
) {
    await getBranch(branchId);

    const result =
        await credentialRepository.revokeCredential(
            branchId,
            credentialId
        );

    if (result.count === 0) {
        throw new AppError(
            "Active credential not found",
            404,
            ErrorCodes.BRANCH_CREDENTIAL_NOT_FOUND
        );
    }

    return {
        message: "Branch credential revoked successfully",
    };
}