"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LINE_POLL_ACTIVE_MS,
  LINE_POLL_IDLE_MS,
} from "@/lib/line/config";
import { buildLineConversations } from "@/lib/line/conversations";
import {
  fetchLineMessagesForUser,
  mergeLineMessages,
} from "@/lib/line/messages-loader";
import { sendLineChatMessageFromClient } from "@/lib/line/send-client";
import { listLineMessages, listLineUsers } from "@/lib/line/store";
import type { LineConversation } from "@/lib/line/types";
import type { LineMessageOut, LineUserOut } from "@/lib/line/types";
import type { LineRealtimeEvent } from "@/lib/line/realtime-events";
import { ApiError } from "@/lib/api/client";
import { useLineRealtime } from "@/hooks/use-line-realtime";

function conversationsWithThreadHistory(
  users: LineUserOut[],
  inboxMessages: LineMessageOut[],
  threadHistory: Map<string, LineMessageOut[]>,
): LineConversation[] {
  const mergedByUser = new Map<string, LineMessageOut[]>();

  for (const msg of inboxMessages) {
    const list = mergedByUser.get(msg.user_id) ?? [];
    list.push(msg);
    mergedByUser.set(msg.user_id, list);
  }

  for (const [userId, history] of threadHistory) {
    const inbox = mergedByUser.get(userId) ?? [];
    mergedByUser.set(userId, mergeLineMessages(inbox, history));
  }

  const allMessages = [...mergedByUser.values()].flat();
  return buildLineConversations(users, allMessages);
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
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const threadHistoryRef = useRef<Map<string, LineMessageOut[]>>(new Map());
  const usersRef = useRef<LineUserOut[]>([]);
  const inboxRef = useRef<LineMessageOut[]>([]);

  const rebuild = useCallback(() => {
    setConversations(
      conversationsWithThreadHistory(
        usersRef.current,
        inboxRef.current,
        threadHistoryRef.current,
      ),
    );
  }, []);

  const applyRealtimeMessage = useCallback(
    (message: LineMessageOut) => {
      inboxRef.current = mergeLineMessages(inboxRef.current, [message]);
      const cached = threadHistoryRef.current.get(message.user_id);
      if (cached) {
        threadHistoryRef.current.set(
          message.user_id,
          mergeLineMessages(cached, [message]),
        );
      }
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
      inboxRef.current = messages;
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

  const loadThreadHistory = useCallback(
    async (lineUserId: string) => {
      const inboxForUser = inboxRef.current.filter(
        (m) => m.user_id === lineUserId,
      );
      if (inboxForUser.length > 0) {
        threadHistoryRef.current.set(lineUserId, inboxForUser);
        rebuild();
      }

      setThreadLoading(true);
      try {
        const history = await fetchLineMessagesForUser(lineUserId);
        threadHistoryRef.current.set(
          lineUserId,
          mergeLineMessages(inboxForUser, history),
        );
        rebuild();
      } catch {
        /* poll will retry */
      } finally {
        setThreadLoading(false);
      }
    },
    [rebuild],
  );

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
        await loadThreadHistory(lineUserId);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to send LINE message";
        setError(msg);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [loadThreadHistory],
  );

  return {
    conversations,
    loading,
    threadLoading,
    error,
    sending,
    realtimeConnected,
    refresh: load,
    sendMessage,
    loadThreadHistory,
  };
}
