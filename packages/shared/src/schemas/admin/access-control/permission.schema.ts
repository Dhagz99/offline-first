import { z } from "zod";

export const updateRolePermissionsSchema = z.object({
    permissionIds: z.array(
        z.uuid("Invalid permission ID")
    ),
});

export type UpdateRolePermissionsSchema = z.infer<
    typeof updateRolePermissionsSchema
>;