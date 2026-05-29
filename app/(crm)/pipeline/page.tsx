"use client";

import { type DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GripVertical, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getLeads, updateLead } from "@/lib/api/leads";
import { getMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { isAuthenticated } from "@/lib/auth/token";
import type { LeadOut, LeadStatus, LeadUpdate } from "@/lib/api/types";
import { formatCurrency } from "@/lib/mock-data";
import { getLeadDisplayName } from "@/lib/leads/display";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";

function leadProbability(lead: LeadOut): number {
  if (typeof lead.probability === "number") return lead.probability;
  switch (lead.status) {
    case "new":
      return 20;
    case "proposing":
      return 45;
    case "rd_request":
      return 70;
    case "sale_order":
      return 85;
    default:
      return 0;
  }
}

function toLeadUpdatePayload(lead: LeadOut, status: LeadStatus): LeadUpdate {
  return {
    name: lead.name ?? null,
    email: lead.email ?? null,
    contact_name: lead.contact_name ?? null,
    contact_title: lead.contact_title ?? null,
    job_position: lead.job_position ?? null,
    phone: lead.phone ?? null,
    mobile: lead.mobile ?? null,
    line_id: lead.line_id ?? null,
    customer_budget: lead.customer_budget ?? null,
    product_interest: lead.product_interest ?? null,
    internal_notes: lead.internal_notes ?? null,
    company_name: lead.company_name ?? null,
    source: lead.source ?? null,
    status,
    probability: lead.probability ?? null,
    invoice_total: lead.invoice_total ?? null,
    salesperson: lead.salesperson ?? null,
    assigned_user_id: lead.assigned_user_id ?? null,
  };
}

export default function PipelinePage() {
  const { kanbanStages: pipelineStages } = usePipelineStages();
  const [leads, setLeads] = useState<LeadOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingLeadId, setSavingLeadId] = useState<number | null>(null);
  const [draggingLeadId, setDraggingLeadId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatus | null>(null);

  const loadLeads = useCallback(async () => {
    if (!isAuthenticated()) {
      setLeads([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let allLeads = false;
      try {
        const me = await getMe();
        allLeads = me.role_id === 1;
      } catch {
        // user-scoped fallback
      }

      const data = await getLeads(allLeads ? { all_leads: true } : {});
      setLeads(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load pipeline");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const pipelineLeads = useMemo(
    () => leads.filter((lead): lead is LeadOut & { status: LeadStatus } => Boolean(lead.status)),
    [leads],
  );

  const totalValue = pipelineLeads.reduce((sum, d) => sum + (d.invoice_total ?? 0), 0);

  const moveLeadToStage = useCallback(
    async (lead: LeadOut, targetStatus: LeadStatus) => {
      if (lead.status === targetStatus) return;

      const previousLeads = leads;
      const optimistic = previousLeads.map((l) =>
        l.id === lead.id ? { ...l, status: targetStatus } : l,
      );
      setLeads(optimistic);
      setSavingLeadId(lead.id);
      setError(null);

      try {
        const updated = await updateLead(lead.id, toLeadUpdatePayload(lead, targetStatus));
        setLeads((curr) => curr.map((l) => (l.id === lead.id ? updated : l)));
      } catch (err) {
        setLeads(previousLeads);
        setError(err instanceof ApiError ? err.message : "Failed to update lead status");
      } finally {
        setSavingLeadId(null);
      }
    },
    [leads],
  );

  return (
    <>
      <PageHeader
        title="Pipeline"
        description={`${pipelineLeads.length} deals · ${formatCurrency(totalValue)} total`}
      />

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <Loader2 className="h-7 w-7 animate-spin text-[#1d4ed8]" />
        </div>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      ) : null}

      {/* Horizontal scroll kanban — mobile & tablet friendly */}
      <div className="flex gap-3 overflow-x-auto pb-2 scroll-thin snap-x snap-mandatory md:gap-4">
        {pipelineStages.map((stage) => {
          const deals = pipelineLeads.filter((d) => d.status === stage.id);
          const stageValue = deals.reduce((s, d) => s + (d.invoice_total ?? 0), 0);

          return (
            <div
              key={stage.id}
              className="flex w-[280px] shrink-0 snap-start flex-col sm:w-[300px]"
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverStage !== stage.id) setDragOverStage(stage.id);
              }}
              onDragLeave={() => {
                if (dragOverStage === stage.id) setDragOverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const rawId = e.dataTransfer.getData("text/plain");
                const leadId = Number(rawId);
                const movingLead = leads.find((l) => l.id === leadId);
                if (!movingLead) return;
                setDragOverStage(null);
                setDraggingLeadId(null);
                void moveLeadToStage(movingLead, stage.id);
              }}
            >
              <div
                className={`mb-3 rounded-xl px-3 py-2 ${stage.color} ${
                  dragOverStage === stage.id ? "ring-2 ring-[#1d4ed8]/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">{stage.label}</h2>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {deals.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{formatCurrency(stageValue)}</p>
              </div>

              <ul className="flex flex-1 flex-col gap-2">
                {deals.map((deal) => (
                  <li key={deal.id}>
                    <Card
                      padding="sm"
                      className={`transition hover:border-[#1d4ed8]/30 hover:shadow-md ${
                        draggingLeadId === deal.id ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            draggable
                            aria-label="Drag lead to another stage"
                            className="cursor-grab rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
                            onDragStart={(e: DragEvent<HTMLButtonElement>) => {
                              e.dataTransfer.setData("text/plain", String(deal.id));
                              e.dataTransfer.effectAllowed = "move";
                              setDraggingLeadId(deal.id);
                            }}
                            onDragEnd={() => {
                              setDraggingLeadId(null);
                              setDragOverStage(null);
                            }}
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>
                          <Link href={`/leads/${deal.id}`} className="font-medium text-slate-900 hover:text-[#1d4ed8]">
                            {getLeadDisplayName(deal)}
                          </Link>
                        </div>
                        {savingLeadId === deal.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#1d4ed8]" />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{deal.company_name || deal.contact_name || "—"}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1d4ed8]">
                          {deal.invoice_total ? formatCurrency(deal.invoice_total) : "—"}
                        </span>
                        <span className="text-xs text-slate-400">{leadProbability(deal)}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#1d4ed8]"
                          style={{ width: `${leadProbability(deal)}%` }}
                        />
                      </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-400">{deal.salesperson || "Unassigned"}</p>
                          <select
                            value={deal.status ?? "new"}
                            disabled={savingLeadId === deal.id}
                            onChange={(e) => {
                              void moveLeadToStage(deal, e.target.value as LeadStatus);
                            }}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600"
                          >
                            {pipelineStages.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                    </Card>
                  </li>
                ))}
                {deals.length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                    No deals
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
