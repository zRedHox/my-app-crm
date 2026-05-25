/** Browser-safe: calls Next.js API route (LINE token stays server-side). */

export async function sendLineChatMessageFromClient(
  userId: string,
  text: string,
): Promise<void> {
  const res = await fetch("/api/line/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message_text: text }),
  });

  const body = (await res.json().catch(() => ({}))) as { error?: string };

  if (!res.ok) {
    throw new Error(body.error ?? `Send failed (${res.status})`);
  }
}
