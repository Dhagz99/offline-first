import type { Prisma } from "../../generated/prisma/client";

export async function seedSyncCounter(
    tx: Prisma.TransactionClient
) {
    const counter = await tx.syncVersionCounter.upsert({
        where: {
            id: 1,
        },
        update: {},
        create: {
            id: 1,
            lastVersion: BigInt(0),
        },
    });

    console.log(
        `Sync version counter initialized: ${counter.lastVersion.toString()}`
    );
}