import { io } from "socket.io-client";

import { appConfig } from "@/config/app.config";

export function createSocket() {
    return io(
        appConfig.backendUrl || undefined,
        {
            path: "/socket.io",

            withCredentials: true,

            autoConnect: false,

            reconnection: true,

            reconnectionAttempts: Infinity,

            reconnectionDelay: 1000,

            reconnectionDelayMax: 10000,

            timeout: 10000,
        }
    );
}