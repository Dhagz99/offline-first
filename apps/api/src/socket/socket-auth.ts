import type { ExtendedError, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { parseCookie } from "cookie";
import { env } from "@/config/env";
import { authConfig } from "@/config/auth.config";

export function authenticateSocket(
    socket: Socket,
    next: (err?: ExtendedError) => void
) {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) {
            return next(new Error("Unauthorized"));
        }

        const cookies = parseCookie(cookieHeader);
        const token = cookies[authConfig.accessTokenCookie]

        if (!token) {
            return next(new Error("Unauthorized"));
        }

        const user = jwt.verify(
            token,
            env.JWT_SECRET
        );

        socket.data.user = user;

        next();
    } catch {
        next(new Error("Unauthorized"));
    }
}