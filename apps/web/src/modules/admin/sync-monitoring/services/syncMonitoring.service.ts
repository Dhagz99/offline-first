
import api from "@/lib/api/api-client";
import type {
  ApiResponse,
  SyncMonitoringResponse,
} from "@repo/shared";

export async function getSyncMonitoring(): Promise<SyncMonitoringResponse> {
  const response = await api.get<
    ApiResponse<SyncMonitoringResponse>
  >("/admin/sync/monitoring");

  return response.data.data;
}