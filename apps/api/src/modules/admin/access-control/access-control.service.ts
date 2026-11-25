// access-control.service.ts

import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";
import { hashPassword } from "../../auth/internal/password.service";
import * as accessControlRepository from "./access-control.repository";
import { mapRole, mapUser } from "./access-control.mapper";
import type { CreateUserSchema, UpdateUserSchema, UpdateRolePermissionsSchema, CreateRoleSchema, UpdateRoleSchema, UserQueryParams } from "@repo/shared";

/* =====================
   USERS
===================== */

export async function getUsers(params: UserQueryParams) {
    const users =
        await accessControlRepository.findAllUsers(params);

    return {
        data: users.data.map(mapUser),
        pagination: users.pagination,
    };
}


export async function createUser(
    params: CreateUserSchema
) {
    const {
        name,
        username,
        email,
        password,
        roleIds,
        branchIds,
    } = params;

    const duplicate =
        await accessControlRepository.findDuplicateUser(
            username,
            email
        );

    if (duplicate) {
        throw new AppError(
            "Username or email already exists",
            409,
            ErrorCodes.USER_ALREADY_EXISTS
        );
    }

    const hashedPassword =
        await hashPassword(password);

    const user =
        await accessControlRepository.createUser({
            name,
            username,
            email,
            password: hashedPassword,
            roleIds,
            branchIds: branchIds ?? [],
        });

    return mapUser(user);
}


export async function updateUser(
    userId: string,
    params: UpdateUserSchema
) {
    const user =
        await accessControlRepository.findUserById(
            userId
        );

    if (!user) {
        throw new AppError(
            "User not found",
            404,
            ErrorCodes.USER_NOT_FOUND
        );
    }

    if (
        params.username !== undefined ||
        params.email !== undefined
    ) {
        const duplicate =
            await accessControlRepository.findDuplicateUser(
                params.username ?? user.username,

                params.email !== undefined
                    ? params.email
                    : user.email,

                userId
            );

        if (duplicate) {
            throw new AppError(
                "Username or email already exists",
                409,
                ErrorCodes.USER_ALREADY_EXISTS
            );
        }
    }

    const {
        password,
        ...rest
    } = params;

    const hashedPassword = password
        ? await hashPassword(password)
        : undefined;

    const updatedUser =
        await accessControlRepository.updateUser(
            userId,
            {
                ...rest,

                ...(hashedPassword && {
                    password: hashedPassword,
                }),
            }
        );

    return mapUser(updatedUser);
}

export const deleteUserService = async (userId: string) => {
    const user = await accessControlRepository.findUserById(userId);

    if (!user) {
        throw new AppError("User not found", 404, ErrorCodes.USER_NOT_FOUND);
    }

    await accessControlRepository.deleteUser(userId);
};

/* =====================
   ROLES
===================== */

export async function getRoles() {
    const roles =
        await accessControlRepository.findAllRoles();

    return roles.map(mapRole);
}


export async function createRole(
    params: CreateRoleSchema
) {
    return accessControlRepository.createRole(
        params
    );
}


export async function updateRole(
    roleId: string,
    params: UpdateRoleSchema
) {
    const role =
        await accessControlRepository.findRoleById(
            roleId
        );

    if (!role) {
        throw new AppError(
            "Role not found",
            404,
            ErrorCodes.ROLE_NOT_FOUND
        );
    }

    return accessControlRepository.updateRole(
        roleId,
        params
    );
}


/* =====================
   PERMISSIONS
===================== */

export async function getPermissions() {
    return accessControlRepository.findAllPermissions();
}


export async function updateRolePermissions(
    roleId: string,
    params: UpdateRolePermissionsSchema
) {
    const role =
        await accessControlRepository.findRoleById(
            roleId
        );

    if (!role) {
        throw new AppError(
            "Role not found",
            404,
            ErrorCodes.ROLE_NOT_FOUND
        );
    }

    // Remove duplicate permission IDs.
    const permissionIds = [
        ...new Set(params.permissionIds),
    ];

    await accessControlRepository.updateRolePermissions(
        roleId,
        permissionIds
    );

    return {
        message: "Permissions updated successfully",
    };
}