"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EditLeadForm } from "@/components/leads/edit-lead-form";
import { getLead } from "@/lib/api/leads";
import { ApiError } from "@/lib/api/client";
import type { LeadOut } from "@/lib/api/types";
import { getLeadDisplayName } from "@/lib/leads/display";

export function LeadEditView({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<LeadOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <Link
        href={`/leads/${leadId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#1d4ed8] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to lead
      </Link>

      <PageHeader
        title="Edit Lead"
        description={getLeadDisplayName(lead)}
      />

      <div className="mx-auto max-w-2xl">
        <EditLeadForm lead={lead} />
      </div>
    </>
  );
}
