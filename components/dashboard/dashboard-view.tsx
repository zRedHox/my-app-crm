"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Loader2,
  LogIn,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { useLineChat } from "@/hooks/use-line-chat";
import { buildDashboardStats, sortLeadsRecent } from "@/lib/leads/stats";
import {
  getLeadDisplayName,
  getLeadInitials,
  getLeadSubtitle,
  getLeadValue,
} from "@/lib/leads/display";
import { statusColors, statusLabels } from "@/lib/mock-data";
import { platformColors, platformLabels } from "@/lib/mock-data";

export function DashboardView() {
  const { leads, loading, error, needsAuth } = useLeads({ limit: 500 });
  const { conversations: lineConversations, loading: lineLoading } =
    useLineChat();

  const unreadLine = lineConversations.reduce((n, c) => n + c.unread, 0);
  const recentLeads = sortLeadsRecent(leads, 4);
  const urgentChats = lineConversations
    .filter((c) => c.unread > 0)
    .slice(0, 3);

  const stats = buildDashboardStats(leads, unreadLine);

  if (needsAuth) {
    return (
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <LogIn className="h-10 w-10 text-slate-400" />
        <p className="text-sm text-slate-600">
          Sign in to see your dashboard with live leads and chats.
        </p>
        <ButtonLink href="/login" size="sm">
          Sign in
        </ButtonLink>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="sm" className="!p-4">
                <div className="flex h-16 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1d4ed8]" />
                </div>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.label} padding="sm" className="!p-4">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {stat.change}
                </p>
              </Card>
            ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-6">
        <Card>
          <CardHeader
            title="Recent Leads"
            description="Latest from your account"
            action={
              <Link
                href="/leads"
                className="text-sm font-medium text-[#1d4ed8] hover:underline"
              >
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
                    className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#1d4ed8]">
                      {getLeadInitials(lead)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {getLeadDisplayName(lead)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {getLeadSubtitle(lead)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          statusColors[lead.status ?? "new"] ??
                          statusColors.new
                        }
                      >
                        {statusLabels[lead.status ?? "new"] ?? lead.status}
                      </Badge>
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {getLeadValue(lead)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Unread Messages"
            description="LINE (live)"
            action={
              <Link
                href="/chat"
                className="text-sm font-medium text-[#1d4ed8] hover:underline"
              >
                Open Chat Center
              </Link>
            }
          />
          {lineLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1d4ed8]" />
            </div>
          ) : urgentChats.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No unread LINE messages
            </p>
          ) : (
            <ul className="space-y-3">
              {urgentChats.map((chat) => (
                <li key={chat.id}>
                  <Link
                    href="/chat"
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#06C755] text-xs font-bold text-white">
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
                        <p className="font-medium text-slate-900">
                          {chat.customerName}
                        </p>
                        <Badge
                          className={`text-[10px] ${platformColors.line}`}
                        >
                          {platformLabels.line}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {chat.lastMessage}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {chat.lastMessageAt}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Add Lead", href: "/leads/new", icon: Users },
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
