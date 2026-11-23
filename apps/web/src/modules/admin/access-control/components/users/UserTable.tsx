
"use client";

import type { User } from "@repo/shared";

import {
  Table,
  type TableColumn,
} from "@/components/common/Table";

import PermissionGuard from "@/components/guards/PermissionGuard";

import type {
  UserTableProps,
} from "../../types/access-control.types";

import {
  Printer,
  Power,
  Plus,
  ShieldCheck,
  UserRound,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UserTable({
  users,
  usersLoading = false,
  search,
  onSearchChange,
  limit,
  onLimitChange,
  onCreate,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: UserTableProps) {

  const columns: TableColumn<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => {
        const initials = user.name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-full border border-sky-200
                bg-sky-50 text-xs font-bold
                text-sky-700
              "
            >
              {initials || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#14243B]">
                {user.name}
              </p>

              <p className="text-[11px] text-slate-400">
                ID: {user.id}
              </p>
            </div>
          </div>
        );
      },
    },

    {
      key: "username",
      header: "Username",
      render: (user) => (
        <div className="flex items-center gap-2">
          <UserRound
            size={15}
            className="shrink-0 text-slate-400"
          />

          <span className="text-sm font-medium text-slate-700">
            {user.username}
          </span>
        </div>
      ),
    },

    {
      key: "email",
      header: "Email",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Mail
            size={15}
            className="shrink-0 text-slate-400"
          />

          <span className="text-sm text-slate-600">
            {user.email || "Not provided"}
          </span>
        </div>
      ),
    },

    {
      key: "roles",
      header: "Roles",
      render: (user) => (
        <div className="flex flex-wrap gap-1.5">
          {user.roles?.length ? (
            user.roles.map((role) => (
              <span
                key={role.id}
                className="
                  inline-flex items-center gap-1.5
                  rounded-full border
                  border-sky-200 bg-sky-50
                  px-2.5 py-1
                  text-xs font-semibold text-sky-700
                "
              >
                <ShieldCheck size={12} />
                {role.name}
              </span>
            ))
          ) : (
            <span className="text-xs italic text-slate-400">
              No roles assigned
            </span>
          )}
        </div>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (user) => (
        <span
          className={`
            inline-flex items-center gap-1.5
            rounded-full border
            px-3 py-1 text-xs font-semibold
            ${
              user.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }
          `}
        >
          <span
            className={`
              h-1.5 w-1.5 rounded-full
              ${
                user.isActive
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }
            `}
          />

          {user.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  function handleActivate(user: User) {
    // Connect this action to your activation API.
    console.log("Activate user:", user.id);
  }

  function handlePrint(user: User) {
    // Connect this action to your print workflow.
    console.log("Print user:", user.id);
  }

  return (
    <div className="min-w-0">
      <Table<User>

        columns={columns}
        data={users}

        isLoading={usersLoading}

        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search users..."

        limit={limit}
        onLimitChange={onLimitChange}
        limitOptions={[5, 10, 25, 50, 100]}

        actions={
          <PermissionGuard
            permissions={["ADMIN_MANAGE"]}
          >
            <Button
              type="button"
              onClick={onCreate}
              className="
                inline-flex items-center gap-2
                border-0 bg-[#0284C7]
                px-4 py-2 text-sm font-medium
                text-white transition-colors
                hover:bg-[#0369A1]
              "
            >
              <Plus size={16} />
              Create User
            </Button>
          </PermissionGuard>
        }

        onEdit={onEdit}
        onDelete={onDelete}

        pagination={pagination}
        onPageChange={onPageChange}

        emptyMessage="No users found."

        rowKey={(user) => user.id}

        rowActions={[
          {
            key: "activate",
            label: "Activate",
            icon: <Power size={14} />,
            permission: "ADMIN_MANAGE",
            hidden: (user) => user.isActive,
            onClick: handleActivate,
          },
          {
            key: "print",
            label: "Print",
            icon: <Printer size={14} />,
            permission: "ADMIN_MANAGE",
            onClick: handlePrint,
          },
        ]}
      />
    </div>
  );
}
