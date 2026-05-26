"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Send } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useLineChat } from "@/hooks/use-line-chat";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  chatConversations,
  platformColors,
  platformLabels,
} from "@/lib/mock-data";
import type { ChatPlatform } from "@/lib/types";
import type { LineConversation } from "@/lib/line/types";

const filters: { id: ChatPlatform | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "line", label: "LINE" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
];

type ConversationItem =
  | { source: "line"; data: LineConversation }
  | { source: "mock"; data: (typeof chatConversations)[number] };

export function ChatCenter() {
  const [filter, setFilter] = useState<ChatPlatform | "all">("line");
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const {
    conversations: lineConversations,
    loading: lineLoading,
    threadLoading,
    error: lineError,
    sending,
    realtimeConnected,
    refresh,
    sendMessage,
    loadThreadHistory,
  } = useLineChat();

  const mockFiltered =
    filter === "all" || filter === "line"
      ? []
      : chatConversations.filter((c) => c.platform === filter);

  const lineFiltered =
    filter === "all" || filter === "line" ? lineConversations : [];

  const listItems: ConversationItem[] = [
    ...lineFiltered.map((data) => ({ source: "line" as const, data })),
    ...mockFiltered.map((data) => ({ source: "mock" as const, data })),
  ];

  const activeLine = lineConversations.find((c) => c.id === selectedId);
  const activeMock = chatConversations.find((c) => c.id === selectedId);

  const defaultId =
    listItems[0]?.source === "line"
      ? listItems[0].data.id
      : listItems[0]?.source === "mock"
        ? listItems[0].data.id
        : "";

  const activeId = selectedId || (isDesktop ? defaultId : "");
  const isLineActive = Boolean(activeLine && activeLine.id === activeId);
  const isMockActive = Boolean(activeMock && activeMock.id === activeId);

  useEffect(() => {
    if (activeLine?.lineUserId) {
      void loadThreadHistory(activeLine.lineUserId);
    }
  }, [activeLine?.lineUserId, loadThreadHistory]);

  async function handleSend() {
    if (!draft.trim() || !activeLine || sending) return;
    const text = draft.trim();
    setDraft("");
    try {
      await sendMessage(activeLine.lineUserId, text);
    } catch {
      setDraft(text);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col gap-3 md:h-[calc(100dvh-6rem)] md:flex-row md:gap-4">
      <Card
        padding="none"
        className={`flex flex-col overflow-hidden md:w-80 lg:w-96 ${
          selectedId ? "hidden md:flex" : "flex flex-1"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
          <span
            className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline ${
              realtimeConnected
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-500"
            }`}
            title={
              realtimeConnected
                ? "Live updates (SSE)"
                : "Polling every few seconds — sign in for live"
            }
          >
            {realtimeConnected ? "Live" : "Poll"}
          </span>
          <div className="flex flex-1 gap-1.5 overflow-x-auto scroll-thin">
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
          <button
            type="button"
            onClick={() => refresh()}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${lineLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {lineError && (
          <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
            LINE: {lineError}
          </p>
        )}

        {lineLoading && listItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-12 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-[#1d4ed8]" />
          </div>
        ) : listItems.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-slate-500">
            <p>No LINE conversations yet.</p>
            <p className="mt-2 text-xs">
              {lineError
                ? "Could not load from server — check login and API URL."
                : "Messages appear when LINE webhook receives events."}
            </p>
            {filter === "line" && (
              <p className="mt-3 text-xs text-slate-400">
                TikTok & Facebook are mock-only — use those filters to preview.
              </p>
            )}
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto scroll-thin">
            {listItems.map((item) => {
              if (item.source === "line") {
                const conv = item.data;
                return (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(conv.id)}
                      className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                        activeId === conv.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <Avatar
                        initials={conv.avatar}
                        src={conv.pictureUrl}
                        alt={conv.customerName}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-slate-900">
                            {conv.customerName}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {conv.lastMessageAt}
                          </span>
                        </div>
                        <Badge
                          className={`mt-0.5 text-[9px] px-1.5 py-0 ${platformColors.line}`}
                        >
                          {platformLabels.line}
                        </Badge>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {conv.unread}
                        </span>
                      )}
                    </button>
                  </li>
                );
              }

              const conv = item.data;
              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(conv.id)}
                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      activeId === conv.id ? "bg-blue-50" : ""
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
                      <Badge
                        className={`mt-0.5 text-[9px] px-1.5 py-0 ${platformColors[conv.platform]}`}
                      >
                        {platformLabels[conv.platform]}
                      </Badge>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {isLineActive && activeLine ? (
        <Card
          padding="none"
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
            !selectedId && !isDesktop ? "hidden" : ""
          }`}
        >
          <ThreadHeader
            name={activeLine.customerName}
            platform="line"
            initials={activeLine.avatar}
            pictureUrl={activeLine.pictureUrl}
            onBack={() => setSelectedId("")}
          />
          <MessageList
            scrollKey={`${activeLine.id}-${activeLine.messages.length}-${activeLine.messages.at(-1)?.id ?? ""}`}
            loading={threadLoading}
            messages={activeLine.messages.map((m) => ({
              id: m.id,
              text: m.text,
              sender: m.sender,
              timestamp: m.timestamp,
            }))}
          />
          <ComposeBar
            value={draft}
            onChange={setDraft}
            onSend={handleSend}
            disabled={sending}
            placeholder="Reply via LINE…"
          />
        </Card>
      ) : isMockActive && activeMock ? (
        <Card
          padding="none"
          className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
            !selectedId && !isDesktop ? "hidden" : ""
          }`}
        >
          <ThreadHeader
            name={activeMock.customerName}
            platform={activeMock.platform}
            onBack={() => setSelectedId("")}
          />
          <MessageList scrollKey={activeMock.id} messages={activeMock.messages} />
          <ComposeBar
            value={draft}
            onChange={setDraft}
            onSend={() => {}}
            disabled
            placeholder="Mock channel — send not connected"
          />
        </Card>
      ) : (
        <Card className="hidden flex-1 items-center justify-center md:flex">
          <p className="text-slate-400">Select a conversation</p>
        </Card>
      )}
    </div>
  );
}

