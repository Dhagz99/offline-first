import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { z } from "zod";

import { authConfig } from "@/config/auth.config";
import { sendSuccess } from "@/lib/http/response";

import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";

import * as service from "./auth.service";

/* =========================
   LOGIN SCHEMA
========================= */

const loginSchema = z.object({
    username: z.string()
        .trim()
        .min(1)
        .max(100),

    password: z.string()
        .min(1)
        .max(256),
});

/* =========================
   LOGIN
========================= */

export async function loginController(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {

        const parsed =
            loginSchema.safeParse(req.body);

        if (!parsed.success) {
            throw new AppError(
                "Validation failed",
                400,
                ErrorCodes.VALIDATION_ERROR
            );
        }

        const { token, user } =
            await service.loginUser(parsed.data);

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        res.cookie(
            authConfig.accessTokenCookie,

            token,

            {
                ...authConfig.cookieOptions,

                maxAge:
                    authConfig.accessTokenCookieMaxAge,
            }
        );

        return sendSuccess(
            res,
            user,
            {
                message: "Login successful",
            }
        );

    } catch (error) {

        return next(error);
    }
}

/* =========================
   CURRENT USER
========================= */

export async function me(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {

        if (!req.user) {
            throw new AppError(
                "Unauthorized",
                401,
                ErrorCodes.INVALID_CREDENTIALS
            );
        }

        res.setHeader(
            "Cache-Control",
            "no-store"
        );

        return sendSuccess(
            res,
            req.user
        );

    } catch (error) {

        return next(error);
    }
}

/* =========================
   LOGOUT
========================= */

export async function logout(
    _req: Request,
    res: Response,
    next: NextFunction
) {

    try {

        res.clearCookie(
            authConfig.accessTokenCookie,
            authConfig.cookieOptions
        );

        res.clearCookie(
            authConfig.refreshTokenCookie,
            authConfig.cookieOptions
        );

        return sendSuccess(
            res,
            null,
            {
                message: "Logout successful",
            }
        );

    } catch (error) {

        return next(error);
    }
}