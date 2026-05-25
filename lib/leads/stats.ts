import type { LeadOut } from "@/lib/api/types";
import { formatCurrency } from "@/lib/mock-data";
import { getLeadNumericValue, normalizeLeadStatus } from "./status";

export interface DashboardStatItem {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export function buildDashboardStats(
  leads: LeadOut[],
  unreadChats: number,
): DashboardStatItem[] {
  const active = leads.filter((l) => {
    const s = normalizeLeadStatus(l.status);
    return s && s !== "sale_order";
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const revenueMtd = leads
    .filter((l) => normalizeLeadStatus(l.status) === "sale_order")
    .filter((l) => {
      const d = new Date(l.updated_at ?? l.created_at);
      return d >= monthStart;
    })
    .reduce((sum, l) => sum + getLeadNumericValue(l), 0);

  const byStatus = {
    new: leads.filter((l) => l.status === "new").length,
    proposing: leads.filter((l) => l.status === "proposing").length,
    rd_request: leads.filter((l) => l.status === "rd_request").length,
    sale_order: leads.filter((l) => l.status === "sale_order").length,
  };

  return [
    {
      label: "Total Leads",
      value: String(leads.length),
      change: `${byStatus.new} new`,
      trend: "neutral",
    },
    {
      label: "Active Deals",
      value: String(active.length),
      change: `${byStatus.proposing} proposing`,
      trend: active.length > 0 ? "up" : "neutral",
    },
    {
      label: "Revenue (MTD)",
      value: formatCurrency(revenueMtd),
      change: `${byStatus.sale_order} closed`,
      trend: revenueMtd > 0 ? "up" : "neutral",
    },
    {
      label: "Unread Chats",
      value: String(unreadChats),
      change: unreadChats > 0 ? "LINE inbox" : "All read",
      trend: unreadChats > 0 ? "up" : "neutral",
    },
  ];
}

export function sortLeadsRecent(leads: LeadOut[], limit = 4): LeadOut[] {
  return [...leads]
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? b.created_at).getTime() -
        new Date(a.updated_at ?? a.created_at).getTime(),
    )
    .slice(0, limit);
}
