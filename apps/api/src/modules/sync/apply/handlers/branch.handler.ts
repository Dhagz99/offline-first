import type {
    Prisma,
} from "../../../../../generated/prisma/client";

import type {
    BranchChangePayload,
} from "@repo/shared";

/* =========================
   APPLY BRANCH CHANGE
========================= */

export async function applyBranchUpsert(
    tx: Prisma.TransactionClient,

    payload: BranchChangePayload
) {

    const {
        id,

        createdAt,

        updatedAt,

        ...fields
    } = payload;

    const data = {
        ...fields,

        createdAt:
            new Date(createdAt),

        updatedAt:
            new Date(updatedAt),
    };

    await tx.branch.upsert({
        where: {
            id,
        },

        create: {
            id,

            ...data,
        },

        update: data,
    });
}