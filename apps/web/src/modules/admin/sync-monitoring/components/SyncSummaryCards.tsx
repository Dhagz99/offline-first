import {
  Building2,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import type { SyncMonitoringResponse } from "@repo/shared";

type Props = {
  summary: SyncMonitoringResponse["summary"];
};

export function SyncSummaryCards({ summary }: Props) {
  const cards = [
    {
      label: "Total Branches",
      value: summary.totalBranches,
      description: `${summary.activeBranches} active branches`,
      icon: Building2,
      color: "text-slate-700 bg-slate-100",
    },
    {
      label: "Online",
      value: summary.onlineBranches,
      description: "Connected to central",
      icon: Wifi,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Offline",
      value: summary.offlineBranches,
      description: "Heartbeat unavailable",
      icon: WifiOff,
      color: "text-red-700 bg-red-50",
    },
    {
      label: "Up to Date",
      value: summary.upToDateBranches,
      description: "Synchronization current",
      icon: CheckCircle2,
      color: "text-blue-700 bg-blue-50",
    },
    {
      label: "Behind",
      value: summary.behindBranches,
      description: "Pending synchronization",
      icon: Clock3,
      color: "text-amber-700 bg-amber-50",
    },
    {
      label: "Errors",
      value: summary.errorBranches,
      description: "Reported sync failures",
      icon: AlertCircle,
      color: "text-red-700 bg-red-50",
    },
  ];

  return (
    <div
      className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-6
      "
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="
              rounded-xl border border-slate-200
              bg-white p-4 shadow-sm
            "
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {card.label}
              </p>

              <div className={`rounded-lg p-2 ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {card.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}