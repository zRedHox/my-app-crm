import { getLineUserProfile } from "./messaging-api";
import { saveInboundMessage, upsertLineUser } from "./store";
import {
  getEventUserId,
  messageEventToText,
  type LineMessageEvent,
  type LineWebhookBody,
} from "./webhook-types";

export interface WebhookHandleResult {
  processed: number;
  skipped: number;
}

export async function handleLineWebhook(
  body: LineWebhookBody,
): Promise<WebhookHandleResult> {
  let processed = 0;
  let skipped = 0;

  for (const event of body.events) {
    try {
      const done = await processEvent(event);
      if (done) processed += 1;
      else skipped += 1;
    } catch (err) {
      console.error("[LINE webhook] event failed:", event.type, err);
      skipped += 1;
    }
  }

  return { processed, skipped };
}

async function processEvent(event: LineWebhookBody["events"][number]): Promise<boolean> {
  const userId = getEventUserId(event);
  if (!userId) return false;

  if (event.type === "follow") {
    const profile = await getLineUserProfile(userId);
    await upsertLineUser({
      user_id: userId,
      display_name: profile.displayName,
      picture_url: profile.pictureUrl ?? null,
      status_message: profile.statusMessage ?? null,
    });
    return true;
  }

  if (event.type === "message") {
    await handleMessageEvent(event as LineMessageEvent, userId);
    return true;
  }

  return false;
}

async function handleMessageEvent(
  event: LineMessageEvent,
  userId: string,
): Promise<void> {
  const profile = await getLineUserProfile(userId);
  await upsertLineUser({
    user_id: userId,
    display_name: profile.displayName,
    picture_url: profile.pictureUrl ?? null,
    status_message: profile.statusMessage ?? null,
  });

  const { text, messageType, stickerId } = messageEventToText(event.message);

  await saveInboundMessage({
    user_id: userId,
    message_text: text,
    message_type: messageType,
    sticker_id: stickerId ?? null,
    reply_token: event.replyToken ?? null,
  });
}
