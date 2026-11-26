import { Router } from 'express';
import authRoutes from "../modules/auth/auth.routes";
import accessControlRoutes from "@/modules/admin/access-control/access-control.routes";
import dashboardRoutes from "@/modules/admin/dashboard/dashboard.routes";
import { authenticate } from '@/middleware/authenticate.middleware';
import branchRoutes from "@/modules/admin/branch/branch.routes";
import { centralOnly } from '@/middleware/central-only.middleware';
import syncRoutes from "@/modules/sync/sync.route";
import syncMonitoringRoutes from "@/modules/admin/sync-monitoring/sync-monitoring.routes";

const router = Router();

router.use("/auth", authRoutes);

router.use(
    "/admin/access-control",
    centralOnly,
    authenticate,
    accessControlRoutes
);

router.use(
    "/admin/dashboard",
    authenticate,
    dashboardRoutes
);

/* =====================
   BRANCH MANAGEMENT
===================== */

router.use(
    "/admin/branches",
    branchRoutes
);

router.use("/sync", syncRoutes);

router.use(
    "/admin/sync",
    syncMonitoringRoutes
);


export default router;