import { prisma } from "../../src/lib/database/prisma";

import {
    provisionBranchService,
} from "../../src/modules/sync/provisioning/branch/branch-provisioning.service";

async function main() {

    console.log("");

    console.log(
        "========================================"
    );

    console.log(
        "       BRANCH PROVISIONING SERVICE"
    );

    console.log(
        "========================================"
    );

    console.log("");

    const startedAt = Date.now();

    try {

        const result =
            await provisionBranchService();

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            "       PROVISIONING SUCCESSFUL"
        );

        console.log(
            "========================================"
        );

        console.table({
            Branch: result.branchCode,

            Database: result.databaseName,

            "Snapshot Version":
                result.snapshotVersion,

            Users: result.importedUsers,

            "Active Users":
                result.activeUsers,

            "Inactive Users":
                result.inactiveUsers,

            Roles: result.importedRoles,

            Permissions:
                result.importedPermissions,

            "User Roles":
                result.importedUserRoles,

            "Role Permissions":
                result.importedRolePermissions,

            "User Branches":
                result.importedUserBranches,

            "Removed Assignments":
                result.removedAssignments,

            "Deactivated Users":
                result.deactivatedUsers,

            Duration:
                `${Date.now() - startedAt} ms`,
        });

        console.log("");

    } catch (error) {

        console.error("");

        console.error(
            "========================================"
        );

        console.error(
            "        PROVISIONING FAILED"
        );

        console.error(
            "========================================"
        );

        // Avoid printing raw Prisma errors or response bodies.
        const message =
            error instanceof Error
                ? error.message
                : "Unknown error";

        const safeMessage =
            error instanceof Error &&
            error.name.startsWith("Prisma")
                ? "Database operation failed. Check database configuration and constraints."
                : message;

        console.error(safeMessage);

        process.exitCode = 1;

    } finally {

        await prisma.$disconnect();
    }
}

main().catch(() => {
    console.error(
        "Unexpected provisioning failure"
    );

    process.exitCode = 1;
});