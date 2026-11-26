import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  syncHeartbeatSchema,
} from "@repo/shared";

import type {
  AuthenticatedBranch,
} from "@/middleware/branch-auth.middleware";

import {
  saveHeartbeatService,
} from "./heartbeat.service";

export async function saveHeartbeatController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const branch = res.locals
      .authenticatedBranch as AuthenticatedBranch | undefined;

    if (!branch) {
      return res.status(401).json({
        success: false,
        code: "INVALID_BRANCH_CREDENTIAL",
        message: "Branch authentication required",
      });
    }

    const validation = syncHeartbeatSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        code: "INVALID_HEARTBEAT_PAYLOAD",
        message: "Invalid synchronization heartbeat",
      });
    }

    const result = await saveHeartbeatService(
      branch,
      validation.data
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).json({
      success: true,
      message: "Heartbeat recorded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}