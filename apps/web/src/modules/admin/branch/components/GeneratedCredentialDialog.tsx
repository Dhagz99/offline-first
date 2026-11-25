"use client";

import {
    useState,
} from "react";

import {
    CheckCircle2,
    Copy,
    Eye,
    EyeOff,
    ShieldAlert,
    KeyRound,
} from "lucide-react";

import { toast } from "sonner";

import type {
    GeneratedBranchCredential,
} from "@repo/shared";

type Props = {
    credential: GeneratedBranchCredential;
    centralApiUrl: string;
    onClose: () => void;
};

export function GeneratedCredentialDialog({
    credential,
    centralApiUrl,
    onClose,
}: Props) {
    const [showKey, setShowKey] = useState(false);

    const [confirmed, setConfirmed] = useState(false);

    const environmentConfig = [
        "APP_MODE=BRANCH",
        `BRANCH_ID=${credential.branchId}`,
        `BRANCH_CODE=${credential.branch.branchCode}`,
        `CENTRAL_API_URL=${centralApiUrl}`,
        `BRANCH_API_KEY=${credential.apiKey}`,
        "SYNC_ENABLED=false",
        "SYNC_INTERVAL_MS=10000",
        "SYNC_BATCH_SIZE=50",
    ].join("\n");

    async function copyText(
        value: string,
        message: string
    ) {
        try {
            await navigator.clipboard.writeText(value);

            toast.success(message);
        } catch {
            toast.error(
                "Unable to copy. Check browser clipboard permissions."
            );
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="generated-credential-title"
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
                {/* HEADER */}

                <div className="border-b border-slate-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-100 p-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>

                        <div>
                            <h2
                                id="generated-credential-title"
                                className="text-lg font-semibold text-slate-900"
                            >
                                Credential Generated
                            </h2>

                            <p className="text-sm text-slate-500">
                                {credential.branch.branchName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}

                <div className="space-y-5 p-6">
                    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />

                        <div>
                            <p className="text-sm font-semibold text-amber-900">
                                Save your API key now
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                This key will only be displayed once.
                                After closing this window, it cannot
                                be retrieved again.
                            </p>
                        </div>
                    </div>

                    {/* API KEY */}

                    <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <KeyRound className="h-4 w-4" />
                            Branch API Key
                        </label>

                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                            <input
                                aria-label="Generated branch API key"
                                type={showKey ? "text" : "password"}
                                readOnly
                                autoComplete="off"
                                value={credential.apiKey}
                                className="min-w-0 flex-1 bg-transparent px-2 py-2 font-mono text-xs text-slate-700 outline-none"
                            />

                            <button
                                type="button"
                                aria-label={
                                    showKey
                                        ? "Hide API key"
                                        : "Show API key"
                                }
                                onClick={() => setShowKey(!showKey)}
                                className="rounded-md p-2 text-slate-500 hover:bg-slate-200"
                            >
                                {showKey ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>

                            <button
                                type="button"
                                aria-label="Copy API key"
                                onClick={() =>
                                    copyText(
                                        credential.apiKey,
                                        "API key copied"
                                    )
                                }
                                className="rounded-md bg-slate-900 p-2 text-white hover:bg-slate-700"
                            >
                                <Copy className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* ENVIRONMENT CONFIG */}

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700">
                                Branch Environment
                            </label>

                            <button
                                type="button"
                                onClick={() =>
                                    copyText(
                                        environmentConfig,
                                        "Environment configuration copied"
                                    )
                                }
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                                <Copy className="h-3.5 w-3.5" />
                                Copy configuration
                            </button>
                        </div>

                        <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                            {[
                                "APP_MODE=BRANCH",
                                `BRANCH_ID=${credential.branchId}`,
                                `BRANCH_CODE=${credential.branch.branchCode}`,
                                `CENTRAL_API_URL=${centralApiUrl}`,
                                "BRANCH_API_KEY=********",
                                "SYNC_ENABLED=false",
                                "SYNC_INTERVAL_MS=10000",
                                "SYNC_BATCH_SIZE=50",
                            ].join("\n")}
                        </pre>

                        <p className="mt-2 text-xs text-slate-500">
                            Copy these settings to the branch API
                            environment file. The copied configuration
                            includes the actual API key.
                        </p>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(event) =>
                                setConfirmed(event.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded accent-blue-600"
                        />

                        <span className="text-sm text-slate-700">
                            I have securely saved the generated API key.
                        </span>
                    </label>
                </div>

                {/* FOOTER */}

                <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                    <button
                        type="button"
                        disabled={!confirmed}
                        onClick={onClose}
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}