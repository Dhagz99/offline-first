"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { useState } from "react";



import type {
    GenerateBranchCredentialInput,
    GeneratedBranchCredential,
} from "@repo/shared";
import { generateBranchCredential, getBranchCredentials, revokeBranchCredential } from "../service/branchCredential.service";

/* =========================
   QUERY KEYS
========================= */

export const branchCredentialKeys = {
    all: ["branch-credentials"] as const,

    list: (branchId: string) =>
        ["branch-credentials", branchId] as const,
};

/* =========================
   GET CREDENTIALS
========================= */

export function useBranchCredentials(
    branchId: string,
    enabled = true
) {
    return useQuery({
        queryKey: branchCredentialKeys.list(branchId),

        queryFn: () => getBranchCredentials(branchId),

        enabled: enabled && Boolean(branchId),

        staleTime: 10_000,

        refetchInterval: 30_000,
    });
}

/* =========================
   GENERATE CREDENTIAL
========================= */

export function useGenerateBranchCredential(
    branchId: string
) {
    const queryClient = useQueryClient();

    const [isPending, setIsPending] = useState(false);

    async function generate(
        data: GenerateBranchCredentialInput = {}
    ): Promise<GeneratedBranchCredential> {
        setIsPending(true);

        try {
            const result = await generateBranchCredential(
                branchId,
                data
            );

            void queryClient.invalidateQueries({
                queryKey:
                    branchCredentialKeys.list(branchId),
            });

            return result;
        } finally {
            setIsPending(false);
        }
    }

    return {
        generate,
        isPending,
    };
}

/* =========================
   REVOKE CREDENTIAL
========================= */

export function useRevokeBranchCredential(
    branchId: string
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentialId: string) =>
            revokeBranchCredential(
                branchId,
                credentialId
            ),

        retry: false,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey:
                    branchCredentialKeys.list(branchId),
            });
        },
    });
}