import { z } from "zod";

/* =====================
   GENERATE CREDENTIAL
===================== */

export const generateCredentialRequestSchema =
    z.object({
        params: z.object({
            branchId: z.uuid("Invalid branch ID"),
        }),

        body: z.object({
            expiresAt: z.iso.datetime({
                offset: true,
            })
                .refine(
                    (value) =>
                        new Date(value).getTime() >
                        Date.now(),
                    "Expiration must be in the future"
                )
                .optional(),
        }),
    });

/* =====================
   GET CREDENTIALS
===================== */

export const getCredentialsRequestSchema =
    z.object({
        params: z.object({
            branchId: z.uuid("Invalid branch ID"),
        }),
    });

/* =====================
   REVOKE CREDENTIAL
===================== */

export const revokeCredentialRequestSchema =
    z.object({
        params: z.object({
            branchId: z.uuid("Invalid branch ID"),

            credentialId: z.uuid(
                "Invalid credential ID"
            ),
        }),
    });