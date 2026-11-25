import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    verifyToken,
} from "@/modules/auth/internal/token.service";

import {
    authConfig,
} from "@/config/auth.config";

import {
    getAuthenticatedUser,
} from "@/modules/auth/auth.service";

import type {
    JwtPayload,
} from "@/modules/auth/auth.types";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const token =
        req.cookies?.[
            authConfig.accessTokenCookie
        ];

    if (
        typeof token !== "string" ||
        !token
    ) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    let payload: JwtPayload;

    try {

        payload = verifyToken(token);

    } catch {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }

    try {

        req.user =
            await getAuthenticatedUser(
                payload.id
            );

        return next();

    } catch (error) {

        return next(error);
    }
}