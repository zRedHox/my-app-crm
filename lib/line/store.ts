/**
 * Persist LINE users & messages to ecobz backend (source of truth for Chat Center).
 */
import { apiClient } from "@/lib/api/client";
import {
  LINE_MESSAGES_FETCH_LIMIT,
  LINE_PROVIDER_INBOUND,
  LINE_PROVIDER_OUTBOUND,
} from "./config";
import type { LineMessageOut, LineUserOut } from "./types";

const PREFIX = "/api/v1/line";

export async function listLineUsers(): Promise<LineUserOut[]> {
  return apiClient<LineUserOut[]>(`${PREFIX}/users`, { auth: false });
}

export async function listLineMessages(): Promise<LineMessageOut[]> {
  const qs = new URLSearchParams({
    limit: String(LINE_MESSAGES_FETCH_LIMIT),
  });
  return apiClient<LineMessageOut[]>(`${PREFIX}/messages?${qs}`, {
    auth: false,
  });
}

export async function upsertLineUser(data: {
  user_id: string;
  display_name?: string | null;
  picture_url?: string | null;
  status_message?: string | null;
}): Promise<LineUserOut> {
  const existing = (await listLineUsers()).find((u) => u.user_id === data.user_id);

  if (existing) {
    return apiClient<LineUserOut>(`${PREFIX}/users/${data.user_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      auth: false,
    });
  }

  return apiClient<LineUserOut>(`${PREFIX}/users`, {
    method: "POST",
    body: JSON.stringify(data),
    auth: false,
  });
}

export async function saveInboundMessage(data: {
  user_id: string;
  message_text: string;
  message_type?: string;
  sticker_id?: string | null;
  reply_token?: string | null;
}): Promise<LineMessageOut> {
  return apiClient<LineMessageOut>(`${PREFIX}/messages`, {
    method: "POST",
    body: JSON.stringify({
      ...data,
      provider: LINE_PROVIDER_INBOUND,
      is_read: false,
    }),
    auth: false,
  });
}

export async function saveOutboundMessage(data: {
  user_id: string;
  message_text: string;
}): Promise<LineMessageOut> {
  return apiClient<LineMessageOut>(`${PREFIX}/messages`, {
    method: "POST",
    body: JSON.stringify({
      user_id: data.user_id,
      message_text: data.message_text,
      message_type: "text",
      provider: LINE_PROVIDER_OUTBOUND,
      is_read: true,
    }),
    auth: false,
  });
}
