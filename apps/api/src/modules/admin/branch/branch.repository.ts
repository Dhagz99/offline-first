import { prisma } from "@/lib/database/prisma";

import type { Prisma } from "../../../../generated/prisma/client";

import {
    branchQuerySchema,
    type BranchQueryParams,
    type CreateBranchSchema,
    type UpdateBranchSchema,
} from "@repo/shared";

/* =====================
   BRANCH SELECT
===================== */

const branchSelect = {
    id: true,
    branchCode: true,
    branchName: true,
    address: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,

    _count: {
        select: {
            users: true,
        },
    },
} satisfies Prisma.BranchSelect;

/* =====================
   FIND ALL BRANCHES
===================== */

export async function findAll(
    params: BranchQueryParams = {}
) {
    const {
        page,
        limit,
        search,
        status,
    } = branchQuerySchema.parse(params);

    const skip = (page - 1) * limit;

    const where: Prisma.BranchWhereInput = {};

    if (search) {
        where.OR = [
            {
                branchCode: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                branchName: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                address: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (status === "active") {
        where.isActive = true;
    }

    if (status === "inactive") {
        where.isActive = false;
    }

    const [branches, total] = await prisma.$transaction([
        prisma.branch.findMany({
            where,

            select: branchSelect,

            skip,
            take: limit,

            orderBy: [
                {
                    branchName: "asc",
                },
                {
                    id: "asc",
                },
            ],
        }),

        prisma.branch.count({
            where,
        }),
    ]);

    return {
        data: branches,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/* =====================
   FIND BRANCH BY ID
===================== */

export async function findById(
    branchId: string
) {
    return prisma.branch.findUnique({
        where: {
            id: branchId,
        },

        select: branchSelect,
    });
}

/* =====================
   FIND BRANCH BY CODE
===================== */

export async function findByCode(
    branchCode: string
) {
    return prisma.branch.findUnique({
        where: {
            branchCode,
        },

        select: branchSelect,
    });
}

/* =====================
   BRANCH OPTIONS
===================== */

export async function findAllOptions() {
    return prisma.branch.findMany({
        where: {
            isActive: true,
        },

        select: {
            id: true,
            branchCode: true,
            branchName: true,
        },

        orderBy: {
            branchName: "asc",
        },
    });
}

/* =====================
   BRANCH SUMMARY
===================== */

export async function getSummary() {
    const [
        totalBranches,
        activeBranches,
        inactiveBranches,
    ] = await prisma.$transaction([
        prisma.branch.count(),

        prisma.branch.count({
            where: {
                isActive: true,
            },
        }),

        prisma.branch.count({
            where: {
                isActive: false,
            },
        }),
    ]);

    return {
        totalBranches,
        activeBranches,
        inactiveBranches,
    };
}

/* =====================
   CREATE BRANCH
===================== */

export async function create(
    params: CreateBranchSchema
) {
    return prisma.branch.create({
        data: {
            branchCode: params.branchCode,

            branchName: params.branchName,

            address: params.address ?? null,

            isActive: true,
        },

        select: branchSelect,
    });
}

/* =====================
   UPDATE BRANCH
===================== */

export async function update(
    branchId: string,
    params: UpdateBranchSchema
) {
    return prisma.branch.update({
        where: {
            id: branchId,
        },

        data: params,

        select: branchSelect,
    });
}

/* =====================
   UPDATE BRANCH STATUS
===================== */

export async function updateStatus(
    branchId: string,
    isActive: boolean
) {
    return prisma.branch.update({
        where: {
            id: branchId,
        },

        data: {
            isActive,
        },

        select: branchSelect,
    });
}