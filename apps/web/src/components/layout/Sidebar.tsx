
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChevronRight,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";

import { navigation } from "@/config/navigation.config";
import { useAuth } from "@/modules/authentication/hooks/useAuth";
import { InstallationIndicator } from "../shared/InstallationIndicator";

const COLORS = {
  sidebar: "#14243B",
  header: "#1C304A",
  accent: "#38BDF8",
  active: "#24455F",
  text: "#F1F5F9",
  muted: "#9FB4CD",
  border: "#304760",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  const menu = navigation.filter((item) => {
    // Role-based navigation
    if (
      item.roles &&
      !item.roles.some((role) =>
        user?.roles?.includes(role)
      )
    ) {
      return false;
    }

    // Permission-based navigation
    if (
      item.permissions &&
      !item.permissions.some((permission) =>
        user?.permissions?.includes(permission)
      )
    ) {
      return false;
    }

    return true;
  });

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside
      className={`
        relative flex h-screen shrink-0 flex-col
        border-r transition-[width] duration-300
        ease-in-out
        ${collapsed ? "w-[76px]" : "w-64"}
      `}
      style={{
        backgroundColor: COLORS.sidebar,
        borderColor: COLORS.border,
        color: COLORS.text,
      }}
    >
      {/* Header */}
      <div
        className={`
          flex h-[76px] shrink-0 items-center
          border-b
          ${collapsed
            ? "justify-center px-2"
            : "justify-between px-4"
          }
        `}
        style={{ borderColor: COLORS.border }}
      >
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl shadow-lg
              "
              style={{
                backgroundColor: COLORS.accent,
                boxShadow: "0 4px 18px #38BDF825",
              }}
            >
              <LayoutGrid
                size={21}
                className="text-[#14243B]"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-wide">
                Workspace
              </h1>

              <p
                className="text-[11px]"
                style={{ color: COLORS.muted }}
              >
                Management System
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          aria-expanded={!collapsed}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg transition-colors
            hover:bg-white/10 hover:text-white
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-sky-400
          "
          style={{ color: COLORS.muted }}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div
        className="
          min-h-0 flex-1 overflow-y-auto
          overflow-x-hidden py-5
        "
      >
        {!collapsed && (
          <div className="mb-3 px-5">
            <span
              className="
                text-[10px] font-bold uppercase
                tracking-[0.18em]
              "
              style={{ color: COLORS.muted }}
            >
              Main Menu
            </span>
          </div>
        )}

        <nav
          aria-label="Main navigation"
          className="flex flex-col gap-1 px-3"
        >
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.title : undefined}
                aria-label={
                  collapsed ? item.title : undefined
                }
                aria-current={
                  active ? "page" : undefined
                }
                className={`
                  group relative flex h-11
                  items-center rounded-xl
                  text-sm font-medium
                  transition-all duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-sky-400
                  ${collapsed
                    ? "justify-center px-2"
                    : "gap-3 px-3"
                  }
                  ${
                    active
                      ? "bg-[#24455F] text-[#38BDF8]"
                      : "text-[#9FB4CD] hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {active && (
                  <span
                    className="
                      absolute bottom-2 left-0 top-2
                      w-[3px] rounded-r-full
                      bg-[#38BDF8]
                    "
                  />
                )}

                <Icon
                  size={19}
                  className={`
                    shrink-0 transition-colors
                    ${
                      active
                        ? "text-[#38BDF8]"
                        : "text-[#9FB4CD] group-hover:text-white"
                    }
                  `}
                />

                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate">
                      {item.title}
                    </span>

                    {active && (
                      <ChevronRight
                        size={15}
                        className="text-[#38BDF8]"
                      />
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {menu.length === 0 && !collapsed && (
            <p
              className="px-3 py-4 text-xs"
              style={{ color: COLORS.muted }}
            >
              No navigation items available.
            </p>
          )}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div
        className="shrink-0 border-t p-3"
        style={{ borderColor: COLORS.border }}
      >
        <InstallationIndicator />

        {!collapsed && (
          <div
            className="
              mb-3 flex items-center gap-2
              rounded-xl px-3 py-3
            "
            style={{
              backgroundColor: COLORS.header,
            }}
          >
            <ShieldCheck
              size={17}
              className="shrink-0 text-sky-400"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold">
                Secure Workspace
              </p>

              <p
                className="text-[10px]"
                style={{ color: COLORS.muted }}
              >
                Role-based access enabled
              </p>
            </div>
          </div>
        )}

        <div
          className={`
            flex items-center rounded-xl
            p-2 transition-colors
            hover:bg-white/10
            ${collapsed
              ? "justify-center"
              : "gap-3"
            }
          `}
        >
          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-full border text-xs
              font-semibold
            "
            style={{
              borderColor: COLORS.accent,
              backgroundColor: COLORS.active,
              color: COLORS.accent,
            }}
          >
            {initials}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {user?.name ?? "User"}
              </p>

              <p
                className="truncate text-[11px]"
                style={{ color: COLORS.muted }}
              >
                {user?.roles?.join(", ") ||
                  "Workspace User"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
