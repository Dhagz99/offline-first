"use client";

import {
    Settings2,
    Copy,
    X,
    Server,
    Info,
} from "lucide-react";

import { toast } from "sonner";

import type { Branch } from "@repo/shared";

type Props = {
    branch: Branch | null;
    onClose: () => void;
};

export function BranchConfigModal({
    branch,
    onClose,
}: Props) {
    if (!branch) return null;

    const configuration = [
        "# Branch Identity",
        "APP_MODE=BRANCH",
        `BRANCH_ID=${branch.id}`,
        `BRANCH_CODE=${branch.branchCode}`,
        "",
        "# Synchronization",
        "CENTRAL_API_URL=http://localhost:5300/api",
        "SYNC_ENABLED=false",
        "SYNC_INTERVAL_MS=10000",
        "SYNC_BATCH_SIZE=50",
    ].join("\n");

    async function copyToClipboard(
        value: string,
        message: string
    ) {
        try {
            await navigator.clipboard.writeText(value);

            toast.success(message);
        } catch {
            toast.error("Unable to copy to clipboard");
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="branch-config-title"
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                            <Settings2 size={23} />
                        </div>

                        <div>
                            <h2
                                id="branch-config-title"
                                className="text-lg font-semibold text-slate-900"
                            >
                                Branch Configuration
                            </h2>

                            <p className="text-xs text-slate-500">
                                {branch.branchName}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        aria-label="Close modal"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5 p-6">
                    {/* UUID */}

                    <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                            Branch UUID
                        </p>

                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <code className="flex-1 break-all text-xs text-slate-700">
                                {branch.id}
                            </code>

                            <button
                                type="button"
                                aria-label="Copy branch UUID"
                                onClick={() =>
                                    copyToClipboard(
                                        branch.id,
                                        "Branch UUID copied"
                                    )
                                }
                                className="shrink-0 rounded-md p-2 text-slate-500 hover:bg-slate-200"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* CODE */}

                    <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                            Branch Code
                        </p>

                        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <code className="text-sm text-slate-700">
                                {branch.branchCode}
                            </code>

                            <button
                                type="button"
                                aria-label="Copy branch code"
                                onClick={() =>
                                    copyToClipboard(
                                        branch.branchCode,
                                        "Branch code copied"
                                    )
                                }
                                className="rounded-md p-2 text-slate-500 hover:bg-slate-200"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* ENV CONFIGURATION */}

                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Server
                                size={16}
                                className="text-slate-500"
                            />

                            <p className="text-sm font-medium text-slate-700">
                                Development Environment Configuration
                            </p>
                        </div>

                        <div className="overflow-x-auto rounded-xl bg-slate-950 p-4">
                            <pre className="text-xs leading-6 text-slate-200">
                                {configuration}
                            </pre>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                copyToClipboard(
                                    configuration,
                                    "Branch configuration copied"
                                )
                            }
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Copy size={16} />

                            Copy Configuration
                        </button>
                    </div>

                    <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
                        <Info
                            size={18}
                            className="shrink-0 text-sky-600"
                        />

                        <p className="text-xs leading-relaxed text-sky-800">
                            Add these settings to the branch API
                            environment file. Configure its database URL,
                            JWT secret and frontend URL separately.
                            Synchronization must remain disabled until
                            branch provisioning is completed. Replace
                            localhost with the central server address
                            when deploying to another computer.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}