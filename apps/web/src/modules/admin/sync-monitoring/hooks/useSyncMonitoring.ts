"use client";

import { useQuery } from "@tanstack/react-query";

import { getSyncMonitoring } from "../services/syncMonitoring.service";

export const syncMonitoringKeys = {
  all: ["sync-monitoring"] as const,
};

export function useSyncMonitoring(enabled = true) {
  return useQuery({
    queryKey: syncMonitoringKeys.all,
    queryFn: getSyncMonitoring,

    enabled,

    staleTime: 3000,

    refetchInterval: 5000,

    refetchIntervalInBackground: false,

    refetchOnWindowFocus: true,

    refetchOnReconnect: true,

    retry: 1,
  });
}