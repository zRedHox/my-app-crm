import { getLineRealtimeBus } from "@/lib/line/realtime-bus";
import { verifySseToken } from "@/lib/line/sse-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events for LINE chat (easier than WebSocket — works with `next start`).
 * Browser: EventSource(`/api/line/events?token=...`)
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const ok = await verifySseToken(token);
  if (!ok) {
    return new Response("Unauthorized", { status: 401 });
  }

  const bus = getLineRealtimeBus();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      unsubscribe = bus.subscribe(send);
      send(JSON.stringify({ type: "connected" }));

      heartbeat = setInterval(() => {
        send(JSON.stringify({ type: "ping" }));
      }, 25_000);
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
