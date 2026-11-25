import {
    randomBytes,
    createHash,
} from "node:crypto";

/* =====================
   GENERATE BRANCH KEY
===================== */

export function generateBranchApiKey() {
    const secret = randomBytes(32).toString("hex");

    const apiKey = `brk_${secret}`;

    return {
        apiKey,
        keyPrefix: apiKey.slice(0, 16),
        keyHash: hashBranchApiKey(apiKey),
    };
}

/* =====================
   HASH BRANCH KEY
===================== */

export function hashBranchApiKey(
    apiKey: string
): string {
    return createHash("sha256")
        .update(apiKey, "utf8")
        .digest("hex");
}

/* =====================
   VALIDATE KEY FORMAT
===================== */

export function isValidBranchApiKey(
    apiKey: string
): boolean {
    return /^brk_[a-f0-9]{64}$/.test(apiKey);
}