
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Permission,
  Role,
} from "@repo/shared";

import {
  KeyRound,
  ShieldCheck,
  Check,
  Search,
  Users,
  Loader2,
  LockKeyhole,
  X,
} from "lucide-react";

type PermissionMatrixProps = {
  roles: Role[];
  permissions: Permission[];

  onChange: (
    roleId: number,
    permissionId: number,
    checked: boolean
  ) => Promise<void>;
};

export function PermissionMatrix({
  roles,
  permissions,
  onChange,
}: PermissionMatrixProps) {
  const [selectedRoleId, setSelectedRoleId] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [updatingPermissionId, setUpdatingPermissionId] =
    useState<number | null>(null);

  const [pendingChange, setPendingChange] = useState<{
    roleId: number;
    permissionId: number;
    checked: boolean;
  } | null>(null);

  const activeRoleId = roles.some(
    (role) => role.id === selectedRoleId
  )
    ? selectedRoleId
    : (roles[0]?.id ?? null);

  const selectedRole = roles.find(
    (role) => role.id === activeRoleId
  );

  const assignedPermissionIds = useMemo(() => {
    return new Set(
      selectedRole?.permissions?.map(
        (permission) => permission.id
      ) ?? []
    );
  }, [selectedRole]);

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return permissions;

    return permissions.filter((permission) => {
      return (
        permission.name.toLowerCase().includes(query) ||
        permission.code.toLowerCase().includes(query)
      );
    });
  }, [permissions, search]);

  const assignedCount = assignedPermissionIds.size;

  const handleRoleSelect = (roleId: number) => {
    if (updatingPermissionId !== null) return;

    setSelectedRoleId(roleId);
    setSearch("");
  };

  const handlePermissionChange = async (
    permissionId: number,
    checked: boolean
  ) => {
    if (!selectedRole) return;
    if (updatingPermissionId !== null) return;

    const roleId = selectedRole.id;

    setUpdatingPermissionId(permissionId);

    setPendingChange({
      roleId,
      permissionId,
      checked,
    });

    try {
      await onChange(
        roleId,
        permissionId,
        checked
      );
    } finally {
      setUpdatingPermissionId(null);
      setPendingChange(null);
    }
  };

  const isPermissionChecked = (permissionId: number) => {
    if (
      pendingChange?.roleId === activeRoleId &&
      pendingChange?.permissionId === permissionId
    ) {
      return pendingChange.checked;
    }

    return assignedPermissionIds.has(permissionId);
  };

  return (
    <div
      className="
        overflow-hidden rounded-2xl
        border border-slate-200
        bg-white shadow-sm
      "
    >
      {/* MAIN HEADER */}
      <div
        className="
          flex flex-col gap-4
          border-b border-slate-200
          px-5 py-5
          sm:flex-row sm:items-center
          sm:justify-between
        "
      >

        <div
          className="
            flex items-center gap-2
            self-start rounded-lg
            border border-sky-100
            bg-sky-50 px-3 py-2
            text-xs font-medium
            text-sky-700
          "
        >
          <Users size={15} />

          {roles.length}{" "}
          {roles.length === 1 ? "System Role" : "System Roles"}
        </div>
      </div>

      {/* MASTER DETAIL */}
      <div
        className="
          grid grid-cols-1 gap-5
          p-4 sm:p-5
          lg:grid-cols-[260px_minmax(0,1fr)]
        "
      >
        {/* LEFT PANEL */}
        <aside
          className="
            min-w-0 rounded-xl
            border border-slate-200
            bg-slate-50/80 p-3
          "
        >
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-slate-600"
              />

              <h4 className="text-sm font-semibold text-[#14243B]">
                System Roles
              </h4>
            </div>

            <span
              className="
                rounded-md bg-white
                px-2 py-1
                text-xs font-semibold
                text-slate-600
                ring-1 ring-slate-200
              "
            >
              {roles.length}
            </span>
          </div>

          <div className="max-h-[450px] space-y-2 overflow-y-auto">
            {roles.map((role) => {
              const active = activeRoleId === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  disabled={updatingPermissionId !== null}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`
                    group flex w-full items-center
                    justify-between gap-3
                    rounded-lg border px-3 py-3
                    text-left transition-all
                    duration-200
                    disabled:cursor-wait
                    ${
                      active
                        ? "border-sky-500 bg-[#24455F] text-white shadow-sm"
                        : "border-transparent bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                    }
                  `}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`
                        flex h-9 w-9 shrink-0
                        items-center justify-center
                        rounded-lg
                        ${
                          active
                            ? "bg-white/15 text-sky-300"
                            : "bg-slate-100 text-slate-500"
                        }
                      `}
                    >
                      <ShieldCheck size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {role.name}
                      </p>

                      <p
                        className={`
                          mt-0.5 text-[11px]
                          ${
                            active
                              ? "text-sky-200"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {role.permissions?.length ?? 0} permissions
                      </p>
                    </div>
                  </div>

                  {active && (
                    <Check
                      size={17}
                      className="shrink-0 text-sky-300"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {roles.length === 0 && (
            <div className="px-3 py-10 text-center">
              <ShieldCheck
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No roles available.
              </p>
            </div>
          )}
        </aside>

        {/* RIGHT PANEL */}
        <section
          className="
            min-w-0 overflow-hidden
            rounded-xl border
            border-slate-200
            bg-white
          "
        >
          {selectedRole ? (
            <>
              {/* PERMISSION HEADER */}
              <div
                className="
                  flex flex-col gap-4
                  border-b border-slate-200
                  bg-slate-50/40
                  px-5 py-4
                  xl:flex-row xl:items-center
                  xl:justify-between
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={19}
                      className="text-sky-600"
                    />

                    <h4
                      className="
                        text-base font-semibold
                        text-[#14243B]
                      "
                    >
                      {selectedRole.name}
                    </h4>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500">
                    {assignedCount} of {permissions.length} permissions assigned
                  </p>
                </div>

                {/* SEARCH */}
                <div className="relative w-full xl:w-64">
                  <Search
                    size={17}
                    className="
                      absolute left-3 top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search permissions..."
                    className="
                      h-10 w-full
                      rounded-lg border
                      border-slate-200
                      bg-white py-2
                      pl-10 pr-9
                      text-sm text-slate-700
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-sky-400
                      focus:ring-2
                      focus:ring-sky-100
                    "
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="
                        absolute right-3 top-1/2
                        -translate-y-1/2
                        text-slate-400
                        hover:text-slate-600
                      "
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* PERMISSIONS */}
              <div className="max-h-[450px] overflow-y-auto p-4">
                {filteredPermissions.length > 0 ? (
                  <div
                    className="
                      grid grid-cols-1 gap-3
                      md:grid-cols-2
                      2xl:grid-cols-3
                    "
                  >
                    {filteredPermissions.map((permission) => {
                      const checked =
                        isPermissionChecked(permission.id);

                      const isUpdating =
                        updatingPermissionId === permission.id;

                      return (
                        <label
                          key={permission.id}
                          className={`
                            relative flex cursor-pointer
                            items-start gap-3
                            rounded-xl border
                            p-4 transition-all
                            duration-200
                            ${
                              checked
                                ? "border-sky-200 bg-sky-50/70"
                                : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                            }
                            ${
                              updatingPermissionId !== null
                                ? "cursor-wait opacity-75"
                                : ""
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={updatingPermissionId !== null}
                            onChange={(event) =>
                              void handlePermissionChange(
                                permission.id,
                                event.target.checked
                              )
                            }
                            className="
                              mt-1 h-4 w-4
                              shrink-0 cursor-pointer
                              accent-sky-600
                              disabled:cursor-wait
                            "
                          />

                          <div className="min-w-0 flex-1">
                            <p
                              className="
                                break-words text-sm
                                font-semibold
                                text-slate-800
                              "
                            >
                              {permission.name}
                            </p>

                            <p
                              className="
                                mt-1 break-all
                                font-mono text-[11px]
                                text-slate-500
                              "
                            >
                              {permission.code}
                            </p>
                          </div>

                          {isUpdating && (
                            <Loader2
                              size={16}
                              className="
                                shrink-0 animate-spin
                                text-sky-600
                              "
                            />
                          )}

                          {checked && !isUpdating && (
                            <Check
                              size={16}
                              className="
                                shrink-0 text-sky-600
                              "
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Search
                      size={30}
                      className="text-slate-300"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No matching permissions
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another search keyword.
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div
                className="
                  flex flex-col gap-3
                  border-t border-slate-200
                  bg-slate-50/60
                  px-5 py-3
                  sm:flex-row sm:items-center
                  sm:justify-between
                "
              >
                <div className="flex items-center gap-2">
                  <LockKeyhole
                    size={15}
                    className="text-slate-500"
                  />

                  <span className="text-xs text-slate-600">
                    {assignedCount} assigned permissions
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {updatingPermissionId !== null ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin text-sky-600"
                      />

                      <span className="text-xs text-sky-700">
                        Saving changes...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-sky-500" />

                      <span className="text-xs text-slate-500">
                        Changes are saved automatically
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <ShieldCheck
                size={36}
                className="text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No role selected
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Select a role to manage its permissions.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
