import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { appConfig } from "@/config/app.config";

import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";

export function centralOnly(
    _req: Request,
    _res: Response,
    next: NextFunction
): void {

    if (!appConfig.isCentral) {

        return next(
            new AppError(
                "This operation is only available on the central server",
                403,
                ErrorCodes.FORBIDDEN
            )
        );
    }

    next();
}