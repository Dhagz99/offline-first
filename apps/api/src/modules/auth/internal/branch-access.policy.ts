import { appConfig } from "@/config/app.config";

import type {
    AuthUserRecord,
} from "../auth.repository";

/* =========================
   BRANCH ACCESS VALIDATION
========================= */

export function hasBranchAccess(
    user: AuthUserRecord
): boolean {

    if (appConfig.isCentral) {
        return true;
    }

    if (!appConfig.isBranch) {
        return false;
    }

    const branchId = appConfig.branch.id;
    const branchCode = appConfig.branch.code;

    if (!branchId || !branchCode) {
        return false;
    }

    return user.branches.some(
        ({ branch }) =>
            branch.id === branchId &&
            branch.branchCode === branchCode &&
            branch.isActive
    );
}

/* =========================
   ACCOUNT ACCESS VALIDATION
========================= */

export function canAuthenticateUser(
    user: AuthUserRecord
): boolean {

    if (!user.isActive) {
        return false;
    }

    return hasBranchAccess(user);
}