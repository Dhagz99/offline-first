"use client";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type Props = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    disabled?: boolean;
    onPageChange: (page: number) => void;
};

export function BranchPagination({
    page,
    limit,
    total,
    totalPages,
    disabled = false,
    onPageChange,
}: Props) {
    const start =
        total === 0 ? 0 : (page - 1) * limit + 1;

    const end = Math.min(page * limit, total);

    const firstPage = Math.max(
        1,
        Math.min(page - 2, totalPages - 4)
    );

    const lastPage = Math.min(
        totalPages,
        firstPage + 4
    );

    const pages = Array.from(
        {
            length: Math.max(0, lastPage - firstPage + 1),
        },
        (_, index) => firstPage + index
    );

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-800">
                    {start}–{end}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-800">
                    {total}
                </span>{" "}
                entries
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={disabled || page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={16} />

                    Previous
                </button>

                {pages.map((pageNumber) => (
                    <button
                        type="button"
                        key={pageNumber}
                        disabled={disabled}
                        aria-current={
                            page === pageNumber
                                ? "page"
                                : undefined
                        }
                        onClick={() => onPageChange(pageNumber)}
                        className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium ${
                            page === pageNumber
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    type="button"
                    disabled={
                        disabled ||
                        totalPages === 0 ||
                        page >= totalPages
                    }
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next

                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}