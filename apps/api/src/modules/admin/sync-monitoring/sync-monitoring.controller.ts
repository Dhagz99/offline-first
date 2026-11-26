
import type {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    getSyncMonitoringService,
} from "./sync-monitoring.service";

export async function getSyncMonitoringController(
    _req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result =
            await getSyncMonitoringService();

        res.setHeader(
            "Cache-Control",
            "no-store, private"
        );

        res.status(200).json({
            success: true,
            message:
                "Synchronization monitoring retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}
