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

/** Backend GET /line/messages — recent inbox for Chat Center */
export const LINE_MESSAGES_FETCH_LIMIT = Number(
  process.env.NEXT_PUBLIC_LINE_MESSAGES_FETCH_LIMIT ?? 2_000,
);

/** Stored in backend `provider` field */
export const LINE_PROVIDER_INBOUND = "line-inbound";
export const LINE_PROVIDER_OUTBOUND = "ecobz-crm";
