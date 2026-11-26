
import { Router } from "express";

import {
    authenticate,
} from "@/middleware/authenticate.middleware";

import {
    authorize,
} from "@/middleware/authorize.middleware";

import {
    centralOnly,
} from "@/middleware/central-only.middleware";

import {
    getSyncMonitoringController,
} from "./sync-monitoring.controller";

const router = Router();

router.use(authenticate);
router.use(centralOnly);

router.get(
    "/monitoring",
    authorize({
        roles: ["ADMIN"],
        permissions: ["SYNC_VIEW"],
    }),
    getSyncMonitoringController
);

export default router;
