/** Webhook path on this Next.js app (LINE Developer Console → Webhook URL) */
export const LINE_WEBHOOK_PATH = "/api/line/webhook";

export function getWebhookUrl(appBaseUrl: string): string {
  return `${appBaseUrl.replace(/\/$/, "")}${LINE_WEBHOOK_PATH}`;
}

/** Poll when Chat Center tab is visible */
export const LINE_POLL_ACTIVE_MS = Number(
  process.env.NEXT_PUBLIC_LINE_POLL_ACTIVE_MS ?? 3_000,
);

/** Poll when tab is hidden (fallback) */
export const LINE_POLL_IDLE_MS = Number(
  process.env.NEXT_PUBLIC_LINE_POLL_IDLE_MS ?? 30_000,
);

/** @deprecated use LINE_POLL_ACTIVE_MS */
export const LINE_POLL_INTERVAL_MS = LINE_POLL_ACTIVE_MS;

/** Inbox: recent messages loaded on Chat Center open (keep small for speed) */
export const LINE_INBOX_FETCH_LIMIT = Number(
  process.env.NEXT_PUBLIC_LINE_INBOX_FETCH_LIMIT ?? 400,
);

/** Thread open: how far back to scan for one user's history */
export const LINE_THREAD_SCAN_LIMIT = Number(
  process.env.NEXT_PUBLIC_LINE_THREAD_SCAN_LIMIT ?? 2_500,
);

/** Stored in backend `provider` field */
export const LINE_PROVIDER_INBOUND = "line-inbound";
export const LINE_PROVIDER_OUTBOUND = "ecobz-crm";
