import type { LeadStatus } from "@/lib/api/types";

/** Pipeline columns — match backend StatusChoices */
export const pipelineStages: {
  id: LeadStatus;
  label: string;
  color: string;
}[] = [
  { id: "new", label: "New", color: "bg-blue-50" },
  { id: "proposing", label: "Proposing", color: "bg-indigo-50" },
  { id: "rd_request", label: "R&D Request", color: "bg-amber-50" },
  { id: "sale_order", label: "Sale Order", color: "bg-emerald-50" },
];

const defaultProbability: Record<LeadStatus, number> = {
  new: 20,
  proposing: 50,
  rd_request: 70,
  sale_order: 100,
};

export function getLeadProbability(
  status: LeadStatus | null | undefined,
  probability?: number | null,
): number {
  if (probability != null && probability >= 0 && probability <= 100) {
    return probability;
  }
  if (status && status in defaultProbability) {
    return defaultProbability[status];
  }
  return 25;
}

export function normalizeLeadStatus(
  status: string | null | undefined,
): LeadStatus | null {
  if (
    status === "new" ||
    status === "proposing" ||
    status === "rd_request" ||
    status === "sale_order"
  ) {
    return status;
  }
  return null;
}

export function getLeadNumericValue(lead: {
  invoice_total?: number | null;
}): number {
  const total = lead.invoice_total ?? 0;
  return total > 0 ? total : 0;
}
