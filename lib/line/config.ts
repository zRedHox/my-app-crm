/** Webhook path on this Next.js app (LINE Developer Console → Webhook URL) */
export const LINE_WEBHOOK_PATH = "/api/line/webhook";

export function getWebhookUrl(appBaseUrl: string): string {
  return `${appBaseUrl.replace(/\/$/, "")}${LINE_WEBHOOK_PATH}`;
}

export const LINE_POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_LINE_POLL_INTERVAL_MS ?? 10_000,
);

/** Backend GET /line/messages defaults to limit=100 (oldest only). */
export const LINE_MESSAGES_FETCH_LIMIT = Number(
  process.env.NEXT_PUBLIC_LINE_MESSAGES_FETCH_LIMIT ?? 2_000,
);

/** Stored in backend `provider` field */
export const LINE_PROVIDER_INBOUND = "line-inbound";
export const LINE_PROVIDER_OUTBOUND = "ecobz-crm";
