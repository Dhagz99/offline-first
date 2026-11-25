import * as authRepository from "./auth.repository";

import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";

import type { LoginDTO } from "./auth.types";

import {
    generateAccessToken,
} from "./internal/token.service";

import {
    verifyPassword,
} from "./internal/password.service";

import {
    mapAuthenticatedUser,
} from "./auth.mapper";

import {
    canAuthenticateUser,
} from "./internal/branch-access.policy";

/* =========================
   GET AUTHENTICATED USER
========================= */

export async function getAuthenticatedUser(
    userId: string
) {

    const user =
        await authRepository.findByIdWithRoles(
            userId
        );

    if (!user || !canAuthenticateUser(user)) {
        throw new AppError(
            "Authentication failed",
            401,
            ErrorCodes.INVALID_CREDENTIALS
        );
    }

    return mapAuthenticatedUser(user);
}

/* =========================
   LOGIN USER
========================= */

export async function loginUser(
    params: LoginDTO
) {

    const { username, password } = params;

    const user =
        await authRepository.findByUsernameWithRoles(
            username
        );

    if (!user) {
        throw new AppError(
            "Invalid username or password",
            401,
            ErrorCodes.INVALID_CREDENTIALS
        );
    }

    const isPasswordValid =
        await verifyPassword(
            password,
            user.password
        );

    if (
        !isPasswordValid ||
        !canAuthenticateUser(user)
    ) {
        throw new AppError(
            "Invalid username or password",
            401,
            ErrorCodes.INVALID_CREDENTIALS
        );
    }

    const authenticatedUser =
        mapAuthenticatedUser(user);

    const token = generateAccessToken({
        id: authenticatedUser.id,
        username: authenticatedUser.username,
        roles: authenticatedUser.roles,
        permissions: authenticatedUser.permissions,
    });

    return {
        token,
        user: authenticatedUser,
    };
}