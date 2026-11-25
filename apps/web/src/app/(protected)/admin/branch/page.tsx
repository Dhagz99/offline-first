import RoleGuard from "@/components/guards/RoleGuard";
import BranchManagement from "@/modules/admin/branch/BranchManagement";

export default function BranchPage() {
    return (
          <RoleGuard roles={["ADMIN"]}>
            <BranchManagement canManage={true} />
          </RoleGuard>
    );
}