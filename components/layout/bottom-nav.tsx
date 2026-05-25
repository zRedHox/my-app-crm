"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/lib/navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-area-pb">
      <div className="flex items-stretch justify-around px-1 py-1">
        {mainNav.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const shortLabel =
            label === "Chat Center" ? "Chat" : label === "Settings" ? "Settings" : label;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition ${
                active ? "text-[#1d4ed8]" : "text-slate-500"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="truncate">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
