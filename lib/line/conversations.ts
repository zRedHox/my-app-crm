import { LINE_PROVIDER_OUTBOUND } from "./config";
import type {
  LineConversation,
  LineChatMessage,
  LineMessageOut,
  LineUserOut,
} from "./types";

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function messageSender(msg: LineMessageOut): "customer" | "agent" {
  return msg.provider === LINE_PROVIDER_OUTBOUND ? "agent" : "customer";
}

function toChatMessage(msg: LineMessageOut): LineChatMessage {
  return {
    id: String(msg.id),
    text: msg.sticker_url ? "[Sticker]" : msg.message_text,
    sender: messageSender(msg),
    timestamp: formatTime(msg.timestamp),
  };
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export function lineMessagesToChatMessages(
  messages: LineMessageOut[],
): LineChatMessage[] {
  return [...messages]
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    .map(toChatMessage);
}

export function buildLineConversations(
  users: LineUserOut[],
  messages: LineMessageOut[],
): LineConversation[] {
  const userMap = new Map(users.map((u) => [u.user_id, u]));
  const byUser = new Map<string, LineMessageOut[]>();

  for (const msg of messages) {
    const list = byUser.get(msg.user_id) ?? [];
    list.push(msg);
    byUser.set(msg.user_id, list);
  }

  const rows: { at: number; conv: LineConversation }[] = [];

  for (const [lineUserId, msgs] of byUser) {
    const sorted = [...msgs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const last = sorted[sorted.length - 1];
    const user = userMap.get(lineUserId);
    const name = user?.display_name?.trim() || lineUserId.slice(0, 12);

    rows.push({
      at: new Date(last.timestamp).getTime(),
      conv: {
        id: `line-${lineUserId}`,
        lineUserId,
        customerName: name,
        avatar: initials(name),
        pictureUrl: user?.picture_url,
        lastMessage: last.sticker_url ? "[Sticker]" : last.message_text,
        lastMessageAt: formatTime(last.timestamp),
        unread: sorted.filter(
          (m) => messageSender(m) === "customer" && !m.is_read,
        ).length,
        messages: lineMessagesToChatMessages(sorted),
      },
    });
  }

  return rows.sort((a, b) => b.at - a.at).map((r) => r.conv);
}
