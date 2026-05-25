import { getLineConfig } from "./env";

const LINE_API = "https://api.line.me/v2/bot";

async function lineFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { channelAccessToken } = getLineConfig();
  const res = await fetch(`${LINE_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export async function getLineUserProfile(userId: string): Promise<LineUserProfile> {
  return lineFetch<LineUserProfile>(`/profile/${userId}`);
}

export async function pushTextMessage(userId: string, text: string): Promise<void> {
  await lineFetch("/message/push", {
    method: "POST",
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function replyTextMessage(replyToken: string, text: string): Promise<void> {
  await lineFetch("/message/reply", {
    method: "POST",
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}
