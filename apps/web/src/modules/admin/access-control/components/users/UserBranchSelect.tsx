"use client";

import { useMemo, useState } from "react";

import {
    Building2,
    Search,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Info,
} from "lucide-react";
import { useBranchOptions } from "@/modules/admin/branch/hooks/useBranches";


type Props = {
    value: string[];
    onChange: (branchIds: string[]) => void;
    disabled?: boolean;
    error?: string;
};

export function UserBranchSelect({
    value,
    onChange,
    disabled = false,
    error,
}: Props) {
    const [search, setSearch] = useState("");

    const {
        data: branches = [],
        isLoading,
        isError,
        refetch,
    } = useBranchOptions();

    const filteredBranches = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return branches.filter(
            (branch) =>
                branch.branchName
                    .toLowerCase()
                    .includes(keyword) ||
                branch.branchCode
                    .toLowerCase()
                    .includes(keyword)
        );
    }, [branches, search]);

    const unavailableIds = value.filter(
        (id) => !branches.some(
            (branch) => branch.id === id
        )
    );

    const handleToggle = (branchId: string) => {
        if (disabled) return;

        if (value.includes(branchId)) {
            onChange(
                value.filter((id) => id !== branchId)
            );
        } else {
            onChange([...value, branchId]);
        }
    };

    const handleSelectAll = () => {
        if (disabled) return;

        onChange([
            ...new Set([
                ...value,
                ...filteredBranches.map(
                    (branch) => branch.id
                ),
            ]),
        ]);
    };

    return (
        <div className="space-y-3">
            {/* HEADER */}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Building2
                        size={17}
                        className="text-sky-600"
                    />

                    <label className="text-sm font-semibold text-slate-700">
                        Branch Assignment
                    </label>
                </div>

                <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                    {value.length} selected
                </span>
            </div>

            <p className="text-xs text-slate-500">
                Select the branches this user is
                authorized to access.
            </p>

            {/* SEARCH */}

            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="search"
                    value={search}
                    disabled={disabled}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search branch name or code..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
            </div>

            {/* ACTIONS */}

            {!isLoading && !isError && (
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={handleSelectAll}
                        className="text-xs font-medium text-sky-600 hover:underline disabled:opacity-50"
                    >
                        Select visible
                    </button>

                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange([])}
                        className="text-xs font-medium text-slate-500 hover:underline disabled:opacity-50"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* BRANCH LIST */}

            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">

                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                        <Loader2
                            size={18}
                            className="animate-spin"
                        />

                        Loading branches...
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                        <AlertCircle
                            size={24}
                            className="text-red-500"
                        />

                        <p className="text-sm text-red-600">
                            Failed to load branches
                        </p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="text-xs font-medium text-sky-600"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredBranches.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                        No branches found
                    </div>
                ) : (
                    filteredBranches.map((branch) => {
                        const selected = value.includes(
                            branch.id
                        );

                        return (
                            <label
                                key={branch.id}
                                className={`
                                    flex items-center gap-3 rounded-lg border p-3 transition
                                    ${
                                        selected
                                            ? "border-sky-300 bg-sky-50"
                                            : "border-slate-200 bg-white hover:border-sky-200"
                                    }
                                    ${
                                        disabled
                                            ? "cursor-not-allowed opacity-60"
                                            : "cursor-pointer"
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    disabled={disabled}
                                    onChange={() =>
                                        handleToggle(branch.id)
                                    }
                                    className="h-4 w-4 shrink-0 accent-sky-600"
                                />

                                <div
                                    className={`rounded-lg p-2 ${
                                        selected
                                            ? "bg-sky-100 text-sky-600"
                                            : "bg-slate-100 text-slate-500"
                                    }`}
                                >
                                    <Building2 size={19} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                        {branch.branchName}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {branch.branchCode}
                                    </p>
                                </div>

                                {selected && (
                                    <CheckCircle2
                                        size={18}
                                        className="shrink-0 text-sky-600"
                                    />
                                )}
                            </label>
                        );
                    })
                )}
            </div>

            {/* INACTIVE ASSIGNMENTS */}

            {!isLoading &&
                !isError &&
                unavailableIds.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs text-amber-800">
                            {unavailableIds.length} assigned
                            branch(es) are inactive or unavailable.
                        </p>

                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                                onChange(
                                    value.filter(
                                        (id) =>
                                            !unavailableIds.includes(id)
                                    )
                                )
                            }
                            className="mt-2 text-xs font-medium text-amber-800 underline"
                        >
                            Remove unavailable assignments
                        </button>
                    </div>
                )}

            {/* VALIDATION */}

            {error && (
                <p className="text-xs text-red-600">
                    {error}
                </p>
            )}

            {/* INFORMATION */}

            <div className="flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50 p-3">
                <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-sky-600"
                />

                <p className="text-xs leading-relaxed text-sky-800">
                    Branch access becomes available after
                    the account has been provisioned and
                    synchronized to the branch server.
                </p>
            </div>
        </div>
    );
}