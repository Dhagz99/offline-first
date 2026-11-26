"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Database,
} from "lucide-react";

import { useSyncMonitoring } from "../hooks/useSyncMonitoring";
import { SyncSummaryCards } from "../components/SyncSummaryCards";
import { SyncMonitoringTable } from "../components/SyncMonitoringTable";
import { formatSyncDate } from "../utils/syncMonitoring.utils";

export default function SyncMonitoringView() {
  const [search, setSearch] = useState("");

  const [connectionFilter, setConnectionFilter] =
    useState("ALL");

  const [syncFilter, setSyncFilter] =
    useState("ALL");

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useSyncMonitoring();

  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (data?.branches ?? []).filter((branch) => {
      const matchesSearch =
        !keyword ||
        branch.branchName.toLowerCase().includes(keyword) ||
        branch.branchCode.toLowerCase().includes(keyword) ||
        branch.address?.toLowerCase().includes(keyword);

      const matchesConnection =
        connectionFilter === "ALL" ||
        branch.connectionStatus === connectionFilter;

      const matchesSync =
        syncFilter === "ALL" ||
        branch.syncStatus === syncFilter;

      return (
        matchesSearch &&
        matchesConnection &&
        matchesSync
      );
    });
  }, [data, search, connectionFilter, syncFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <Loader2
            className="mx-auto h-8 w-8 animate-spin text-slate-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading synchronization monitoring...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="
          rounded-xl border border-red-200
          bg-red-50 p-8 text-center
        "
      >
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

        <h2 className="mt-3 font-semibold text-red-700">
          Unable to load monitoring information
        </h2>

        <p className="mt-1 text-sm text-red-600">
          Check your central server connection.
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="
            mt-4 rounded-lg bg-red-600
            px-4 py-2 text-sm text-white
            disabled:opacity-50
          "
        >
          {isFetching ? "Retrying..." : "Try Again"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}

      <div
        className="
          flex flex-col gap-4
          lg:flex-row lg:items-center
          lg:justify-between
        "
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-900 p-3">
            <Activity className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Synchronization Monitoring
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor branch connectivity and synchronization health.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
          className="
            inline-flex items-center justify-center gap-2
            rounded-lg border border-slate-200
            bg-white px-4 py-2.5
            text-sm font-medium text-slate-700
            transition-colors hover:bg-slate-50
            disabled:opacity-50
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetching ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* Monitoring information */}

      <div
        className="
          flex flex-wrap items-center justify-between gap-4
          rounded-xl border border-slate-200
          bg-white px-5 py-4
        "
      >
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-slate-500" />

          <div>
            <p className="text-xs text-slate-500">
              Central Version
            </p>

            <p className="text-lg font-semibold text-slate-900">
              {data.centralVersion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isError
                ? "bg-red-500"
                : isFetching
                  ? "animate-pulse bg-blue-500"
                  : "bg-emerald-500"
            }`}
          />

          <span className="text-xs font-medium text-slate-600">
            {isError
              ? "Refresh failed"
              : isFetching
                ? "Refreshing..."
                : "Auto-refresh every 5 seconds"}
          </span>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Last Updated
          </p>

          <p className="text-sm font-medium text-slate-700">
            {formatSyncDate(data.generatedAt)}
          </p>
        </div>
      </div>

      {/* Stale data warning */}

      {isError && (
        <div
          role="alert"
          className="
            flex items-center gap-3 rounded-lg
            border border-amber-200 bg-amber-50
            px-4 py-3 text-sm text-amber-800
          "
        >
          <AlertCircle className="h-5 w-5 shrink-0" />

          Unable to refresh monitoring information.
          Showing the last successfully retrieved data.
          Branch statuses may no longer be current.
        </div>
      )}

      {/* Summary */}

      <SyncSummaryCards summary={data.summary} />

      {/* Branch table */}

      <section
        className="
          overflow-hidden rounded-xl
          border border-slate-200 bg-white shadow-sm
        "
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Branch Synchronization Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredBranches.length} of{" "}
            {data.branches.length} branches
          </p>
        </div>

        {/* Filters */}

        <div
          className="
            flex flex-col gap-3 border-b
            border-slate-200 p-5 lg:flex-row
          "
        >
          <div className="relative flex-1">
            <Search
              className="
                absolute left-3 top-1/2
                h-4 w-4 -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              aria-label="Search branches"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search branch name, code or address..."
              className="
                h-10 w-full rounded-lg
                border border-slate-200
                pl-10 pr-4 text-sm outline-none
                focus:border-slate-400
                focus:ring-2 focus:ring-slate-100
              "
            />
          </div>

          <select
            aria-label="Connection status"
            value={connectionFilter}
            onChange={(event) =>
              setConnectionFilter(event.target.value)
            }
            className="
              h-10 rounded-lg border border-slate-200
              bg-white px-3 text-sm text-slate-700
            "
          >
            <option value="ALL">All Connections</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="NEVER_CONNECTED">
              Never Connected
            </option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            aria-label="Synchronization status"
            value={syncFilter}
            onChange={(event) =>
              setSyncFilter(event.target.value)
            }
            className="
              h-10 rounded-lg border border-slate-200
              bg-white px-3 text-sm text-slate-700
            "
          >
            <option value="ALL">All Sync Statuses</option>
            <option value="UP_TO_DATE">Up to Date</option>
            <option value="BEHIND">Behind</option>
            <option value="ERROR">Error</option>
            <option value="DISABLED">Disabled</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </div>

        <SyncMonitoringTable
          branches={filteredBranches}
        />
      </section>
    </div>
  );
}