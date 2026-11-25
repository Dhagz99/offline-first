"use client";

import {
    Building2,
    MapPin,
    Users,
    Pencil,
    Settings2,
    Power,
    Loader2,
} from "lucide-react";

import type { Branch } from "@repo/shared";

type Props = {
    branches: Branch[];
    isLoading: boolean;
    canManage: boolean;
    onEdit: (branch: Branch) => void;
    onConfigure: (branch: Branch) => void;
    onToggleStatus: (branch: Branch) => void;
};

const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export function BranchTable({
    branches,
    isLoading,
    canManage,
    onEdit,
    onConfigure,
    onToggleStatus,
}: Props) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-4">
                            Branch Information
                        </th>

                        <th className="px-5 py-4">
                            Address
                        </th>

                        <th className="px-5 py-4">
                            Users
                        </th>

                        <th className="px-5 py-4">
                            Date Registered
                        </th>

                        <th className="px-5 py-4">
                            Status
                        </th>

                        <th className="px-5 py-4 text-right">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                    {isLoading ? (
                        <tr>
                            <td colSpan={6}>
                                <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />

                                    Loading branches...
                                </div>
                            </td>
                        </tr>
                    ) : branches.length === 0 ? (
                        <tr>
                            <td colSpan={6}>
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="mb-4 rounded-2xl bg-slate-100 p-4">
                                        <Building2
                                            size={30}
                                            className="text-slate-400"
                                        />
                                    </div>

                                    <h3 className="font-semibold text-slate-800">
                                        No branches found
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Register a branch or adjust your filters.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        branches.map((branch) => (
                            <tr
                                key={branch.id}
                                className="transition-colors hover:bg-slate-50/70"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sky-600">
                                            <Building2 size={20} />
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {branch.branchName}
                                            </p>

                                            <p className="mt-1 text-xs font-medium text-slate-500">
                                                {branch.branchCode}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin
                                            size={15}
                                            className="shrink-0 text-slate-400"
                                        />

                                        <span>
                                            {branch.address || "Not specified"}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
                                        <Users size={14} />

                                        {branch._count?.users ?? 0}
                                    </div>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                    {formatDate(branch.createdAt)}
                                </td>

                                <td className="px-5 py-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                                            branch.isActive
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                branch.isActive
                                                    ? "bg-emerald-500"
                                                    : "bg-slate-400"
                                            }`}
                                        />

                                        {branch.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                    {canManage ? (
                                        <>
                                            {/* EDIT BRANCH */}

                                            <button
                                                type="button"
                                                title="Edit branch"
                                                aria-label="Edit branch"
                                                onClick={() => onEdit(branch)}
                                                className="
                                                    rounded-lg border border-sky-100
                                                    bg-sky-50 p-2 text-sky-600
                                                    transition hover:bg-sky-100
                                                "
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            {/* BRANCH CONFIGURATION */}

                                            <button
                                                type="button"
                                                title="Manage branch credentials"
                                                aria-label="Manage branch credentials"
                                                onClick={() => onConfigure(branch)}
                                                className="
                                                    rounded-lg border border-slate-200
                                                    bg-white p-2 text-slate-600
                                                    transition hover:border-sky-200
                                                    hover:bg-sky-50 hover:text-sky-600
                                                "
                                            >
                                                <Settings2 size={16} />
                                            </button>

                                            {/* ACTIVATE / DEACTIVATE */}

                                            <button
                                                type="button"
                                                title={
                                                    branch.isActive
                                                        ? "Deactivate branch"
                                                        : "Activate branch"
                                                }
                                                aria-label={
                                                    branch.isActive
                                                        ? "Deactivate branch"
                                                        : "Activate branch"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(branch)
                                                }
                                                className={`
                                                    rounded-lg border p-2 transition
                                                    ${
                                                        branch.isActive
                                                            ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                                                            : "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                    }
                                                `}
                                            >
                                                <Power size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400">
                                            View only
                                        </span>
                                    )}
                                </div>
                            </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}