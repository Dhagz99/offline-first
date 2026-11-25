"use client";

import {
    History,
    KeyRound,
} from "lucide-react";

import type {
    BranchCredential,
} from "@repo/shared";

import {
    BranchCredentialStatus,
} from "./BranchCredentialStatus";

type Props = {
    credentials: BranchCredential[];
};

function formatDate(value: string | null) {
    if (!value) return "—";

    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Manila",
    }).format(new Date(value));
}

export function BranchCredentialHistory({
    credentials,
}: Props) {
    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
                <History className="h-4 w-4 text-slate-500" />

                <h3 className="text-sm font-semibold text-slate-900">
                    Credential History
                </h3>

                <span className="ml-auto text-xs text-slate-500">
                    {credentials.length} records
                </span>
            </div>

            {credentials.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                    <KeyRound className="mb-3 h-8 w-8 text-slate-300" />

                    <p className="text-sm font-medium text-slate-600">
                        No credentials generated
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Generated credentials will appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                            <tr>
                                <th className="px-4 py-3">
                                    Credential
                                </th>

                                <th className="px-4 py-3">
                                    Created
                                </th>

                                <th className="px-4 py-3">
                                    Last Used
                                </th>

                                <th className="px-4 py-3">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {credentials.map((credential) => (
                                <tr
                                    key={credential.id}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-slate-700">
                                            {credential.keyPrefix}...
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {formatDate(
                                            credential.createdAt
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {formatDate(
                                            credential.lastUsedAt
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <BranchCredentialStatus
                                            credential={credential}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}