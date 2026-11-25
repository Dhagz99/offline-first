import { z } from "zod";

import {
    provisioningSnapshotSchema,
    type ProvisioningSnapshot,
} from "@repo/shared";

import { appConfig } from "@/config/app.config";
import { env } from "@/config/env";

const provisioningResponseSchema = z.object({
    success: z.literal(true),

    message: z.string().optional(),

    data: provisioningSnapshotSchema,
});

/* =========================
   DOWNLOAD SNAPSHOT
========================= */

export async function downloadProvisioningSnapshot():
    Promise<ProvisioningSnapshot> {

    if (!appConfig.isBranch) {
        throw new Error(
            "Provisioning is only available in BRANCH mode"
        );
    }

    const centralApiUrl =
        appConfig.sync.centralApiUrl;

    const apiKey =
        appConfig.branch.apiKey;

    if (!centralApiUrl) {
        throw new Error(
            "CENTRAL_API_URL is not configured"
        );
    }

    if (!apiKey) {
        throw new Error(
            "BRANCH_API_KEY is not configured"
        );
    }

    const baseUrl = new URL(centralApiUrl);

    if (
        baseUrl.protocol !== "http:" &&
        baseUrl.protocol !== "https:"
    ) {
        throw new Error(
            "Invalid central API protocol"
        );
    }

    if (
        env.NODE_ENV === "production" &&
        baseUrl.protocol !== "https:"
    ) {
        throw new Error(
            "Central API must use HTTPS in production"
        );
    }

    const url =
        `${centralApiUrl.replace(/\/+$/, "")}/sync/provision`;

    console.log(
        "[PROVISIONING] Connecting to central API..."
    );

    let response: Response;

    try {
        response = await fetch(url, {
            method: "GET",

            headers: {
                Accept: "application/json",

                "x-branch-api-key": apiKey,
            },

            cache: "no-store",

            redirect: "error",

            signal: AbortSignal.timeout(30_000),
        });
    } catch {
        throw new Error(
            "Unable to connect to central provisioning API"
        );
    }

    if (!response.ok) {
        throw new Error(
            `Provisioning request failed with HTTP ${response.status}`
        );
    }

    let body: unknown;

    try {
        body = await response.json();
    } catch {
        throw new Error(
            "Central API returned an invalid JSON response"
        );
    }

    const parsed =
        provisioningResponseSchema.safeParse(body);

    if (!parsed.success) {
        throw new Error(
            "Central API returned an invalid provisioning snapshot"
        );
    }

    console.log(
        "[PROVISIONING] Snapshot downloaded successfully"
    );

    return parsed.data.data;
}