function ThreadHeader({
  name,
  platform,
  initials,
  pictureUrl,
  onBack,
}: {
  name: string;
  platform: ChatPlatform;
  initials?: string;
  pictureUrl?: string | null;
  onBack: () => void;
}) {
  const fallbackInitials =
    initials ?? name.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-[#1d4ed8] md:hidden"
      >
        ← Back
      </button>
      <Avatar
        initials={fallbackInitials}
        src={pictureUrl}
        alt={name}
        size="md"
      />
      <div>
        <p className="font-medium text-slate-900">{name}</p>
        <Badge className={`mt-0.5 text-[10px] ${platformColors[platform]}`}>
          {platformLabels[platform]}
        </Badge>
      </div>
    </div>
  );
}

function MessageList({
  messages,
  scrollKey,
  loading,
}: {
  messages: { id: string; text: string; sender: string; timestamp: string }[];
  /** Changes when switching conversations — triggers scroll to latest */
  scrollKey?: string;
  loading?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      const el = containerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    };
    scrollToBottom();
    const t = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(t);
  }, [scrollKey, messages.length, messages[messages.length - 1]?.id]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-thin"
    >
      <div className="space-y-3 p-4">
      {loading && messages.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#1d4ed8]" />
        </div>
      ) : null}
      {messages.map((msg) => (
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
      <div ref={bottomRef} aria-hidden className="h-px shrink-0" />
      </div>
    </div>
  );
}

function ComposeBar({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder: string;
}) {
  return (
    <div className="border-t border-slate-100 p-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8] text-white transition hover:bg-[#1e40af] disabled:opacity-50"
          aria-label="Send message"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
