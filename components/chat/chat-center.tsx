"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  chatConversations,
  platformColors,
  platformLabels,
} from "@/lib/mock-data";
import type { ChatPlatform } from "@/lib/types";

const filters: { id: ChatPlatform | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "line", label: "LINE" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
];

export function ChatCenter() {
  const [filter, setFilter] = useState<ChatPlatform | "all">("all");
  const [selectedId, setSelectedId] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const filtered =
    filter === "all"
      ? chatConversations
      : chatConversations.filter((c) => c.platform === filter);

  const activeId =
    selectedId || (isDesktop ? (chatConversations[0]?.id ?? "") : "");

  const active = activeId
    ? chatConversations.find((c) => c.id === activeId)
    : undefined;

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-3 md:h-[calc(100dvh-6rem)] md:flex-row md:gap-4">
      {/* Conversation list */}
      <Card
        padding="none"
        className={`flex flex-col overflow-hidden md:w-80 lg:w-96 ${
          selectedId ? "hidden md:flex" : "flex flex-1"
        }`}
      >
        {/* Platform filters */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 p-3 scroll-thin">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === f.id
                  ? "bg-[#1d4ed8] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="flex-1 overflow-y-auto scroll-thin">
          {filtered.map((conv) => (
            <li key={conv.id}>
              <button
                type="button"
                onClick={() => setSelectedId(conv.id)}
                className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                  active?.id === conv.id ? "bg-blue-50" : ""
                }`}
              >
                <Avatar initials={conv.avatar} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-slate-900">
                      {conv.customerName}
                    </span>
                    <span className="shrink-0 text-[10px] text-slate-400">
                      {conv.lastMessageAt}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Badge className={`text-[9px] px-1.5 py-0 ${platformColors[conv.platform]}`}>
                      {platformLabels[conv.platform]}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {conv.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Chat thread */}
      {active ? (
        <Card
          padding="none"
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
            !selectedId && !isDesktop ? "hidden" : ""
          }`}
        >
          {/* Thread header */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setSelectedId("")}
              className="text-sm text-[#1d4ed8] md:hidden"
            >
              ← Back
            </button>
            <Avatar initials={active.avatar} />
            <div>
              <p className="font-medium text-slate-900">{active.customerName}</p>
              <Badge className={`mt-0.5 text-[10px] ${platformColors[active.platform]}`}>
                {platformLabels[active.platform]}
              </Badge>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 scroll-thin">
            {active.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%] ${
                    msg.sender === "agent"
                      ? "rounded-br-md bg-[#1d4ed8] text-white"
                      : "rounded-bl-md bg-slate-100 text-slate-800"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      msg.sender === "agent" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Compose */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8] text-white transition hover:bg-[#1e40af]"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="hidden flex-1 items-center justify-center md:flex">
          <p className="text-slate-400">Select a conversation</p>
        </Card>
      )}
    </div>
  );
}
