
"use client";

import type { Role } from "@repo/shared";

import {
  ShieldCheck,
  Pencil,
  KeyRound,
  Users,
} from "lucide-react";

type RoleTableProps = {
  roles: Role[];
  onEdit: (role: Role) => void;
};

export function RoleTable({
  roles,
  onEdit,
}: RoleTableProps) {
  return (
    <div
      className="
        overflow-hidden rounded-xl
        border border-slate-200
        bg-white
      "
    >


      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th
                scope="col"
                className="
                  px-6 py-4
                  text-xs font-semibold
                  uppercase tracking-wider
                  text-slate-500
                "
              >
                Role
              </th>

              <th
                scope="col"
                className="
                  px-6 py-4
                  text-xs font-semibold
                  uppercase tracking-wider
                  text-slate-500
                "
              >
                Description
              </th>

              <th
                scope="col"
                className="
                  px-6 py-4
                  text-center text-xs
                  font-semibold uppercase
                  tracking-wider text-slate-500
                "
              >
                Permissions
              </th>

              <th
                scope="col"
                className="
                  px-6 py-4
                  text-right text-xs
                  font-semibold uppercase
                  tracking-wider text-slate-500
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr
                key={role.id}
                className="
                  transition-colors
                  hover:bg-sky-50/40
                "
              >
                {/* ROLE NAME */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex h-9 w-9
                        shrink-0 items-center
                        justify-center rounded-lg
                        bg-[#E0F2FE]
                        text-[#0284C7]
                      "
                    >
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm font-semibold
                          text-[#14243B]
                        "
                      >
                        {role.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Role ID: {role.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* DESCRIPTION */}
                <td className="px-6 py-4">
                  <p className="max-w-md text-sm text-slate-600">
                    {role.description || (
                      <span className="italic text-slate-400">
                        No description provided
                      </span>
                    )}
                  </p>
                </td>

                {/* PERMISSION COUNT */}
                <td className="px-6 py-4 text-center">
                  <span
                    className="
                      inline-flex items-center
                      gap-1.5 rounded-full
                      border border-sky-100
                      bg-sky-50 px-3 py-1
                      text-xs font-semibold
                      text-sky-700
                    "
                  >
                    <KeyRound size={13} />
                    {role.permissions?.length ?? 0}
                    <span className="font-normal">
                      Permissions
                    </span>
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(role)}
                    className="
                      inline-flex items-center
                      justify-center gap-2
                      rounded-lg border
                      border-slate-200
                      bg-white px-3 py-2
                      text-xs font-medium
                      text-slate-700
                      shadow-sm transition-all
                      hover:border-sky-300
                      hover:bg-sky-50
                      hover:text-sky-700
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-sky-400
                    "
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EMPTY STATE */}
        {roles.length === 0 && (
          <div
            className="
              flex flex-col items-center
              justify-center px-6 py-16
              text-center
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-2xl bg-slate-100
                text-slate-400
              "
            >
              <ShieldCheck size={27} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              No roles found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create a role to start managing access permissions.
            </p>
          </div>
        )}
      </div>

      {/* TABLE FOOTER */}
      {roles.length > 0 && (
        <div
          className="
            flex items-center justify-between
            border-t border-slate-200
            bg-slate-50/50
            px-5 py-3
          "
        >
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {roles.length}
            </span>{" "}
            {roles.length === 1 ? "role" : "roles"}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            Role Management
          </div>
        </div>
      )}
    </div>
  );
}
