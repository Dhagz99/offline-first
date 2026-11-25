"use client";

import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from "@tanstack/react-query";

import axios from "axios";
import { toast } from "sonner";

import type {
    BranchQueryParams,
    CreateBranchSchema,
    UpdateBranchSchema,
    UpdateBranchStatusSchema,
} from "@repo/shared";

import * as branchApi from "../service/branch.service";

/* =====================
   QUERY KEYS
===================== */

export const branchKeys = {
    all: ["branches"] as const,

    lists: () =>
        [...branchKeys.all, "list"] as const,

    list: (params: BranchQueryParams) =>
        [...branchKeys.lists(), params] as const,

    detail: (branchId: string) =>
        [...branchKeys.all, "detail", branchId] as const,

    summary: () =>
        [...branchKeys.all, "summary"] as const,

    options: () =>
        [...branchKeys.all, "options"] as const,
};

/* =====================
   ERROR HANDLER
===================== */

function getErrorMessage(
    error: unknown,
    fallback: string
) {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

/* =====================
   GET BRANCHES
===================== */

export function useBranches(
    params: BranchQueryParams = {}
) {
    return useQuery({
        queryKey: branchKeys.list(params),

        queryFn: () => branchApi.getBranches(params),

        placeholderData: keepPreviousData,

        staleTime: 30_000,
    });
}

/* =====================
   GET BRANCH
===================== */

export function useBranch(branchId: string) {
    return useQuery({
        queryKey: branchKeys.detail(branchId),

        queryFn: () => branchApi.getBranchById(branchId),

        enabled: Boolean(branchId),
    });
}

/* =====================
   GET SUMMARY
===================== */

export function useBranchSummary() {
    return useQuery({
        queryKey: branchKeys.summary(),

        queryFn: branchApi.getBranchSummary,

        staleTime: 30_000,
    });
}

/* =====================
   GET OPTIONS
===================== */

export function useBranchOptions() {
    return useQuery({
        queryKey: branchKeys.options(),

        queryFn: branchApi.getBranchOptions,

        staleTime: 60_000,
    });
}

/* =====================
   CREATE BRANCH
===================== */

export function useCreateBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateBranchSchema) =>
            branchApi.createBranch(payload),

        onSuccess: async (response) => {
            await queryClient.invalidateQueries({
                queryKey: branchKeys.all,
            });

            toast.success(
                response.message ?? "Branch created successfully"
            );
        },

        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to create branch")
            );
        },
    });
}

/* =====================
   UPDATE BRANCH
===================== */

export function useUpdateBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            branchId,
            payload,
        }: {
            branchId: string;
            payload: UpdateBranchSchema;
        }) => branchApi.updateBranch(branchId, payload),

        onSuccess: async (response) => {
            await queryClient.invalidateQueries({
                queryKey: branchKeys.all,
            });

            toast.success(
                response.message ?? "Branch updated successfully"
            );
        },

        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to update branch")
            );
        },
    });
}

/* =====================
   UPDATE BRANCH STATUS
===================== */

export function useUpdateBranchStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            branchId,
            payload,
        }: {
            branchId: string;
            payload: UpdateBranchStatusSchema;
        }) => branchApi.updateBranchStatus(branchId, payload),

        onSuccess: async (response) => {
            await queryClient.invalidateQueries({
                queryKey: branchKeys.all,
            });

            toast.success(
                response.message ?? "Branch status updated"
            );
        },

        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to update branch status")
            );
        },
    });
}