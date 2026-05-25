import { pushTextMessage } from "./messaging-api";
import { saveOutboundMessage } from "./store";

/** Send text to LINE user and persist on backend */
export async function sendLineChatMessage(
  userId: string,
  text: string,
): Promise<void> {
  await pushTextMessage(userId, text);
  await saveOutboundMessage({ user_id: userId, message_text: text });
}
