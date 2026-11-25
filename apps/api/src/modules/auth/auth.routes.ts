import { Router } from "express";

import {
    authenticate,
} from "@/middleware/authenticate.middleware";

import {
    authRateLimiter,
} from "@/middleware/rate-limit.middleware";

import {
    me,
    logout,
    loginController,
} from "./auth.controller";

const router = Router();

/* =========================
   LOGIN
========================= */

router.post(
    "/login",
    authRateLimiter,
    loginController
);

/* =========================
   CURRENT USER
========================= */

router.get(
    "/me",
    authenticate,
    me
);

/* =========================
   LOGOUT
========================= */

router.post(
    "/logout",
    logout
);

export default router;