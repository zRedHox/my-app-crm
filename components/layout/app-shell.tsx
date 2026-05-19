import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { Logo } from "@/components/brand/logo";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center border-b border-slate-200 bg-white px-4 md:hidden">
          <Logo href="/dashboard" size="sm" />
        </header>

        <main className="flex-1 overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6 lg:p-8">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
