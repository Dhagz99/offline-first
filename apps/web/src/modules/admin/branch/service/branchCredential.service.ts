
import api from "@/lib/api/api-client";
import {
    branchCredentialSchema,
    generatedBranchCredentialSchema,
    type ApiResponse,
    type BranchCredential,
    type GeneratedBranchCredential,
    type GenerateBranchCredentialInput,
} from "@repo/shared";

const BASE_URL = "/admin/branches";

/* =========================
   GET BRANCH CREDENTIALS
========================= */

export async function getBranchCredentials(
    branchId: string
): Promise<BranchCredential[]> {
    const response = await api.get<
        ApiResponse<BranchCredential[]>
    >(
        `${BASE_URL}/${branchId}/credentials`
    );

    return branchCredentialSchema
        .array()
        .parse(response.data.data);
}

/* =========================
   GENERATE / ROTATE
========================= */

export async function generateBranchCredential(
    branchId: string,
    data: GenerateBranchCredentialInput = {}
): Promise<GeneratedBranchCredential> {
    const response = await api.post<
        ApiResponse<GeneratedBranchCredential>
    >(
        `${BASE_URL}/${branchId}/credentials`,
        data
    );

    return generatedBranchCredentialSchema.parse(
        response.data.data
    );
}

/* =========================
   REVOKE CREDENTIAL
========================= */

export async function revokeBranchCredential(
    branchId: string,
    credentialId: string
): Promise<void> {
    await api.patch(
        `${BASE_URL}/${branchId}/credentials/${credentialId}/revoke`
    );
}