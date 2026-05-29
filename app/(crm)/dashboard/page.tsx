"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Loader2,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getLeads } from "@/lib/api/leads";
import { getMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { isAuthenticated } from "@/lib/auth/token";
import type { LeadOut } from "@/lib/api/types";
import { useLineChat } from "@/hooks/use-line-chat";
import {
  formatLeadDate,
  platformColors,
  platformLabels,
  formatCurrency,
} from "@/lib/mock-data";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import {
  getLeadDisplayName,
  getLeadInitials,
  getLeadSubtitle,
} from "@/lib/leads/display";

export default function DashboardPage() {
  const { labels: statusLabels, colors: statusColors } = usePipelineStages();
  const [leads, setLeads] = useState<LeadOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    conversations: lineConversations,
    loading: lineLoading,
    error: lineError,
  } = useLineChat();

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
      setError(err instanceof ApiError ? err.message : "Failed to load dashboard data");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const recentLeads = useMemo(
    () =>
      [...leads]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4),
    [leads],
  );
  const urgentChats = useMemo(
    () => lineConversations.filter((c) => c.unread > 0).slice(0, 3),
    [lineConversations],
  );

  const unreadChats = lineConversations.reduce((sum, c) => sum + c.unread, 0);
  const activeDeals = leads.filter((l) => l.status && l.status !== "new").length;

  const now = new Date();
  const revenueMtd = leads.reduce((sum, lead) => {
    if (!lead.invoice_total) return sum;
    const createdAt = new Date(lead.created_at);
    const sameMonth =
      createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    return sameMonth ? sum + lead.invoice_total : sum;
  }, 0);

  const dashboardStats = [
    { label: "Total Leads", value: String(leads.length), change: "From backend", trend: "up" as const },
    { label: "Active Deals", value: String(activeDeals), change: "Non-new status", trend: "up" as const },
    { label: "Revenue (MTD)", value: formatCurrency(revenueMtd), change: "Invoice total", trend: "up" as const },
    {
      label: "Unread Chats",
      value: String(unreadChats),
      change: lineLoading ? "Loading chats..." : lineError ? "Chat unavailable" : `${urgentChats.length} urgent`,
      trend: unreadChats > 0 ? ("neutral" as const) : ("up" as const),
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your sales activity"
        action={
          <ButtonLink href="/leads" variant="outline" size="sm">
            View all leads
          </ButtonLink>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="sm" className="!p-4">
                <div className="flex h-16 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1d4ed8]" />
                </div>
              </Card>
            ))
          : dashboardStats.map((stat) => (
              <Card key={stat.label} padding="sm" className="!p-4">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{stat.value}</p>
                <p
                  className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {stat.change}
                </p>
              </Card>
            ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-6">
        {/* Recent leads */}
        <Card>
          <CardHeader
            title="Recent Leads"
            description="Latest opportunities"
            action={
              <Link href="/leads" className="text-sm font-medium text-[#1d4ed8] hover:underline">
                See all
              </Link>
            }
          />
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1d4ed8]" />
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No leads yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="flex items-center gap-3 -mx-2 px-2 py-3 rounded-xl transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#1d4ed8]">
                      {getLeadInitials(lead)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{getLeadDisplayName(lead)}</p>
                      <p className="truncate text-xs text-slate-500">{getLeadSubtitle(lead)}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[lead.status ?? "new"] ?? statusColors.new}>
                        {statusLabels[lead.status ?? "new"] ?? lead.status}
                      </Badge>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {formatLeadDate(lead.created_at)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Urgent chats */}
        <Card>
          <CardHeader
            title="Unread Messages"
            description="LINE · TikTok · Facebook"
            action={
              <Link href="/chat" className="text-sm font-medium text-[#1d4ed8] hover:underline">
                Open Chat Center
              </Link>
            }
          />
          {lineLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1d4ed8]" />
            </div>
          ) : urgentChats.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No unread LINE messages</p>
          ) : (
            <ul className="space-y-3">
              {urgentChats.map((chat) => (
                <li key={chat.id}>
                  <Link
                    href="/chat"
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d4ed8] text-xs font-bold text-white">
                        {chat.avatar}
                      </div>
                      {chat.unread > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{chat.customerName}</p>
                        <Badge className={`text-[10px] ${platformColors.line}`}>
                          {platformLabels.line}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{chat.lastMessage}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{chat.lastMessageAt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Add Lead", href: "/leads", icon: Users },
          { label: "Pipeline", href: "/pipeline", icon: TrendingUp },
          { label: "Chat Center", href: "/chat", icon: MessageCircle },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-[#1d4ed8] hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1d4ed8]">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
