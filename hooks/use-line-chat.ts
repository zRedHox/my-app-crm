"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LINE_POLL_ACTIVE_MS,
  LINE_POLL_IDLE_MS,
} from "@/lib/line/config";
import { buildLineConversations } from "@/lib/line/conversations";
import { sendLineChatMessageFromClient } from "@/lib/line/send-client";
import { listLineMessages, listLineUsers } from "@/lib/line/store";
import type {
  LineConversation,
  LineMessageOut,
  LineUserOut,
} from "@/lib/line/types";
import type { LineRealtimeEvent } from "@/lib/line/realtime-events";
import { ApiError } from "@/lib/api/client";
import { useLineRealtime } from "@/hooks/use-line-realtime";

function mergeLineMessages(
  existing: LineMessageOut[],
  incoming: LineMessageOut[],
): LineMessageOut[] {
  const byId = new Map<number, LineMessageOut>();
  for (const m of existing) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

function upsertUser(users: LineUserOut[], user: LineUserOut): LineUserOut[] {
  const i = users.findIndex((u) => u.user_id === user.user_id);
  if (i >= 0) {
    const next = [...users];
    next[i] = { ...next[i], ...user };
    return next;
  }
  return [...users, user];
}

export function useLineChat() {
  const [conversations, setConversations] = useState<LineConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const usersRef = useRef<LineUserOut[]>([]);
  const messagesRef = useRef<LineMessageOut[]>([]);

  const rebuild = useCallback(() => {
    setConversations(
      buildLineConversations(usersRef.current, messagesRef.current),
    );
  }, []);

  const applyRealtimeMessage = useCallback(
    (message: LineMessageOut) => {
      messagesRef.current = mergeLineMessages(messagesRef.current, [message]);
      rebuild();
    },
    [rebuild],
  );

  const handleRealtime = useCallback(
    (event: LineRealtimeEvent) => {
      if (event.type === "line:message") {
        applyRealtimeMessage(event.message);
      }
      if (event.type === "line:user") {
        usersRef.current = upsertUser(usersRef.current, event.user);
        rebuild();
      }
    },
    [applyRealtimeMessage, rebuild],
  );

  const { connected: realtimeConnected } = useLineRealtime(handleRealtime);

  const load = useCallback(async () => {
    try {
      const [users, messages] = await Promise.all([
        listLineUsers(),
        listLineMessages(),
      ]);
      usersRef.current = users;
      messagesRef.current = messages;
      rebuild();
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load LINE messages",
      );
    } finally {
      setLoading(false);
    }
  }, [rebuild]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const startPoll = () => {
      if (interval) clearInterval(interval);
      const ms =
        document.visibilityState === "visible"
          ? LINE_POLL_ACTIVE_MS
          : LINE_POLL_IDLE_MS;
      interval = setInterval(() => {
        if (document.visibilityState === "visible") void load();
      }, ms);
    };

    startPoll();

    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
      startPoll();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  const sendMessage = useCallback(
    async (lineUserId: string, text: string) => {
      setSending(true);
      try {
        await sendLineChatMessageFromClient(lineUserId, text);
        await load();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to send LINE message";
        setError(msg);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [load],
  );

  return {
    conversations,
    loading,
    error,
    sending,
    realtimeConnected,
    refresh: load,
    sendMessage,
  };
}
