import { getLineConfig, getWebhookUrl } from "@/lib/line";
import { handleLineWebhook } from "@/lib/line/webhook-handler";
import { verifyLineSignature } from "@/lib/line/webhook-verify";
import type { LineWebhookBody } from "@/lib/line/webhook-types";

/**
 * LINE webhook endpoint for this CRM app.
 *
 * Set in LINE Developers Console → Messaging API → Webhook URL:
 *   {NEXT_PUBLIC_APP_URL}/api/line/webhook
 *
 * Example: https://your-domain.com/api/line/webhook
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");

  let config;
  try {
    config = getLineConfig();
  } catch (err) {
    console.error("[LINE webhook] missing config:", err);
    return Response.json({ error: "LINE not configured" }, { status: 503 });
  }

  if (!verifyLineSignature(rawBody, signature, config.channelSecret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(rawBody) as LineWebhookBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.events)) {
    return Response.json({ error: "Missing events array" }, { status: 400 });
  }

  try {
    const result = await handleLineWebhook(body);
    return Response.json({ status: "ok", ...result });
  } catch (err) {
    console.error("[LINE webhook] handler error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

function isLocalAppUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const webhookUrlFromRequest = `${origin}/api/line/webhook`;
  let webhookUrl = webhookUrlFromRequest;

  try {
    const config = getLineConfig();
    const fromEnv = getWebhookUrl(config.appUrl);
    webhookUrl = isLocalAppUrl(fromEnv) ? webhookUrlFromRequest : fromEnv;
  } catch {
    /* use request origin when env not fully set */
  }

  const configured = Boolean(
    process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() &&
      process.env.LINE_CHANNEL_SECRET?.trim(),
  );

  return Response.json({
    service: "ecobz-crm-line-webhook",
    status: configured ? "ready" : "missing_env",
    webhook_url: webhookUrl,
    env_required: [
      "LINE_CHANNEL_ACCESS_TOKEN",
      "LINE_CHANNEL_SECRET",
      "NEXT_PUBLIC_APP_URL",
    ],
    line_console: "Paste webhook_url into LINE Developers → Messaging API → Webhook URL",
  });
}
