"use client";

import {
    useState,
} from "react";

import {
    X,
    KeyRound,
    ShieldCheck,
    ShieldAlert,
    RefreshCw,
    Loader2,
    Ban,
    Clock,
    Building2,
    AlertCircle,
    Copy,
    Server,
} from "lucide-react";

import { toast } from "sonner";

import {
    getBranchCredentialStatus,
    type CredentialBranch,
    type GeneratedBranchCredential,
} from "@repo/shared";

import {
    useBranchCredentials,
    useGenerateBranchCredential,
    useRevokeBranchCredential,
} from "../hooks/useBranchCredentials";

import {
    BranchCredentialHistory,
} from "./BranchCredentialHistory";

import {
    BranchCredentialStatus,
} from "./BranchCredentialStatus";

import {
    GeneratedCredentialDialog,
} from "./GeneratedCredentialDialog";

/* =========================
   TYPES
========================= */

type Props = {
    open: boolean;
    branch: CredentialBranch | null;
    centralApiUrl: string;
    onClose: () => void;
};

type ContentProps = {
    branch: CredentialBranch;
    centralApiUrl: string;
    onClose: () => void;
};

type ConfirmAction =
    | "GENERATE"
    | "ROTATE"
    | "REVOKE"
    | null;

/* =========================
   DATE FORMATTER
========================= */

function formatDate(value: string | null) {
    if (!value) return "Never";

    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Manila",
    }).format(new Date(value));
}

/* =========================
   MODAL WRAPPER
========================= */

export function BranchCredentialModal({
    open,
    branch,
    centralApiUrl,
    onClose,
}: Props) {
    if (!open || !branch) {
        return null;
    }

    return (
        <BranchCredentialContent
            key={branch.id}
            branch={branch}
            centralApiUrl={centralApiUrl}
            onClose={onClose}
        />
    );
}

/* =========================
   MODAL CONTENT
========================= */

