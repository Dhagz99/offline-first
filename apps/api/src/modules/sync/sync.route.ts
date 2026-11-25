import { Router } from "express";

import {
    branchAuthMiddleware,
} from "@/middleware/branch-auth.middleware";

import {
    centralOnly,
} from "@/middleware/central-only.middleware";

import {
    testConnectionController,
} from "./sync.controller";
import { getProvisioningSnapshotController } from "./provisioning/provisioning.controller";

const router = Router();

/* =====================
   CENTRAL SYNC ROUTES
===================== */

router.use(centralOnly);

router.use(branchAuthMiddleware);

router.get(
    "/connection",
    testConnectionController
);

/* =========================
   INITIAL PROVISIONING
========================= */

router.get(
    "/provision",
    getProvisioningSnapshotController
);

export default router;