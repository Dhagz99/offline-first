import type {
    Prisma,
} from "../../../../generated/prisma/client";

export const SyncEntityType = {
    USER_ACCESS: "USER_ACCESS",
    BRANCH: "BRANCH",
} as const;

export type SyncEntityType =
    (typeof SyncEntityType)[keyof typeof SyncEntityType];

export type SyncOperation =
    | "CREATE"
    | "UPDATE"
    | "DELETE";

export type CreateChangeLogInput = {
    branchId: string;

    entityType: SyncEntityType;

    entityId: string;

    operation: SyncOperation;

    payload: Prisma.InputJsonObject;

    schemaVersion?: number;
};