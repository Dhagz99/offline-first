"use client";

import {
    Building2,
    CheckCircle2,
    Ban,
} from "lucide-react";

import { useBranchSummary } from "../hooks/useBranches";

export function BranchSummaryCards() {
    const {
        data,
        isLoading,
        isError,
    } = useBranchSummary();

    const cards = [
        {
            title: "Total Branches",
            value: data?.totalBranches ?? 0,
            description: "All registered branches",
            icon: Building2,
            color: "text-sky-600",
            background: "bg-sky-50",
        },
        {
            title: "Active Branches",
            value: data?.activeBranches ?? 0,
            description: "Administratively enabled",
            icon: CheckCircle2,
            color: "text-emerald-600",
            background: "bg-emerald-50",
        },
        {
            title: "Inactive Branches",
            value: data?.inactiveBranches ?? 0,
            description: "Administratively disabled",
            icon: Ban,
            color: "text-slate-600",
            background: "bg-slate-100",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {cards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.title}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {card.title}
                                </p>

                                <div className="mt-2">
                                    {isLoading ? (
                                        <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
                                    ) : (
                                        <h3 className="text-3xl font-bold text-slate-900">
                                            {isError ? "—" : card.value}
                                        </h3>
                                    )}
                                </div>
                            </div>

                            <div
                                className={`rounded-xl p-3 ${card.background}`}
                            >
                                <Icon
                                    size={23}
                                    className={card.color}
                                />
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            {card.description}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}