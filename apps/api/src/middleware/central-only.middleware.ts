import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";

export function centralOnly(
    _req: Request,
    _res: Response,
    next: NextFunction
): void {
    if (process.env.APP_MODE !== "CENTRAL") {
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