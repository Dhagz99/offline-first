import { z } from "zod";

/* =========================
   BRANCH CREDENTIAL SCHEMA
========================= */

export const branchCredentialSchema = z.object({
    id: z.uuid(),
    branchId: z.uuid(),

    keyPrefix: z.string(),

    isActive: z.boolean(),

    lastUsedAt: z.iso.datetime().nullable(),
    expiresAt: z.iso.datetime().nullable(),
    revokedAt: z.iso.datetime().nullable(),

    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

export type BranchCredential = z.infer<
    typeof branchCredentialSchema
>;

/* =========================
   BRANCH IDENTITY
========================= */

export const credentialBranchSchema = z.object({
    id: z.uuid(),
    branchCode: z.string(),
    branchName: z.string(),
    isActive: z.boolean(),
});

export type CredentialBranch = z.infer<
    typeof credentialBranchSchema
>;

/* =========================
   GENERATE CREDENTIAL INPUT
========================= */

export const generateBranchCredentialSchema = z.object({
    expiresAt: z.iso.datetime({
        offset: true,
    }).optional(),
});

export type GenerateBranchCredentialInput = z.infer<
    typeof generateBranchCredentialSchema
>;

/* =========================
   GENERATED CREDENTIAL
========================= */

export const generatedBranchCredentialSchema =
    branchCredentialSchema.extend({
        apiKey: z.string().regex(/^brk_[a-f0-9]{64}$/),

        branch: credentialBranchSchema,
    });

export type GeneratedBranchCredential = z.infer<
    typeof generatedBranchCredentialSchema
>;

/* =========================
   CREDENTIAL STATUS
========================= */

export type BranchCredentialStatus =
    | "ACTIVE"
    | "REVOKED"
    | "EXPIRED"
    | "INACTIVE";

export function getBranchCredentialStatus(
    credential: BranchCredential
): BranchCredentialStatus {
    if (credential.revokedAt) {
        return "REVOKED";
    }

    if (!credential.isActive) {
        return "INACTIVE";
    }

    if (
        credential.expiresAt &&
        new Date(credential.expiresAt).getTime() <= Date.now()
    ) {
        return "EXPIRED";
    }

    return "ACTIVE";
}