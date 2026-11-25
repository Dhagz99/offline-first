import type {
    Prisma,
} from "../../../../generated/prisma/client";

import {
    appendChangeLog,
} from "./change-log.service";

import {
    SyncEntityType,
} from "./change-log.types";

export async function publishBranchChange(
    tx: Prisma.TransactionClient,

    branchId: string,

    operation: "CREATE" | "UPDATE"
) {

    const branch =
        await tx.branch.findUniqueOrThrow({
            where: {
                id: branchId,
            },

            select: {
                id: true,
                branchCode: true,
                branchName: true,
                address: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

    return appendChangeLog(tx, {
        branchId,

        entityType:
            SyncEntityType.BRANCH,

        entityId: branchId,

        operation,

        payload: {
            ...branch,

            createdAt:
                branch.createdAt.toISOString(),

            updatedAt:
                branch.updatedAt.toISOString(),
        },
    });
}