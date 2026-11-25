import { Router } from "express";

import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { validate } from "@/middleware/validate.middleware";
import { centralOnly } from "@/middleware/central-only.middleware";

import {
    getBranchesController,
    getBranchController,
    getBranchOptionsController,
    getBranchSummaryController,
    createBranchController,
    updateBranchController,
    updateBranchStatusController,
} from "./branch.controller";

import {
    getBranchesRequestSchema,
    getBranchRequestSchema,
    createBranchRequestSchema,
    updateBranchRequestSchema,
    updateBranchStatusRequestSchema,
} from "./branch.schema";
import { generateCredentialController, getCredentialsController, revokeCredentialController } from "./credentials/credential.controller";

const router = Router();

/* =====================
   MIDDLEWARE
===================== */

router.use(authenticate);

router.use(centralOnly);

/* =====================
   AUTHORIZATION
===================== */

const canViewBranches = authorize({
    permissions: [
        "BRANCH_VIEW",
        "BRANCH_MANAGE",
    ],
});

const canManageBranches = authorize({
    permissions: [
        "BRANCH_MANAGE",
    ],
});

/* =====================
   GET BRANCHES
===================== */

router.get(
    "/",
    canViewBranches,
    validate(getBranchesRequestSchema),
    getBranchesController
);

/* =====================
   BRANCH SUMMARY
===================== */

router.get(
    "/summary",
    canViewBranches,
    getBranchSummaryController
);

/* =====================
   BRANCH OPTIONS
===================== */

router.get(
    "/options",
    canViewBranches,
    getBranchOptionsController
);

/* =====================
   GET BRANCH BY ID
===================== */

router.get(
    "/:branchId",
    canViewBranches,
    validate(getBranchRequestSchema),
    getBranchController
);

/* =====================
   CREATE BRANCH
===================== */

router.post(
    "/",
    canManageBranches,
    validate(createBranchRequestSchema),
    createBranchController
);

/* =====================
   UPDATE BRANCH
===================== */

router.patch(
    "/:branchId",
    canManageBranches,
    validate(updateBranchRequestSchema),
    updateBranchController
);

/* =====================
   UPDATE BRANCH STATUS
===================== */

router.patch(
    "/:branchId/status",
    canManageBranches,
    validate(updateBranchStatusRequestSchema),
    updateBranchStatusController
);


router.get(
    "/:branchId/credentials",
    getCredentialsController
);

router.post(
    "/:branchId/credentials",
    generateCredentialController
);

router.patch(
    "/:branchId/credentials/:credentialId/revoke",
    revokeCredentialController
);

export default router;