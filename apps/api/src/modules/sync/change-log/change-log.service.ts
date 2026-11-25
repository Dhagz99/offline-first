import { prisma } from "@/lib/database/prisma";

import { appConfig } from "@/config/app.config";

import { AppError } from "@/errors/app-error";

import { ErrorCodes } from "@/errors/error-codes";

import type {
    Prisma,
} from "../../../../generated/prisma/client";

import type {
    CreateChangeLogInput,
} from "./change-log.types";

import {
    lockVersionCounter,
    insertChangeLog,
} from "./change-log.repository";

/* =========================
   CENTRAL MODE VALIDATION
========================= */

function assertCentralMode() {
    if (!appConfig.isCentral) {
        throw new AppError(
            "Central synchronization operation is not allowed on a branch",
            403,
            ErrorCodes.FORBIDDEN
        );
    }
}

/* =========================
   SYNCHRONIZED TRANSACTION
========================= */

export async function withChangeLogTransaction<T>(
    callback: (
        tx: Prisma.TransactionClient
    ) => Promise<T>
): Promise<T> {

    assertCentralMode();

    return prisma.$transaction(
        async (tx) => {

            // Always acquire this lock before
            // modifying synchronized records.

            await lockVersionCounter(tx);

            return callback(tx);
        },

        {
            isolationLevel: "ReadCommitted",

            maxWait: 10_000,

            timeout: 30_000,
        }
    );
}

/* =========================
   APPEND CHANGE EVENT
========================= */

export async function appendChangeLog(
    tx: Prisma.TransactionClient,
    input: CreateChangeLogInput
) {
    assertCentralMode();

    return insertChangeLog(
        tx,
        input
    );
}