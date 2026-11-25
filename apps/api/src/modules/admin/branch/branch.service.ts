import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";

import { Prisma } from "../../../../generated/prisma/client";

import type {
    BranchQueryParams,
    CreateBranchSchema,
    UpdateBranchSchema,
    UpdateBranchStatusSchema,
} from "@repo/shared";

import * as branchRepository from "./branch.repository";

/* =====================
   GET BRANCHES
===================== */

export async function getBranches(
    params: BranchQueryParams = {}
) {
    return branchRepository.findAll(params);
}

/* =====================
   GET BRANCH
===================== */

export async function getBranchById(
    branchId: string
) {
    const branch =
        await branchRepository.findById(branchId);

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
   BRANCH OPTIONS
===================== */

export async function getBranchOptions() {
    return branchRepository.findAllOptions();
}

/* =====================
   BRANCH SUMMARY
===================== */

export async function getBranchSummary() {
    return branchRepository.getSummary();
}

/* =====================
   CREATE BRANCH
===================== */

export async function createBranch(
    params: CreateBranchSchema
) {
    const branchCode = params.branchCode
        .trim()
        .toUpperCase();

    const existingBranch =
        await branchRepository.findByCode(
            branchCode
        );

    if (existingBranch) {
        throw new AppError(
            "Branch code already exists",
            409,
            ErrorCodes.BRANCH_ALREADY_EXISTS
        );
    }

    try {
        return await branchRepository.create({
            ...params,
            branchCode,
        });
    } catch (error) {
        // Protect against concurrent duplicate creation.
        if (
            error instanceof
                Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new AppError(
                "Branch code already exists",
                409,
                ErrorCodes.BRANCH_ALREADY_EXISTS
            );
        }

        throw error;
    }
}

/* =====================
   UPDATE BRANCH
===================== */

export async function updateBranch(
    branchId: string,
    params: UpdateBranchSchema
) {
    await getBranchById(branchId);

    return branchRepository.update(
        branchId,
        params
    );
}

/* =====================
   UPDATE BRANCH STATUS
===================== */

export async function updateBranchStatus(
    branchId: string,
    params: UpdateBranchStatusSchema
) {
    await getBranchById(branchId);

    return branchRepository.updateStatus(
        branchId,
        params.isActive
    );
}