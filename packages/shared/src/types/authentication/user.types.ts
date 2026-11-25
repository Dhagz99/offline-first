import { Permission, Role } from "../admin/access-control.types";

export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    isActive: boolean;
    roles: Role[];
    permissions: Permission[];
    branches: AssignedBranch[];
    createdAt?: string;

}

export interface LoginResponse {
    success: boolean;
    message: string;
    user: User;
}

export type AuthenticatedUser = {
    id: number;
    name: string;
    username: string;
    roles: string[];
    permissions: string[];
};

export interface AssignedBranch {
    id: string;
    branchCode: string;
    branchName: string;
    isActive: boolean;
}

export type RoleName = Role["name"];
export type PermissionName = Permission["name"];