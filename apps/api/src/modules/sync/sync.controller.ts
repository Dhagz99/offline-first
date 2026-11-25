import type {
    Request,
    Response,
    NextFunction,
} from "express";

import type {
    AuthenticatedBranch,
} from "@/middleware/branch-auth.middleware";

export async function testConnectionController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const branch =
            res.locals.authenticatedBranch as
                AuthenticatedBranch;

        res.status(200).json({
            success: true,

            message: "Branch authenticated successfully",

            data: {
                branchId: branch.id,
                branchCode: branch.branchCode,
                branchName: branch.branchName,
                serverTime: new Date().toISOString(),
                connected: true,
            },
        });
    } catch (error) {
        next(error);
    }
}