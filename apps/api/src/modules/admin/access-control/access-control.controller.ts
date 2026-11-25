import type { Request, Response, NextFunction } from "express";

import { sendSuccess } from "@/lib/http/response";
import * as accessControlService from "./access-control.service";
import { emitUserCreated } from "@/socket/emitters/user.emitter";
import z from "zod";
import { updateRolePermissionsSchema } from "@repo/shared";

export async function getUsersController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const status =
            req.query.status === "all" ||
            req.query.status === "active" ||
            req.query.status === "inactive"
                ? req.query.status
                : undefined;

        const branchId =
            req.query.branchId &&
            req.query.branchId !== "all"
                ? z.uuid("Invalid branch ID").parse(
                    req.query.branchId
                )
                : undefined;

        const page = z.coerce.number()
            .int()
            .positive()
            .default(1)
            .parse(req.query.page);

        const limit = z.coerce.number()
            .int()
            .min(1)
            .max(100)
            .default(10)
            .parse(req.query.limit);

        const result =
            await accessControlService.getUsers({
                page,
                limit,

                search:
                    typeof req.query.search === "string"
                        ? req.query.search.trim()
                        : undefined,

                role:
                    typeof req.query.role === "string"
                        ? req.query.role
                        : undefined,

                status,

                sort:
                    typeof req.query.sort === "string"
                        ? req.query.sort
                        : undefined,

                branchId,
            });

        sendSuccess(res, result.data, {
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}
export async function createUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await accessControlService.createUser(req.body);

        emitUserCreated(result);

        sendSuccess(res, result, {
            statusCode: 201,
            message: "User created successfully",
        });
    } catch (error) {
        next(error);
    }
}

export async function updateUserController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
          const userId = z.uuid("Invalid user ID").parse(
            req.params.userId
        );

       const result = await accessControlService.updateUser(
            userId,
            req.body
        );

        sendSuccess(res, result, {
            statusCode: 200,
            message: "User updated successfully",
        });
    } catch (error) {
        next(error);
    }
}

export const deleteUserController = async (
    req: Request,
    res: Response
) => {
     const userId = z.uuid("Invalid user ID").parse(
            req.params.userId
        );

    await accessControlService.deleteUserService(userId);

    return sendSuccess(
        res,
        null,
        { message: "User deleted successfully" }
    );
};




export async function getRolesController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const roles = await accessControlService.getRoles();

        sendSuccess(res, roles, {
            statusCode: 200,
            message: "User updated successfully",
        });
    } catch (error) {
        next(error);
    }
}

export async function createRoleController(
    req: Request,
    res: Response,
    next: NextFunction
) {

    try {
        const role = await accessControlService.createRole(
            req.body
        );

        sendSuccess(res, role, {
            statusCode: 201,
            message: "Role created successfully",
        });
    } catch (error) {
        next(error);
    }
}

export async function updateRoleController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
          const roleId = z.uuid("Invalid role ID").parse(
            req.params.roleId
        );
        const role = await accessControlService.updateRole(
              roleId,
            req.body
        );

        sendSuccess(res, role, {
            statusCode: 200,
            message: "Role updated successfully",
        });
    } catch (error) {
        next(error);
    }
}




export async function getPermissionsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const permissions = await accessControlService.getPermissions();

        sendSuccess(res, permissions, {
            statusCode: 200,
            message: "Role updated successfully",
        });
    } catch (error) {
        next(error);
    }
}
export async function updateRolePermissionsController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const roleId = z.uuid(
            "Invalid role ID"
        ).parse(req.params.roleId);

        const body = updateRolePermissionsSchema.parse(
            req.body
        );

        const result =
            await accessControlService.updateRolePermissions(
                roleId,
                body
            );

        sendSuccess(res, result, {
            statusCode: 200,
            message: "Role permissions updated successfully",
        });
    } catch (error) {
        next(error);
    }
}