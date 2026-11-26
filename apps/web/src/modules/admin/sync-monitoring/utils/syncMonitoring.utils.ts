export function formatSyncDate(
  value: string | null | undefined
): string {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatHeartbeatAge(
  seconds: number | null | undefined
): string {
  if (seconds == null) return "Never";

  const value = Math.max(0, Math.floor(seconds));

  if (value < 60) {
    return `${value}s ago`;
  }

  if (value < 3600) {
    return `${Math.floor(value / 60)}m ${value % 60}s ago`;
  }

  if (value < 86400) {
    return `${Math.floor(value / 3600)}h ago`;
  }

  return `${Math.floor(value / 86400)}d ago`;
}

export function formatSyncStatus(status: string): string {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}