"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LINE_POLL_ACTIVE_MS,
  LINE_POLL_IDLE_MS,
} from "@/lib/line/config";
import { buildLineConversations } from "@/lib/line/conversations";
import { sendLineChatMessageFromClient } from "@/lib/line/send-client";
import { listLineMessages, listLineUsers } from "@/lib/line/store";
import type { LineConversation } from "@/lib/line/types";
import { ApiError } from "@/lib/api/client";

export function useLineChat() {
  const [conversations, setConversations] = useState<LineConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [users, messages] = await Promise.all([
        listLineUsers(),
        listLineMessages(),
      ]);
      setConversations(buildLineConversations(users, messages));
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load LINE messages",
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
    refresh: load,
    sendMessage,
  };
}
