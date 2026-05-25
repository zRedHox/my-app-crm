/** LINE Messaging API webhook payload (subset) */

export interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}

export type LineWebhookEvent =
  | LineMessageEvent
  | LineFollowEvent
  | LineUnfollowEvent
  | LinePostbackEvent;

interface LineEventBase {
  type: string;
  timestamp: number;
  source: { type: string; userId?: string; groupId?: string; roomId?: string };
  replyToken?: string;
  mode?: string;
}

export interface LineMessageEvent extends LineEventBase {
  type: "message";
  message: LineEventMessage;
}

export interface LineFollowEvent extends LineEventBase {
  type: "follow";
}

export interface LineUnfollowEvent extends LineEventBase {
  type: "unfollow";
}

export interface LinePostbackEvent extends LineEventBase {
  type: "postback";
  postback: { data: string };
}

export interface LineTextMessage {
  type: "text";
  id: string;
  text: string;
}

export interface LineStickerMessage {
  type: "sticker";
  id: string;
  stickerId: string;
}

export interface LineOtherMessage {
  type: string;
  id?: string;
}

export type LineEventMessage =
  | LineTextMessage
  | LineStickerMessage
  | LineOtherMessage;

export function getEventUserId(event: LineWebhookEvent): string | null {
  return event.source.userId ?? null;
}

function isTextMessage(m: LineEventMessage): m is LineTextMessage {
  return m.type === "text" && "text" in m;
}

function isStickerMessage(m: LineEventMessage): m is LineStickerMessage {
  return m.type === "sticker" && "stickerId" in m;
}

export function messageEventToText(message: LineEventMessage): {
  text: string;
  messageType: string;
  stickerId?: string;
} {
  if (isTextMessage(message)) {
    return { text: message.text, messageType: "text" };
  }
  if (isStickerMessage(message)) {
    return {
      text: "[Sticker]",
      messageType: "sticker",
      stickerId: message.stickerId,
    };
  }
  return { text: `[${message.type}]`, messageType: message.type };
}
