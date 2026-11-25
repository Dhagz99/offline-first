"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import {
    Building2,
    X,
    Loader2,
    Save,
    Info,
} from "lucide-react";

import {
    createBranchSchema,
    updateBranchSchema,
    type Branch,
} from "@repo/shared";

import {
    useCreateBranch,
    useUpdateBranch,
} from "../hooks/useBranches";

type Props = {
    open: boolean;
    editing: Branch | null;
    onClose: () => void;
};

type FormErrors = Partial<
    Record<"branchCode" | "branchName" | "address" | "form", string>
>;

export function BranchModal({
    open,
    editing,
    onClose,
}: Props) {
    if (!open) return null;

    return (
        <BranchForm
            key={editing?.id ?? "new-branch"}
            editing={editing}
            onClose={onClose}
        />
    );
}

function BranchForm({
    editing,
    onClose,
}: Omit<Props, "open">) {
    const isEditing = Boolean(editing);

    const [branchCode, setBranchCode] = useState(
        editing?.branchCode ?? ""
    );

    const [branchName, setBranchName] = useState(
        editing?.branchName ?? ""
    );

    const [address, setAddress] = useState(
        editing?.address ?? ""
    );

    const [errors, setErrors] = useState<FormErrors>({});

    const createMutation = useCreateBranch();
    const updateMutation = useUpdateBranch();

    const isPending =
        createMutation.isPending ||
        updateMutation.isPending;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        setErrors({});

        if (editing) {
            const result = updateBranchSchema.safeParse({
                branchName,
                address: address.trim() || null,
            });

            if (!result.success) {
                const nextErrors: FormErrors = {};

                for (const issue of result.error.issues) {
                    const field = issue.path[0];

                    if (
                        field === "branchName" ||
                        field === "address"
                    ) {
                        nextErrors[field] = issue.message;
                    } else {
                        nextErrors.form = issue.message;
                    }
                }

                setErrors(nextErrors);
                return;
            }

            updateMutation.mutate(
                {
                    branchId: editing.id,
                    payload: result.data,
                },
                {
                    onSuccess: onClose,
                }
            );

            return;
        }

        const result = createBranchSchema.safeParse({
            branchCode,
            branchName,
            address: address.trim() || null,
        });

        if (!result.success) {
            const nextErrors: FormErrors = {};

            for (const issue of result.error.issues) {
                const field = issue.path[0];

                if (
                    field === "branchCode" ||
                    field === "branchName" ||
                    field === "address"
                ) {
                    nextErrors[field] = issue.message;
                } else {
                    nextErrors.form = issue.message;
                }
            }

            setErrors(nextErrors);
            return;
        }

        createMutation.mutate(result.data, {
            onSuccess: onClose,
        });
    }

    const inputClass =
        "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100 disabled:text-slate-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="branch-modal-title"
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                            <Building2 size={23} />
                        </div>

                        <div>
                            <h2
                                id="branch-modal-title"
                                className="text-lg font-semibold text-slate-900"
                            >
                                {isEditing
                                    ? "Edit Branch"
                                    : "Register New Branch"}
                            </h2>

                            <p className="text-xs text-slate-500">
                                Manage branch information
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isPending}
                        aria-label="Close modal"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <fieldset
                        disabled={isPending}
                        className="space-y-5 p-6"
                    >
                        {/* BRANCH CODE */}

                        <div>
                            <label
                                htmlFor="branch-code"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Branch Code
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                id="branch-code"
                                value={branchCode}
                                disabled={isEditing || isPending}
                                maxLength={50}
                                onChange={(event) =>
                                    setBranchCode(
                                        event.target.value.toUpperCase()
                                    )
                                }
                                placeholder="e.g. BRANCH_A"
                                className={inputClass}
                            />

                            {errors.branchCode && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.branchCode}
                                </p>
                            )}

                            <p className="mt-2 text-xs text-slate-500">
                                Unique identifier used by the branch server.
                            </p>
                        </div>

                        {/* BRANCH NAME */}

                        <div>
                            <label
                                htmlFor="branch-name"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Branch Name
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                id="branch-name"
                                value={branchName}
                                maxLength={150}
                                onChange={(event) =>
                                    setBranchName(event.target.value)
                                }
                                placeholder="Enter branch name"
                                className={inputClass}
                            />

                            {errors.branchName && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.branchName}
                                </p>
                            )}
                        </div>

                        {/* ADDRESS */}

                        <div>
                            <label
                                htmlFor="branch-address"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Branch Address
                            </label>

                            <textarea
                                id="branch-address"
                                value={address}
                                maxLength={500}
                                rows={3}
                                onChange={(event) =>
                                    setAddress(event.target.value)
                                }
                                placeholder="Enter complete branch address"
                                className={`${inputClass} resize-none`}
                            />

                            {errors.address && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.address}
                                </p>
                            )}
                        </div>

                        {errors.form && (
                            <p className="text-sm text-red-600">
                                {errors.form}
                            </p>
                        )}

                        <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
                            <Info
                                size={18}
                                className="mt-0.5 shrink-0 text-sky-600"
                            />

                            <p className="text-xs leading-relaxed text-sky-800">
                                {isEditing
                                    ? "The branch code and UUID cannot be changed after registration."
                                    : "A unique branch UUID will be generated automatically. This UUID will identify the branch during synchronization."}
                            </p>
                        </div>
                    </fieldset>

                    {/* FOOTER */}

                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
                        >
                            {isPending ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={16} />
                            )}

                            {isPending
                                ? "Saving..."
                                : isEditing
                                    ? "Save Changes"
                                    : "Register Branch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}