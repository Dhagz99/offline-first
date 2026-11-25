import { prisma } from "@/lib/database/prisma";

/* =====================
   SAFE CREDENTIAL SELECT
===================== */

const credentialSelect = {
    id: true,
    branchId: true,
    keyPrefix: true,
    isActive: true,
    lastUsedAt: true,
    expiresAt: true,
    revokedAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

/* =====================
   FIND BRANCH
===================== */

export async function findBranchById(
    branchId: string
) {
    return prisma.branch.findUnique({
        where: {
            id: branchId,
        },

        select: {
            id: true,
            branchCode: true,
            branchName: true,
            isActive: true,
        },
    });
}

/* =====================
   CREATE / ROTATE KEY
===================== */

type CreateCredentialInput = {
    branchId: string;
    keyPrefix: string;
    keyHash: string;
    expiresAt?: Date;
};

export async function rotateCredential(
    data: CreateCredentialInput
) {
    return prisma.$transaction(async (tx) => {
        // Serialize credential rotation for this branch.
        await tx.$queryRaw`
            SELECT id
            FROM branches
            WHERE id = ${data.branchId}::uuid
            FOR UPDATE
        `;

        const branch = await tx.branch.findUnique({
            where: {
                id: data.branchId,
            },
            select: {
                isActive: true,
            },
        });

        if (!branch?.isActive) {
            return null;
        }

        // Revoke previous active credentials.
        await tx.branchCredential.updateMany({
            where: {
                branchId: data.branchId,
                isActive: true,
            },

            data: {
                isActive: false,
                revokedAt: new Date(),
            },
        });

        // Create new credential.
        return tx.branchCredential.create({
            data: {
                branchId: data.branchId,
                keyPrefix: data.keyPrefix,
                keyHash: data.keyHash,
                expiresAt: data.expiresAt,
                isActive: true,
            },

            select: credentialSelect,
        });
    });
}

/* =====================
   LIST CREDENTIALS
===================== */

export async function findCredentialsByBranch(
    branchId: string
) {
    return prisma.branchCredential.findMany({
        where: {
            branchId,
        },

        select: credentialSelect,

        orderBy: {
            createdAt: "desc",
        },
    });
}

/* =====================
   FIND BY HASH
===================== */

export async function findCredentialByHash(
    keyHash: string
) {
    return prisma.branchCredential.findUnique({
        where: {
            keyHash,
        },

        select: {
            ...credentialSelect,

            branch: {
                select: {
                    id: true,
                    branchCode: true,
                    branchName: true,
                    isActive: true,
                },
            },
        },
    });
}

/* =====================
   UPDATE LAST USED
===================== */

export async function updateLastUsed(
    credentialId: string
) {
    const now = new Date();

    return prisma.branchCredential.updateMany({
        where: {
            id: credentialId,
            isActive: true,
            revokedAt: null,

            OR: [
                {
                    lastUsedAt: null,
                },
                {
                    lastUsedAt: {
                        lt: new Date(
                            now.getTime() - 60_000
                        ),
                    },
                },
            ],
        },

        data: {
            lastUsedAt: now,
        },
    });
}

/* =====================
   REVOKE CREDENTIAL
===================== */

export async function revokeCredential(
    branchId: string,
    credentialId: string
) {
    return prisma.branchCredential.updateMany({
        where: {
            id: credentialId,
            branchId,
            isActive: true,
        },

        data: {
            isActive: false,
            revokedAt: new Date(),
        },
    });
}