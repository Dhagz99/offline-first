import {
  CheckCircle2,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock3,
  CircleHelp,
  PowerOff,
} from "lucide-react";

import { formatSyncStatus } from "../utils/syncMonitoring.utils";

type Props = {
  status: string;
};

const STATUS_CONFIG = {
  ONLINE: {
    icon: Wifi,
    className: "bg-emerald-50 text-emerald-700",
  },

  OFFLINE: {
    icon: WifiOff,
    className: "bg-red-50 text-red-700",
  },

  UP_TO_DATE: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },

  BEHIND: {
    icon: Clock3,
    className: "bg-amber-50 text-amber-700",
  },

  ERROR: {
    icon: AlertCircle,
    className: "bg-red-50 text-red-700",
  },

  DISABLED: {
    icon: PowerOff,
    className: "bg-slate-100 text-slate-600",
  },

  INACTIVE: {
    icon: PowerOff,
    className: "bg-slate-100 text-slate-600",
  },

  NEVER_CONNECTED: {
    icon: CircleHelp,
    className: "bg-slate-100 text-slate-600",
  },

  UNKNOWN: {
    icon: CircleHelp,
    className: "bg-slate-100 text-slate-600",
  },
};

export function SyncStatusBadge({ status }: Props) {
  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.UNKNOWN;

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        whitespace-nowrap rounded-full
        px-2.5 py-1 text-xs font-medium
        ${config.className}
      `}
    >
      <Icon className="h-3.5 w-3.5" />

      {formatSyncStatus(status)}
    </span>
  );
}