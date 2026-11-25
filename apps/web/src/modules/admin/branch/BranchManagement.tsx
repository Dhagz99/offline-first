"use client";

import {
    useState,
    useDeferredValue,
} from "react";

import {
    Building2,
    Plus,
    Search,
    RefreshCw,
    AlertCircle,
    GitBranch,
} from "lucide-react";

import type {
    Branch,
    BranchQueryParams,
    CredentialBranch,
} from "@repo/shared";

import {
    useQueryClient,
} from "@tanstack/react-query";

import {
    useBranches,
    branchKeys,
} from "./hooks/useBranches";

import { BranchSummaryCards } from "./components/BranchSummaryCards";
import { BranchTable } from "./components/BranchTable";
import { BranchModal } from "./components/BranchModal";
import { BranchStatusModal } from "./components/BranchStatusModal";
import { BranchPagination } from "./components/BranchPagination";
import { BranchCredentialModal } from "./components/BranchCredentialModal";

type StatusFilter = NonNullable<
    BranchQueryParams["status"]
>;

type Props = {
    canManage: boolean;
};

export default function BranchManagement({
    canManage,
}: Props) {
    const queryClient = useQueryClient();

    /* =====================
       FILTERS
    ===================== */

    const [page, setPage] = useState(1);

    const [limit, setLimit] = useState(10);

    const [search, setSearch] = useState("");

    const [status, setStatus] =
        useState<StatusFilter>("all");

    const deferredSearch = useDeferredValue(
        search.trim()
    );

    /* =====================
       MODALS
    ===================== */

    const [modalOpen, setModalOpen] = useState(false);

    const [editing, setEditing] =
        useState<Branch | null>(null);

    const [statusBranch, setStatusBranch] =
        useState<Branch | null>(null);

    const [configBranch, setConfigBranch] =
        useState<Branch | null>(null);

    /* =====================
       QUERY
    ===================== */

    const {
        data,
        isLoading,
        isFetching,
        isPlaceholderData,
        isError,
        refetch,
    } = useBranches({
        page,
        limit,
        search: deferredSearch || undefined,
        status,
    });

    const branches = data?.data ?? [];

    const pagination = data?.pagination;

    /* =====================
       HANDLERS
    ===================== */

    function handleCreate() {
        if (!canManage) return;

        setEditing(null);
        setModalOpen(true);
    }

    function handleEdit(branch: Branch) {
        if (!canManage) return;

        setEditing(branch);
        setModalOpen(true);
    }

    function handleCloseModal() {
        setModalOpen(false);
        setEditing(null);
    }

    function handleSearch(value: string) {
        setSearch(value);
        setPage(1);
    }

    function handleStatusChange(value: StatusFilter) {
        setStatus(value);
        setPage(1);
    }

    function handleLimitChange(value: number) {
        setLimit(value);
        setPage(1);
    }

    async function handleRefresh() {
        await queryClient.invalidateQueries({
            queryKey: branchKeys.all,
        });
    }

    function handleResetFilters() {
        setSearch("");
        setStatus("all");
        setPage(1);
    }

    function handleCloseStatusModal() {
        setStatusBranch(null);
        setPage(1);
    }

    function handleConfigure(branch: Branch) {
    if (!canManage) return;

    setConfigBranch(branch);
}

function handleCloseConfigModal() {
    setConfigBranch(null);
}

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-600">
                        <Building2 size={28} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Branch Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage registered branches and server configurations.
                        </p>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                    <GitBranch
                        size={15}
                        className="text-sky-600"
                    />

                    Central Administration
                </div>
            </div>

            {/* SUMMARY CARDS */}

            <BranchSummaryCards />

            {/* MANAGEMENT PANEL */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* PANEL HEADER */}

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Registered Branches
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Register and configure branch identities
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={isFetching}
                            onClick={handleRefresh}
                            title="Refresh branches"
                            aria-label="Refresh branches"
                            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    isFetching
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                        </button>

                        {canManage && (
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
                            >
                                <Plus size={17} />

                                Create Branch
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-5 p-6">

                    {/* FILTERS */}

                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <label htmlFor="branch-page-limit">
                                Show
                            </label>

                            <select
                                id="branch-page-limit"
                                value={limit}
                                onChange={(event) =>
                                    handleLimitChange(
                                        Number(event.target.value)
                                    )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
                            >
                                {[5, 10, 20, 50, 100].map(
                                    (value) => (
                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {value}
                                        </option>
                                    )
                                )}
                            </select>

                            <span>Entries</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="search"
                                    aria-label="Search branches"
                                    value={search}
                                    onChange={(event) =>
                                        handleSearch(event.target.value)
                                    }
                                    placeholder="Search branches..."
                                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:w-64"
                                />
                            </div>

                            <select
                                aria-label="Filter branch status"
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value as StatusFilter
                                    )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-500"
                            >
                                <option value="all">
                                    All Statuses
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>

                            {(search || status !== "all") && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="text-sm font-medium text-sky-600 hover:text-sky-700"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* TABLE */}

                    {isError ? (
                        <div className="flex flex-col items-center rounded-xl border border-red-100 bg-red-50 py-12">
                            <AlertCircle
                                size={28}
                                className="mb-3 text-red-500"
                            />

                            <p className="font-medium text-red-800">
                                Unable to load branches
                            </p>

                            <p className="mt-1 text-sm text-red-600">
                                Check your connection or access permissions.
                            </p>

                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div
                                aria-busy={isFetching}
                                className={
                                    isPlaceholderData
                                        ? "pointer-events-none opacity-60"
                                        : ""
                                }
                            >
                                <BranchTable
                                    branches={branches}
                                    isLoading={isLoading}
                                    canManage={canManage}
                                    onEdit={handleEdit}
                                    onConfigure={handleConfigure}
                                    onToggleStatus={setStatusBranch}
                                />
                            </div>

                            {pagination && (
                                <BranchPagination
                                    page={pagination.page}
                                    limit={pagination.limit}
                                    total={pagination.total}
                                    totalPages={pagination.totalPages}
                                    disabled={isFetching}
                                    onPageChange={setPage}
                                    
                                />
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* CREATE / EDIT MODAL */}

            {canManage && (
                <BranchModal
                    open={modalOpen}
                    editing={editing}
                    onClose={handleCloseModal}
                />
            )}

            {/* STATUS MODAL */}

            {canManage && (
                <BranchStatusModal
                    branch={statusBranch}
                    onClose={handleCloseStatusModal}
                />
            )}

            {/* CONFIGURATION MODAL */}

           {/* BRANCH CREDENTIAL CONFIGURATION MODAL */}
            
                {canManage && (
                    <BranchCredentialModal
                        open={Boolean(configBranch)}
                        branch={configBranch}
                        centralApiUrl={
                            process.env.NEXT_PUBLIC_CENTRAL_API_URL ??
                            "http://localhost:5300/api"
                        }
                        onClose={handleCloseConfigModal}
                    />
                )}
        </div>
    );
}