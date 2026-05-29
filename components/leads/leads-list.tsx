"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getLeads } from "@/lib/api/leads";
import { getMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import type { LeadOut } from "@/lib/api/types";
import { isAuthenticated } from "@/lib/auth/token";
import {
  getLeadDisplayName,
  getLeadInitials,
  getLeadSubtitle,
  getLeadValue,
} from "@/lib/leads/display";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";

interface LeadsListProps {
  search?: string;
  /** Changes when returning from create — forces a refetch */
  refreshKey?: string;
  onCountChange?: (count: number) => void;
}

export function LeadsList({ search = "", refreshKey = "", onCountChange }: LeadsListProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadLeads = useCallback(async () => {
    if (!isAuthenticated()) {
      setNeedsAuth(true);
      setLoading(false);
      setLeads([]);
      onCountChange?.(0);
      return;
    }

    setNeedsAuth(false);
    setLoading(true);
    setError(null);

    try {
      let allLeads = false;
      try {
        const me = await getMe();
        // role_id 1 is typically admin in this API (can request all org leads)
        allLeads = me.role_id === 1;
      } catch {
        /* use default user-scoped list */
      }

      const params = {
        ...(search ? { search } : {}),
        ...(allLeads ? { all_leads: true } : {}),
      };

      const data = await getLeads(params);
      setLeads(data);
      onCountChange?.(data.length);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setNeedsAuth(true);
        setLeads([]);
        onCountChange?.(0);
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to load leads");
        setLeads([]);
        onCountChange?.(0);
      }
    } finally {
      setLoading(false);
    }
  }, [search, onCountChange]);

  useEffect(() => {
    const timer = setTimeout(loadLeads, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadLeads, search, refreshKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d4ed8]" />
        <p className="text-sm">Loading leads…</p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-slate-600">
          Sign in to view leads from the server.
        </p>
        <ButtonLink href="/login" className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign in
        </ButtonLink>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={loadLeads}
          className="text-sm font-medium text-[#1d4ed8] hover:underline"
        >
          Try again
        </button>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card className="py-12 text-center">
        <p className="text-sm text-slate-500">No leads found.</p>
        <ButtonLink href="/leads/new" size="sm" className="mt-4">
          Create your first lead
        </ButtonLink>
      </Card>
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </ul>

      <Card padding="none" className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Company / Contact</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Budget / Value</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="group cursor-pointer hover:bg-slate-50/50"
                  tabIndex={0}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/leads/${lead.id}`);
                    }
                  }}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-slate-900 group-hover:text-[#1d4ed8]">
                      {getLeadDisplayName(lead)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{getLeadSubtitle(lead)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-3.5 font-medium">{getLeadValue(lead)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{lead.source ?? "—"}</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {lead.product_interest ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[#1d4ed8] opacity-0 transition group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function LeadCard({ lead }: { lead: LeadOut }) {
  return (
    <li>
      <Link href={`/leads/${lead.id}`}>
        <Card
          padding="sm"
          className="flex items-center gap-3 transition hover:border-[#1d4ed8]/40 hover:shadow-md"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#1d4ed8]">
            {getLeadInitials(lead)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">{getLeadDisplayName(lead)}</p>
            <p className="text-xs text-slate-500">{getLeadSubtitle(lead)}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={lead.status} />
              {lead.product_interest && (
                <span className="text-xs text-slate-400">{lead.product_interest}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-semibold text-slate-800">{getLeadValue(lead)}</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </div>
        </Card>
      </Link>
    </li>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const { labels, colors } = usePipelineStages();
  const key = status ?? "new";
  return (
    <Badge className={colors[key] ?? colors.new}>
      {labels[key] ?? key}
    </Badge>
  );
}
