import { prisma } from "@/lib/database/prisma";

import type { Prisma } from "../../../../generated/prisma/client";

import {
    branchQuerySchema,
    type BranchQueryParams,
    type CreateBranchSchema,
    type UpdateBranchSchema,
} from "@repo/shared";
import { withChangeLogTransaction } from "@/modules/sync/change-log/change-log.service";
import { publishBranchChange } from "@/modules/sync/change-log/branch-sync.service";

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

    return withChangeLogTransaction(
        async (tx) => {

            const branch =
                await tx.branch.create({
                    data: {
                        branchCode:
                            params.branchCode,

                        branchName:
                            params.branchName,

                        address:
                            params.address ?? null,

                        isActive: true,
                    },

                    select: branchSelect,
                });

            await publishBranchChange(
                tx,
                branch.id,
                "CREATE"
            );

            return branch;
        }
    );
}
/* =====================
   UPDATE BRANCH
===================== */

export async function update(
    branchId: string,

    params: UpdateBranchSchema
) {

    return withChangeLogTransaction(
        async (tx) => {

            const branch =
                await tx.branch.update({
                    where: {
                        id: branchId,
                    },

                    data: params,

                    select: branchSelect,
                });

            await publishBranchChange(
                tx,
                branch.id,
                "UPDATE"
            );

            return branch;
        }
    );
}
/* =====================
   UPDATE BRANCH STATUS
===================== */

export async function updateStatus(
    branchId: string,

    isActive: boolean
) {

    return withChangeLogTransaction(
        async (tx) => {

            const branch =
                await tx.branch.update({
                    where: {
                        id: branchId,
                    },

                    data: {
                        isActive,
                    },

                    select: branchSelect,
                });

            await publishBranchChange(
                tx,
                branch.id,
                "UPDATE"
            );

            return branch;
        }
    );
}