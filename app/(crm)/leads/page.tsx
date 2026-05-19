"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CreatedBanner } from "@/components/leads/created-banner";
import { LeadsList } from "@/components/leads/leads-list";
import { ButtonLink } from "@/components/ui/button";

function LeadsPageContent() {
  const searchParams = useSearchParams();
  const refreshKey = `${searchParams.get("created") ?? ""}-${searchParams.get("id") ?? ""}`;
  const [search, setSearch] = useState("");
  const [count, setCount] = useState<number | null>(null);

  return (
    <>
      <PageHeader
        title="Leads"
        description={
          count != null ? `${count} lead${count === 1 ? "" : "s"}` : "Loading…"
        }
        action={
          <ButtonLink href="/leads/new" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Lead</span>
            <span className="sm:hidden">Add</span>
          </ButtonLink>
        }
      />

      <CreatedBanner />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search name, email or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <LeadsList search={search} refreshKey={refreshKey} onCountChange={setCount} />
    </>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<p className="py-8 text-center text-sm text-slate-500">Loading…</p>}>
      <LeadsPageContent />
    </Suspense>
  );
}