function BranchCredentialContent({
    branch,
    centralApiUrl,
    onClose,
}: ContentProps) {
    const [generatedCredential, setGeneratedCredential] =
        useState<GeneratedBranchCredential | null>(null);

    const [confirmAction, setConfirmAction] =
        useState<ConfirmAction>(null);

    const [expirationDays, setExpirationDays] =
        useState("365");

    const {
        data: credentials = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useBranchCredentials(branch.id);

    const generateMutation =
        useGenerateBranchCredential(branch.id);

    const revokeMutation =
        useRevokeBranchCredential(branch.id);

    const activeCredential = credentials.find(
        (credential) =>
            getBranchCredentialStatus(credential) ===
            "ACTIVE"
    );

    const isBusy =
        generateMutation.isPending ||
        revokeMutation.isPending;

    const environmentConfig = [
        "APP_MODE=BRANCH",
        `BRANCH_ID=${branch.id}`,
        `BRANCH_CODE=${branch.branchCode}`,
        `CENTRAL_API_URL=${centralApiUrl}`,
        "BRANCH_API_KEY=<YOUR_GENERATED_KEY>",
        "SYNC_ENABLED=false",
        "SYNC_INTERVAL_MS=10000",
        "SYNC_BATCH_SIZE=50",
    ].join("\n");

    /* =========================
       GENERATE / ROTATE
    ========================= */

    async function handleGenerate() {
        if (isBusy || !branch.isActive) return;

        try {
            const expiresAt =
                expirationDays === "never"
                    ? undefined
                    : new Date(
                        Date.now() +
                        Number(expirationDays) *
                        24 *
                        60 *
                        60 *
                        1000
                    ).toISOString();

            const result =
                await generateMutation.generate({
                    expiresAt,
                });

            setGeneratedCredential(result);

            setConfirmAction(null);

            toast.success(
                "Branch credential generated successfully"
            );
        } catch {
            toast.error(
                "Unable to generate branch credential"
            );
        }
    }

    /* =========================
       REVOKE
    ========================= */

    async function handleRevoke() {
        if (!activeCredential || isBusy) return;

        try {
            await revokeMutation.mutateAsync(
                activeCredential.id
            );

            setConfirmAction(null);

            toast.success(
                "Branch credential revoked successfully"
            );
        } catch {
            toast.error(
                "Unable to revoke branch credential"
            );
        }
    }

    /* =========================
       COPY ENVIRONMENT
    ========================= */

    async function handleCopyEnvironment() {
        try {
            await navigator.clipboard.writeText(
                environmentConfig
            );

            toast.success(
                "Environment template copied"
            );
        } catch {
            toast.error(
                "Unable to copy environment configuration"
            );
        }
    }

    /* =========================
       CLOSE MODAL
    ========================= */

    function handleClose() {
        if (isBusy || generatedCredential) {
            return;
        }

        setGeneratedCredential(null);

        setConfirmAction(null);

        onClose();
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="branch-credential-title"
                    className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                >
                    {/* HEADER */}

                    <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-3">
                                <KeyRound className="h-6 w-6 text-blue-600" />
                            </div>

                            <div>
                                <h2
                                    id="branch-credential-title"
                                    className="text-lg font-semibold text-slate-900"
                                >
                                    Branch Configuration
                                </h2>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Manage server authentication
                                    and API credentials.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            aria-label="Close branch configuration"
                            onClick={handleClose}
                            disabled={
                                isBusy ||
                                Boolean(generatedCredential)
                            }
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </header>

                    {/* BODY */}

                    <main className="space-y-5 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">

                        {/* BRANCH INFORMATION */}

                        <section className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-slate-100 p-2.5">
                                        <Building2 className="h-5 w-5 text-slate-600" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {branch.branchName}
                                        </h3>

                                        <p className="text-xs text-slate-500">
                                            {branch.branchCode}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        branch.isActive
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {branch.isActive
                                        ? "Active Branch"
                                        : "Inactive Branch"}
                                </span>
                            </div>

                            <div className="mt-4 border-t border-slate-100 pt-3">
                                <p className="text-xs text-slate-500">
                                    Branch UUID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs text-slate-700">
                                    {branch.id}
                                </p>
                            </div>
                        </section>

                        {/* CURRENT CREDENTIAL */}

                        <section className="rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-slate-500" />

                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Current Credential
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Refresh credentials"
                                    disabled={isFetching || isBusy}
                                    onClick={() => void refetch()}
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${
                                            isFetching
                                                ? "animate-spin"
                                                : ""
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="p-4">

                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />

                                        Loading credentials...
                                    </div>
                                ) : isError ? (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                        <div className="flex items-center gap-2 text-sm text-red-700">
                                            <AlertCircle className="h-4 w-4" />

                                            Unable to load credentials.
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => void refetch()}
                                            className="mt-3 text-xs font-semibold text-red-700 underline"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : activeCredential ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700">
                                                API Key
                                            </span>

                                            <BranchCredentialStatus
                                                credential={
                                                    activeCredential
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                            <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />

                                            <span className="break-all font-mono text-xs text-slate-700">
                                                {
                                                    activeCredential.keyPrefix
                                                }
                                                ••••••••••••••••
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="rounded-lg border border-slate-100 p-3">
                                                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Clock className="h-3.5 w-3.5" />

                                                    Last Authenticated
                                                </p>

                                                <p className="mt-2 text-sm font-medium text-slate-800">
                                                    {formatDate(
                                                        activeCredential.lastUsedAt
                                                    )}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border border-slate-100 p-3">
                                                <p className="text-xs text-slate-500">
                                                    Expiration
                                                </p>

                                                <p className="mt-2 text-sm font-medium text-slate-800">
                                                    {activeCredential.expiresAt
                                                        ? formatDate(
                                                            activeCredential.expiresAt
                                                        )
                                                        : "No expiration"}
                                                </p>
                                            </div>
                                        </div>

                                        {!branch.isActive && (
                                            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                                This branch is inactive.
                                                Its credential cannot
                                                authenticate with central.
                                            </div>
                                        )}

                                        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                                            <button
                                                type="button"
                                                disabled={isBusy}
                                                onClick={() =>
                                                    setConfirmAction(
                                                        "REVOKE"
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <Ban className="h-4 w-4" />

                                                Revoke
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    isBusy ||
                                                    !branch.isActive
                                                }
                                                onClick={() =>
                                                    setConfirmAction(
                                                        "ROTATE"
                                                    )
                                                }
                                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                <RefreshCw className="h-4 w-4" />

                                                Rotate API Key
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-8 text-center">
                                        <div className="mb-4 rounded-full bg-slate-100 p-4">
                                            <KeyRound className="h-7 w-7 text-slate-400" />
                                        </div>

                                        <h4 className="text-sm font-semibold text-slate-800">
                                            No Active Credential
                                        </h4>

                                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                                            Generate an API key to allow
                                            this branch server to
                                            authenticate with central.
                                        </p>

                                        <button
                                            type="button"
                                            disabled={
                                                !branch.isActive ||
                                                isBusy
                                            }
                                            onClick={() =>
                                                setConfirmAction(
                                                    "GENERATE"
                                                )
                                            }
                                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <KeyRound className="h-4 w-4" />

                                            Generate API Key
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ENVIRONMENT CONFIGURATION */}

                        <section className="rounded-xl border border-slate-200 bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-slate-500" />

                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Environment Configuration
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCopyEnvironment}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
                                >
                                    <Copy className="h-3.5 w-3.5" />

                                    Copy Template
                                </button>
                            </div>

                            <div className="p-4">
                                <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                                    {environmentConfig}
                                </pre>

                                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                                    The original API key is only
                                    available immediately after
                                    credential generation.
                                </p>
                            </div>
                        </section>

                        {/* CREDENTIAL HISTORY */}

                        {!isLoading && !isError && (
                            <BranchCredentialHistory
                                credentials={credentials}
                            />
                        )}
                    </main>

                    {/* FOOTER */}

                    <footer className="flex justify-end border-t border-slate-200 bg-white px-5 py-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isBusy}
                            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Close
                        </button>
                    </footer>
                </div>
            </div>

            {/* CONFIRMATION DIALOG */}

            {confirmAction && (
                <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="credential-confirm-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-amber-100 p-3">
                                <ShieldAlert className="h-6 w-6 text-amber-600" />
                            </div>

                            <h3
                                id="credential-confirm-title"
                                className="font-semibold text-slate-900"
                            >
                                {confirmAction === "GENERATE"
                                    ? "Generate API Key"
                                    : confirmAction === "ROTATE"
                                        ? "Rotate API Key"
                                        : "Revoke Credential"}
                            </h3>
                        </div>

                        <p className="text-sm leading-relaxed text-slate-600">
                            {confirmAction === "GENERATE"
                                ? "A unique API credential will be generated for this branch."
                                : confirmAction === "ROTATE"
                                    ? "The previous API key will immediately become invalid. Update the branch server with the new key to restore its connection."
                                    : "This credential will no longer be able to authenticate with central. Branch provisioning and synchronization requests using this key will be rejected."}
                        </p>

                        {confirmAction !== "REVOKE" && (
                            <div className="mt-5">
                                <label
                                    htmlFor="credential-expiration"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Credential Expiration
                                </label>

                                <select
                                    id="credential-expiration"
                                    value={expirationDays}
                                    disabled={isBusy}
                                    onChange={(event) =>
                                        setExpirationDays(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="30">
                                        30 days
                                    </option>

                                    <option value="90">
                                        90 days
                                    </option>

                                    <option value="180">
                                        180 days
                                    </option>

                                    <option value="365">
                                        1 year
                                    </option>

                                    <option value="never">
                                        No expiration
                                    </option>
                                </select>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={() =>
                                    setConfirmAction(null)
                                }
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={isBusy}
                                onClick={
                                    confirmAction === "REVOKE"
                                        ? handleRevoke
                                        : handleGenerate
                                }
                                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                                    confirmAction === "REVOKE"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {isBusy && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}

                                {isBusy
                                    ? "Processing..."
                                    : confirmAction === "REVOKE"
                                        ? "Revoke Credential"
                                        : confirmAction === "ROTATE"
                                            ? "Rotate Key"
                                            : "Generate Key"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ONE-TIME GENERATED KEY */}

            {generatedCredential && (
                <GeneratedCredentialDialog
                    credential={generatedCredential}
                    centralApiUrl={centralApiUrl}
                    onClose={() =>
                        setGeneratedCredential(null)
                    }
                />
            )}
        </>
    );
}