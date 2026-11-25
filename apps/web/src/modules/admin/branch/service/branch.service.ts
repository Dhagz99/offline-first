import api from "@/lib/api/api-client";

import type {
    ApiResponse,
    Branch,
    BranchSummary,
    BranchOption,
    BranchQueryParams,
    CreateBranchSchema,
    UpdateBranchSchema,
    UpdateBranchStatusSchema,
} from "@repo/shared";

const BASE_URL = "/admin/branches";

/* =====================
   GET BRANCHES
===================== */

export async function getBranches(
    params: BranchQueryParams = {}
) {
    const response = await api.get<ApiResponse<Branch[]>>(
        BASE_URL,
        { params }
    );

    return response.data;
}

/* =====================
   GET BRANCH
===================== */

export async function getBranchById(branchId: string) {
    const response = await api.get<ApiResponse<Branch>>(
        `${BASE_URL}/${branchId}`
    );

    return response.data.data;
}

/* =====================
   GET SUMMARY
===================== */

export async function getBranchSummary() {
    const response = await api.get<ApiResponse<BranchSummary>>(
        `${BASE_URL}/summary`
    );

    return response.data.data;
}

/* =====================
   GET OPTIONS
===================== */

export async function getBranchOptions() {
    const response = await api.get<ApiResponse<BranchOption[]>>(
        `${BASE_URL}/options`
    );

    return response.data.data;
}

/* =====================
   CREATE BRANCH
===================== */

export async function createBranch(
    payload: CreateBranchSchema
) {
    const response = await api.post<ApiResponse<Branch>>(
        BASE_URL,
        payload
    );

    return response.data;
}

/* =====================
   UPDATE BRANCH
===================== */

export async function updateBranch(
    branchId: string,
    payload: UpdateBranchSchema
) {
    const response = await api.patch<ApiResponse<Branch>>(
        `${BASE_URL}/${branchId}`,
        payload
    );

    return response.data;
}

/* =====================
   UPDATE STATUS
===================== */

export async function updateBranchStatus(
    branchId: string,
    payload: UpdateBranchStatusSchema
) {
    const response = await api.patch<ApiResponse<Branch>>(
        `${BASE_URL}/${branchId}/status`,
        payload
    );

    return response.data;
}