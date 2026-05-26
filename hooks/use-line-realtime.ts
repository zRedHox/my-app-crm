"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken, subscribeAuth } from "@/lib/auth/token";
import { LINE_EVENTS_PATH } from "@/lib/line/realtime-events";
import type { LineRealtimeEvent } from "@/lib/line/realtime-events";

export function useLineRealtime(onEvent: (event: LineRealtimeEvent) => void) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    let source: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    function connect() {
      if (closed) return;

      const token = getAccessToken();
      if (!token) {
        setConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
        return;
      }

      const url = `${LINE_EVENTS_PATH}?token=${encodeURIComponent(token)}`;
      source = new EventSource(url);

      source.onopen = () => setConnected(true);

      source.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as LineRealtimeEvent;
          if (data.type === "connected") {
            setConnected(true);
            return;
          }
          if (data.type === "ping") return;
          onEventRef.current(data);
        } catch {
          /* ignore */
        }
      };

      source.onerror = () => {
        setConnected(false);
        source?.close();
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    const unsubAuth = subscribeAuth(() => {
      source?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      connect();
    });

    return () => {
      closed = true;
      unsubAuth();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      source?.close();
      setConnected(false);
    };
  }, []);

  return { connected };
}
