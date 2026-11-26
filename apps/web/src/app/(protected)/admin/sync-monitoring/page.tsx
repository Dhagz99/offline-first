import SyncMonitoringView from "@/modules/admin/sync-monitoring/views/SyncMonitoringView";
import RoleGuard from "@/components/guards/RoleGuard";

export default function SyncMonitoringPage() {
  return(
    <RoleGuard roles={["ADMIN"]}>
          <SyncMonitoringView />;
    </RoleGuard>
  )

}
