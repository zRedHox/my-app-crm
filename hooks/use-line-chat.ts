"use client";

import { useCallback, useEffect, useState } from "react";
import { LINE_POLL_INTERVAL_MS } from "@/lib/line/config";
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
    const timer = window.setTimeout(() => void load(), 0);
    const id = window.setInterval(() => void load(), LINE_POLL_INTERVAL_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(id);
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
