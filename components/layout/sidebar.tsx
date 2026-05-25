"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { getMe, type UserOut } from "@/lib/api/users";
import { clearAccessToken, isAuthenticated } from "@/lib/auth/token";
import { getUserInitials, getUserRoleLabel } from "@/lib/users/display";
import { Logo } from "@/components/brand/logo";
import { mainNav } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserOut | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 md:border-r md:border-slate-200 md:bg-white">
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Logo href="/dashboard" size="sm" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {mainNav.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#1d4ed8] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1d4ed8] text-xs font-bold text-white">
            {user ? getUserInitials(user.name) : "—"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {user?.name ?? "Signed in"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user ? getUserRoleLabel(user) : "Loading…"}
            </p>
          </div>
        </div>
        <Link
          href="/login"
          onClick={() => clearAccessToken()}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
