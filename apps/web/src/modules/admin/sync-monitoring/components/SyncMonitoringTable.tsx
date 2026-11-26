import {
  Building2,
  Server,
} from "lucide-react";

import type { SyncMonitoringResponse } from "@repo/shared";

import { SyncStatusBadge } from "./SyncStatusBadge";

import {
  formatSyncDate,
  formatHeartbeatAge,
} from "../utils/syncMonitoring.utils";

type MonitoringBranch =
  SyncMonitoringResponse["branches"][number];

type Props = {
  branches: MonitoringBranch[];
};

export function SyncMonitoringTable({ branches }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {[
              "Branch",
              "Connection",
              "Sync Status",
              "Version",
              "Lag",
              "Last Heartbeat",
              "Last Successful Sync",
              "Failures",
            ].map((label) => (
              <th
                key={label}
                className="
                  whitespace-nowrap px-5 py-3
                  text-xs font-semibold uppercase
                  tracking-wide text-slate-500
                "
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {branches.map((branch) => (
            <tr
              key={branch.branchId}
              className="transition-colors hover:bg-slate-50"
            >
              <td className="min-w-56 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2">
                    <Building2 className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      {branch.branchName}
                    </p>

                    <p className="text-xs text-slate-500">
                      {branch.branchCode}
                    </p>

                    {branch.address && (
                      <p className="mt-1 text-xs text-slate-400">
                        {branch.address}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-5 py-4">
                <SyncStatusBadge
                  status={branch.connectionStatus}
                />
              </td>

              <td className="px-5 py-4">
                <SyncStatusBadge
                  status={branch.syncStatus}
                />
              </td>

              <td className="whitespace-nowrap px-5 py-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-400" />

                  <span className="font-medium text-slate-800">
                    {branch.localVersion ?? "-"}
                  </span>

                  <span className="text-slate-400">/</span>

                  <span className="text-slate-500">
                    {branch.centralVersion}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Local / Central
                </p>
              </td>

              <td className="px-5 py-4">
                <span
                  className={`font-semibold ${
                    branch.versionLag == null
                      ? "text-slate-400"
                      : branch.versionLag === "0"
                        ? "text-emerald-600"
                        : "text-amber-600"
                  }`}
                >
                  {branch.versionLag ?? "-"}
                </span>
              </td>

              <td className="whitespace-nowrap px-5 py-4">
                <p className="font-medium text-slate-700">
                  {formatHeartbeatAge(
                    branch.heartbeatAgeSeconds
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatSyncDate(branch.lastHeartbeatAt)}
                </p>
              </td>

              <td className="whitespace-nowrap px-5 py-4">
                <p className="text-slate-700">
                  {formatSyncDate(
                    branch.lastSuccessfulSyncAt
                  )}
                </p>

                {branch.nextRetryAt && (
                  <p className="mt-1 text-xs text-amber-600">
                    Retry: {formatSyncDate(branch.nextRetryAt)}
                  </p>
                )}
              </td>

              <td className="px-5 py-4">
                <p
                  className={`font-medium ${
                    (branch.consecutiveFailures ?? 0) > 0
                      ? "text-red-600"
                      : "text-slate-600"
                  }`}
                >
                  {branch.consecutiveFailures ?? "-"}
                </p>

                {branch.lastErrorCode && (
                  <p className="mt-1 text-xs text-red-500">
                    {branch.lastErrorCode}
                  </p>
                )}
              </td>
            </tr>
          ))}

          {branches.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-6 py-16 text-center"
              >
                <Building2
                  className="mx-auto h-10 w-10 text-slate-300"
                />

                <p className="mt-3 font-medium text-slate-600">
                  No branches found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Try changing your search or filters.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}