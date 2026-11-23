
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import {
  Bell,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

import { useAuth } from "@/modules/authentication/hooks/useAuth";

const COLORS = {
  header: "#1C304A",
  sidebar: "#14243B",
  accent: "#38BDF8",
  active: "#24455F",
  text: "#F1F5F9",
  muted: "#9FB4CD",
  border: "#304760",
};

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );

  const pageTitle =
    breadcrumbs[breadcrumbs.length - 1] ||
    "Dashboard";

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
    : "U";

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setLogoutOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handleLogout = () => {
    setLogoutOpen(false);
    setProfileOpen(false);
    logout();
  };

  return (
    <>
      <header
        className="
          relative z-30 flex h-[76px]
          shrink-0 items-center
          justify-between border-b
          px-4 sm:px-6
        "
        style={{
          backgroundColor: COLORS.header,
          borderColor: COLORS.border,
          color: COLORS.text,
        }}
      >
        {/* Page information */}
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard
              size={18}
              style={{ color: COLORS.accent }}
            />

            <h1 className="truncate text-sm font-semibold sm:text-base">
              {pageTitle}
            </h1>
          </div>

          <nav
            aria-label="Breadcrumb"
            className="
              hidden items-center gap-1.5
              text-xs sm:flex
            "
          >
            <span style={{ color: COLORS.muted }}>
              Workspace
            </span>

            {breadcrumbs.map((crumb, index) => (
              <div
                key={`${crumb}-${index}`}
                className="flex items-center gap-1.5"
              >
                <ChevronRight
                  size={12}
                  style={{ color: COLORS.muted }}
                />

                <span
                  style={{
                    color:
                      index === breadcrumbs.length - 1
                        ? COLORS.text
                        : COLORS.muted,
                  }}
                >
                  {crumb}
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="
              flex h-9 w-9 items-center
              justify-center rounded-lg
              text-[#9FB4CD] transition-colors
              hover:bg-white/10 hover:text-white
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-sky-400
            "
          >
            <Bell size={19} />
          </button>

          <div
            className="mx-1 hidden h-7 w-px sm:block"
            style={{
              backgroundColor: COLORS.border,
            }}
          />

          {user && (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="
                  flex items-center gap-3
                  rounded-xl border
                  border-transparent
                  px-2 py-1.5
                  transition-colors
                  hover:border-[#304760]
                  hover:bg-[#24455F]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-sky-400
                "
              >
                <div
                  className="
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-full border
                    border-[#38BDF8]/40
                    bg-[#24455F]
                    text-xs font-bold
                    text-[#38BDF8]
                  "
                >
                  {initials}
                </div>

                <div className="hidden min-w-0 text-left md:block">
                  <p className="max-w-40 truncate text-xs font-semibold">
                    {user.name}
                  </p>

                  <p className="max-w-40 truncate text-[11px] text-[#9FB4CD]">
                    @{user.username}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className={`
                    hidden text-[#9FB4CD]
                    transition-transform md:block
                    ${profileOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div
                  role="menu"
                  aria-label="Account menu"
                  className="
                    absolute right-0 top-full z-50
                    mt-2 w-64 overflow-hidden
                    rounded-xl border
                    border-[#304760]
                    bg-[#1C304A]
                    shadow-2xl shadow-black/30
                  "
                >
                  <div className="border-b border-[#304760] px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-[#9FB4CD]">
                      @{user.username}
                    </p>
                  </div>

                  <div className="p-2">
                    <div
                      className="
                        flex items-center gap-3
                        rounded-lg px-3 py-2.5
                        text-xs text-[#9FB4CD]
                      "
                    >
                      <ShieldCheck
                        size={16}
                        className="text-sky-400"
                      />

                      <span>Authenticated session</span>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        setLogoutOpen(true);
                      }}
                      className="
                        flex w-full items-center gap-3
                        rounded-lg px-3 py-2.5
                        text-left text-sm font-medium
                        text-red-400 transition-colors
                        hover:bg-red-500/10
                      "
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation */}
      {logoutOpen && (
        <div
          className="
            fixed inset-0 z-[100]
            flex items-center justify-center
            bg-black/70 p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setLogoutOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="
              w-full max-w-sm
              rounded-2xl border
              border-[#304760]
              bg-[#1C304A] p-6
              shadow-2xl
            "
          >
            <div className="mb-5 flex items-start justify-between">
              <div
                className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-xl bg-red-500/10
                  text-red-400
                "
              >
                <LogOut size={23} />
              </div>

              <button
                type="button"
                onClick={() =>
                  setLogoutOpen(false)
                }
                aria-label="Close dialog"
                className="
                  rounded-lg p-1.5
                  text-[#9FB4CD]
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="logout-title"
              className="text-lg font-semibold text-white"
            >
              Sign out of Workspace?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#9FB4CD]">
              Are you sure you want to sign out?
              You will need to log in again to
              access your workspace.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setLogoutOpen(false)
                }
                className="
                  rounded-lg border
                  border-[#304760]
                  px-4 py-2
                  text-sm font-medium
                  text-[#F1F5F9]
                  transition
                  hover:bg-white/10
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex items-center gap-2
                  rounded-lg bg-red-600
                  px-4 py-2
                  text-sm font-medium
                  text-white transition
                  hover:bg-red-500
                "
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
