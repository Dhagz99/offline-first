
"use client";

import { useState } from "react";

import {
  Users,
  ShieldCheck,
  KeyRound,
  Plus,
  Settings2,
  ChevronRight,
} from "lucide-react";

import PermissionGuard from "@/components/guards/PermissionGuard";

import { UserTable } from "../components/users/UserTable";
import { RoleTable } from "../components/roles/RoleTable";
import { PermissionMatrix } from "../components/permissions/PermissionMatrix";

import {
  Tab,
  AccessControlContentProps,
} from "../types/access-control.types";
import { Button } from "@/components/ui/Button";

const tabs = [
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Manage user accounts and assigned roles",
  },
  {
    id: "roles",
    label: "Roles",
    icon: ShieldCheck,
    description: "Configure roles and access levels",
  },
  {
    id: "permissions",
    label: "Permissions",
    icon: KeyRound,
    description: "Control role-based permissions",
  },
] as const;

export function AccessControlContent({
  users,
  roles,
  permissions,

  usersLoading = false,

  userSearch,
  userLimit,
  userPagination,

  onUserSearchChange,
  onUserLimitChange,
  onUserPageChange,

  onCreateUser,
  onEditUser,
  onDeleteUser,

  onCreateRole,
  onEditRole,

  onPermissionChange,
}: AccessControlContentProps) {
  const [tab, setTab] = useState<Tab>("users");

  const activeTab = tabs.find(
    (item) => item.id === tab
  )!;

  const ActiveIcon = activeTab.icon;

  const stats = [
    {
      title: "Total Users",
      value: userPagination?.total ?? users.length,
      icon: Users,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-600",
    },
    {
      title: "Total Roles",
      value: roles.length,
      icon: ShieldCheck,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Permissions",
      value: permissions.length,
      icon: KeyRound,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <section className="space-y-6">
      {/* PAGE HEADER */}
      <div
        className="
          flex flex-col gap-4
          sm:flex-row sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-2xl bg-[#E0F2FE]
              text-[#0284C7]
            "
          >
            <ShieldCheck size={24} />
          </div>

          <div>
            <h1
              className="
                text-2xl font-bold
                tracking-tight text-[#14243B]
              "
            >
              Access Control
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage system users, roles, and permissions.
            </p>
          </div>
        </div>

        <div
          className="
            inline-flex items-center gap-2
            self-start rounded-full
            border border-sky-200
            bg-sky-50 px-3 py-1.5
            text-xs font-medium
            text-sky-700
          "
        >
          <ShieldCheck size={14} />
          Role-Based Access Control
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="
                flex items-center justify-between
                rounded-2xl border
                border-slate-200
                bg-white p-5
                shadow-sm
                transition-all duration-200
                hover:border-sky-200
                hover:shadow-md
              "
            >
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {stat.title}
                </p>

                <h3
                  className="
                    mt-2 text-2xl
                    font-bold tracking-tight
                    text-[#14243B]
                  "
                >
                  {stat.value.toLocaleString()}
                </h3>
              </div>

              <div
                className={`
                  flex h-12 w-12
                  items-center justify-center
                  rounded-xl
                  ${stat.iconBg}
                  ${stat.iconColor}
                `}
              >
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT CARD */}
      <div
        className="
          overflow-hidden rounded-2xl
          border border-slate-200
          bg-white shadow-sm
        "
      >
        {/* TAB NAVIGATION */}
        <div
          className="
            border-b border-slate-200
            bg-slate-50/70 px-4 pt-4
            sm:px-6
          "
        >
          <nav
            aria-label="Access control sections"
            className="
              flex gap-1 overflow-x-auto
              sm:gap-2
            "
          >
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`
                    relative flex shrink-0
                    items-center gap-2
                    border-b-[3px]
                    px-4 py-3
                    text-sm font-medium
                    transition-all duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-sky-400
                    ${
                      active
                        ? "border-[#0284C7] text-[#0284C7]"
                        : "border-transparent text-slate-500 hover:text-[#14243B]"
                    }
                  `}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ACTIVE TAB HEADER */}
        <div
          className="
            flex flex-col gap-4
            border-b border-slate-100
            px-5 py-5
            sm:flex-row sm:items-center
            sm:justify-between sm:px-6
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-sky-50
                text-sky-600
              "
            >
              <ActiveIcon size={20} />
            </div>

            <div>
              <h2
                className="
                  text-base font-semibold
                  text-[#14243B]
                "
              >
                {activeTab.label} Management
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {activeTab.description}
              </p>
            </div>
          </div>

          {tab === "roles" && (
            <PermissionGuard
              permissions={["ADMIN_MANAGE"]}
            >
              <Button
                type="button"
                onClick={onCreateRole}
              >
                <Plus size={16} className="mr-2" />
                Add Role
              </Button>
            </PermissionGuard>
          )}

          {tab === "permissions" && (
            <div
              className="
                flex items-center gap-2
                rounded-lg bg-slate-50
                px-3 py-2 text-xs
                text-slate-500
              "
            >
              <Settings2 size={15} />
              Permission Configuration
            </div>
          )}
        </div>

        {/* TAB CONTENT */}
        <div className="min-w-0 p-4 sm:p-6">
          {tab === "users" && (
            <UserTable
              users={users}
              usersLoading={usersLoading}
              search={userSearch}
              onSearchChange={onUserSearchChange}
              limit={userLimit}
              onLimitChange={onUserLimitChange}
              onCreate={onCreateUser}
              onEdit={onEditUser}
              onDelete={onDeleteUser}
              pagination={userPagination}
              onPageChange={onUserPageChange}
            />
          )}

          {tab === "roles" && (
            <RoleTable
              roles={roles}
              onEdit={onEditRole}
            />
          )}

          {tab === "permissions" && (
            <PermissionGuard
              permissions={["ADMIN_MANAGE"]}
            >
              <div className="overflow-x-auto">
                <PermissionMatrix
                  roles={roles}
                  permissions={permissions}
                  onChange={onPermissionChange}
                />
              </div>
            </PermissionGuard>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          flex flex-col gap-2
          text-xs text-slate-400
          sm:flex-row sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} />
          Access Control Management
        </div>

        <div className="flex items-center gap-1">
          Workspace
          <ChevronRight size={12} />
          Administration
          <ChevronRight size={12} />
          <span className="font-medium text-slate-600">
            Access Control
          </span>
        </div>
      </div>
    </section>
  );
}
