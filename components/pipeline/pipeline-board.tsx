"use client";

import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import {
  getLeadDisplayName,
  getLeadSubtitle,
  getLeadValue,
} from "@/lib/leads/display";
import {
  getLeadNumericValue,
  getLeadProbability,
  normalizeLeadStatus,
  pipelineStages,
} from "@/lib/leads/status";
import { formatCurrency } from "@/lib/mock-data";
import type { LeadOut, LeadStatus } from "@/lib/api/types";

function leadsInStage(leads: LeadOut[], stageId: LeadStatus): LeadOut[] {
  return leads.filter((l) => normalizeLeadStatus(l.status) === stageId);
}

export function PipelineBoard() {
  const { leads, loading, error, needsAuth } = useLeads({ limit: 500 });

  const totalValue = leads.reduce((sum, l) => sum + getLeadNumericValue(l), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d4ed8]" />
        <p className="text-sm">Loading pipeline…</p>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <LogIn className="h-8 w-8 text-slate-400" />
        <p className="text-sm text-slate-600">Sign in to view the pipeline.</p>
        <ButtonLink href="/login" size="sm">
          Sign in
        </ButtonLink>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </Card>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-600">
        {leads.length} lead{leads.length === 1 ? "" : "s"} · {formatCurrency(totalValue)} total value
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2 scroll-thin snap-x snap-mandatory md:gap-4">
        {pipelineStages.map((stage) => {
          const stageLeads = leadsInStage(leads, stage.id);
          const stageValue = stageLeads.reduce(
            (s, l) => s + getLeadNumericValue(l),
            0,
          );

          return (
            <div
              key={stage.id}
              className="flex w-[280px] shrink-0 snap-start flex-col sm:w-[300px]"
            >
              <div className={`mb-3 rounded-xl px-3 py-2 ${stage.color}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">
                    {stage.label}
                  </h2>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {stageLeads.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatCurrency(stageValue)}
                </p>
              </div>

              <ul className="flex flex-1 flex-col gap-2">
                {stageLeads.map((lead) => {
                  const prob = getLeadProbability(
                    normalizeLeadStatus(lead.status),
                    lead.probability,
                  );
                  return (
                    <li key={lead.id}>
                      <Link href={`/leads/${lead.id}`}>
                        <Card
                          padding="sm"
                          className="cursor-pointer transition hover:border-[#1d4ed8]/30 hover:shadow-md"
                        >
                          <p className="font-medium text-slate-900">
                            {getLeadDisplayName(lead)}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {getLeadSubtitle(lead)}
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#1d4ed8]">
                              {getLeadValue(lead)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {prob}%
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#1d4ed8]"
                              style={{ width: `${prob}%` }}
                            />
                          </div>
                          {lead.salesperson && (
                            <p className="mt-2 text-xs text-slate-400">
                              {lead.salesperson}
                            </p>
                          )}
                        </Card>
                      </Link>
                    </li>
                  );
                })}
                {stageLeads.length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                    No leads
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
