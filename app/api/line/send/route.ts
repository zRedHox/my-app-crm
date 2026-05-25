import { getLineConfig } from "@/lib/line/env";
import { sendLineChatMessage } from "@/lib/line/send";

export async function POST(request: Request) {
  try {
    getLineConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : "LINE not configured";
    console.error("[LINE send] missing config:", err);
    return Response.json({ error: message }, { status: 503 });
  }

  let body: { user_id?: string; message_text?: string };
  try {
    body = (await request.json()) as { user_id?: string; message_text?: string };
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = body.user_id?.trim();
  const text = body.message_text?.trim();

  if (!userId) {
    return Response.json({ error: "user_id is required" }, { status: 400 });
  }
  if (!text) {
    return Response.json({ error: "message_text is required" }, { status: 400 });
  }

  try {
    await sendLineChatMessage(userId, text);
    return Response.json({ status: "ok", user_id: userId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send LINE message";
    console.error("[LINE send] failed:", err);
    return Response.json({ error: message }, { status: 502 });
  }
}
