import dotenv from "dotenv";
import http from "http";

import app from "./app";

import { initializeSocket } from "./config/socket.config";

import { logger } from "@/lib/logger/logger";

import { prisma } from "@/lib/database/prisma";

import {
    branchSyncWorker,
} from "./modules/sync/worker/sync.worker";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */

export const io = initializeSocket(server);

/* =========================
   START SERVER
========================= */

server.listen(PORT, "0.0.0.0", () => {
    logger.info(
        `Server running on port ${PORT}`
    );

    branchSyncWorker.start();
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */

let isShuttingDown = false;

async function shutdown(
    signal: string
): Promise<void> {

    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    logger.info(
        `[SERVER] Received ${signal}`
    );

    const forceShutdown = setTimeout(() => {

        logger.error(
            "[SERVER] Graceful shutdown timed out"
        );

        process.exit(1);

    }, 60000);

    forceShutdown.unref();

    try {

        /* =========================
           STOP BACKGROUND WORKER
        ========================= */

        const workerStopped =
            branchSyncWorker.stop();

        /* =========================
           CLOSE SOCKET.IO AND HTTP
        ========================= */

        const serverClosed =
            new Promise<void>((resolve, reject) => {

                io.close((error) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });

        /* =========================
           WAIT FOR ACTIVE OPERATIONS
        ========================= */

        await Promise.all([
            workerStopped,
            serverClosed,
        ]);

        /* =========================
           DISCONNECT DATABASE
        ========================= */

        await prisma.$disconnect();

        clearTimeout(forceShutdown);

        logger.info(
            "[SERVER] Shutdown completed"
        );

        process.exit(0);

    } catch {

        clearTimeout(forceShutdown);

        logger.error(
            "[SERVER] Graceful shutdown failed"
        );

        process.exit(1);
    }
}

/* =========================
   PROCESS SIGNALS
========================= */

process.once("SIGINT", () => {
    void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
});