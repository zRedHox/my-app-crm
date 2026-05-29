"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  Phone,
  User,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { deleteLead, getLead } from "@/lib/api/leads";
import { ApiError } from "@/lib/api/client";
import type { LeadOut } from "@/lib/api/types";
import { formatLeadDate } from "@/lib/mock-data";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import {
  getLeadDisplayName,
  getLeadInitials,
  getLeadValue,
} from "@/lib/leads/display";
import { LeadTagsSection } from "@/components/tags/lead-tags-section";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function LeadDetailView({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [lead, setLead] = useState<LeadOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useIsAdmin();
  const { labels: statusLabels, colors: statusColors } = usePipelineStages();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getLead(leadId);
        if (!cancelled) setLead(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to load lead");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  async function handleDeleteLead() {
    if (!lead || deleting) return;

    const confirmed = window.confirm(
      `Delete lead "${getLeadDisplayName(lead)}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteLead(leadId);
      router.push("/leads");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete lead");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d4ed8]" />
        <p className="text-sm">Loading lead…</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600">{error ?? "Lead not found"}</p>
        <Link href="/leads" className="mt-4 inline-block text-sm text-[#1d4ed8] hover:underline">
          Back to Leads
        </Link>
      </div>
    );
  }

  const status = lead.status ?? "new";

  return (
    <>
      <Link
        href="/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#1d4ed8] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      <PageHeader
        title={getLeadDisplayName(lead)}
        description={lead.company_name ?? lead.contact_name ?? undefined}
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={`/leads/${leadId}/edit`} variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Edit
            </ButtonLink>
            <ButtonLink href="/chat" variant="outline" size="sm">
              Message
            </ButtonLink>
            <ButtonLink href="/pipeline" variant="primary" size="sm">
              View in Pipeline
            </ButtonLink>
            <button
              type="button"
              onClick={handleDeleteLead}
              disabled={deleting}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1d4ed8] text-lg font-bold text-white">
                {getLeadInitials(lead)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusColors[status] ?? statusColors.new}>
                    {statusLabels[status] ?? status}
                  </Badge>
                  {lead.source && (
                    <span className="text-sm text-slate-500">· {lead.source}</span>
                  )}
                </div>
                <LeadTagsSection leadId={leadId} lineId={lead.line_id} isAdmin={isAdmin} />
                <p className="mt-3 text-2xl font-bold text-slate-900">{getLeadValue(lead)}</p>
                <p className="text-sm text-slate-500">Budget / deal value</p>
              </div>
            </div>
          </Card>

          {lead.internal_notes && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">{lead.internal_notes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card padding="sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Contact</h2>
            <ul className="space-y-3 text-sm">
              {lead.email && (
                <li className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`mailto:${lead.email}`} className="truncate hover:text-[#1d4ed8]">
                    {lead.email}
                  </a>
                </li>
              )}
              {lead.phone && (
                <li className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`tel:${lead.phone}`} className="hover:text-[#1d4ed8]">
                    {lead.phone}
                  </a>
                </li>
              )}
              {lead.line_id && (
                <li className="flex items-center gap-3 text-slate-600">
                  <span className="text-xs font-semibold text-slate-400">LINE</span>
                  {lead.line_id}
                </li>
              )}
              {lead.company_name && (
                <li className="flex items-center gap-3 text-slate-600">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                  {lead.company_name}
                </li>
              )}
            </ul>
          </Card>

          <Card padding="sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Details</h2>
            <dl className="space-y-3 text-sm">
              {lead.contact_name && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Contact person</dt>
                  <dd className="font-medium text-slate-800">{lead.contact_name}</dd>
                </div>
              )}
              {lead.job_position && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Job position</dt>
                  <dd className="font-medium text-slate-800">{lead.job_position}</dd>
                </div>
              )}
              {lead.product_interest && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Product</dt>
                  <dd className="font-medium text-slate-800">{lead.product_interest}</dd>
                </div>
              )}
              {lead.salesperson && (
                <div className="flex justify-between gap-2">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <User className="h-4 w-4" /> Salesperson
                  </dt>
                  <dd className="font-medium text-slate-800">{lead.salesperson}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4" /> Created
                </dt>
                <dd className="font-medium text-slate-800">
                  {formatLeadDate(lead.created_at)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
