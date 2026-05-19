import Link from "next/link";
import {
  ArrowUpRight,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  dashboardStats,
  leads,
  chatConversations,
  formatCurrency,
  statusColors,
  statusLabels,
  platformColors,
  platformLabels,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const recentLeads = leads.slice(0, 4);
  const urgentChats = chatConversations.filter((c) => c.unread > 0).slice(0, 3);

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
        {dashboardStats.map((stat) => (
          <Card key={stat.label} padding="sm" className="!p-4">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{stat.value}</p>
            <p
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                stat.trend === "up"
                  ? "text-emerald-600"
                  : stat.trend === "down"
                    ? "text-red-600"
                    : "text-amber-600"
              }`}
            >
              {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

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
          <ul className="divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="flex items-center gap-3 py-3 transition hover:bg-slate-50 -mx-2 px-2 rounded-xl"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#1d4ed8]">
                    {lead.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500">{lead.company}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[lead.status]}>
                      {statusLabels[lead.status]}
                    </Badge>
                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {formatCurrency(lead.value)}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
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
                      <Badge className={`text-[10px] ${platformColors[chat.platform]}`}>
                        {platformLabels[chat.platform]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{chat.lastMessage}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{chat.lastMessageAt}</span>
                </Link>
              </li>
            ))}
          </ul>
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
