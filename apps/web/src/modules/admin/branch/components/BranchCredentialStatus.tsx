"use client";

import {
    CheckCircle2,
    Ban,
    Clock,
    CircleMinus,
} from "lucide-react";

import {
    getBranchCredentialStatus,
    type BranchCredential,
} from "@repo/shared";

type Props = {
    credential: BranchCredential;
};

export function BranchCredentialStatus({
    credential,
}: Props) {
    const status = getBranchCredentialStatus(
        credential
    );

    const config = {
        ACTIVE: {
            label: "Active",
            icon: CheckCircle2,
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700",
        },

        REVOKED: {
            label: "Revoked",
            icon: Ban,
            className:
                "border-red-200 bg-red-50 text-red-700",
        },

        EXPIRED: {
            label: "Expired",
            icon: Clock,
            className:
                "border-amber-200 bg-amber-50 text-amber-700",
        },

        INACTIVE: {
            label: "Inactive",
            icon: CircleMinus,
            className:
                "border-slate-200 bg-slate-100 text-slate-600",
        },
    }[status];

    const Icon = config.icon;

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border px-2.5 py-1
                text-xs font-medium
                ${config.className}
            `}
        >
            <Icon className="h-3.5 w-3.5" />

            {config.label}
        </span>
    );
}