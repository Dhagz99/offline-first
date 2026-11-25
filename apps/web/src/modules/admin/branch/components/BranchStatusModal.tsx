"use client";

import {
    Power,
    AlertTriangle,
    Loader2,
    X,
} from "lucide-react";

import type { Branch } from "@repo/shared";

import { useUpdateBranchStatus } from "../hooks/useBranches";

type Props = {
    branch: Branch | null;
    onClose: () => void;
};

export function BranchStatusModal({
    branch,
    onClose,
}: Props) {
    const mutation = useUpdateBranchStatus();

    if (!branch) return null;

    const isDeactivating = branch.isActive;

    function handleConfirm() {
        if (!branch) return;

        mutation.mutate(
            {
                branchId: branch.id,
                payload: {
                    isActive: !branch.isActive,
                },
            },
            {
                onSuccess: onClose,
            }
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="branch-status-title"
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex justify-end p-4">
                    <button
                        type="button"
                        aria-label="Close modal"
                        disabled={mutation.isPending}
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6">
                    <div
                        className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
                            isDeactivating
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-600"
                        }`}
                    >
                        {isDeactivating ? (
                            <AlertTriangle size={30} />
                        ) : (
                            <Power size={30} />
                        )}
                    </div>

                    <h2
                        id="branch-status-title"
                        className="text-center text-xl font-semibold text-slate-900"
                    >
                        {isDeactivating
                            ? "Deactivate Branch?"
                            : "Activate Branch?"}
                    </h2>

                    <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">
                        Are you sure you want to{" "}
                        {isDeactivating
                            ? "deactivate"
                            : "activate"}{" "}
                        <strong className="text-slate-800">
                            {branch.branchName}
                        </strong>
                        ?
                    </p>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs leading-relaxed text-slate-600">
                            {isDeactivating
                                ? "The branch record and its existing data will be preserved. This changes its central administrative status; it does not remotely shut down an offline branch server."
                                : "The branch will be marked active in the central database."}
                        </p>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            disabled={mutation.isPending}
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={mutation.isPending}
                            onClick={handleConfirm}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
                                isDeactivating
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                        >
                            {mutation.isPending && (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            )}

                            {isDeactivating
                                ? "Deactivate"
                                : "Activate"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}