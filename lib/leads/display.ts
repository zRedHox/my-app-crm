import type { LeadOut } from "@/lib/api/types";
import { formatCurrency } from "@/lib/mock-data";

export function getLeadDisplayName(lead: LeadOut): string {
  return lead.name?.trim() || lead.contact_name?.trim() || "Unnamed lead";
}

export function getLeadInitials(lead: LeadOut): string {
  const name = getLeadDisplayName(lead);
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getLeadSubtitle(lead: LeadOut): string {
  return lead.company_name?.trim() || lead.contact_name?.trim() || lead.email || "—";
}

export function getLeadValue(lead: LeadOut): string {
  const total = lead.invoice_total ?? 0;
  return total > 0 ? formatCurrency(total) : lead.customer_budget ?? "—";
}
