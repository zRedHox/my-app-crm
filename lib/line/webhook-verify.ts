import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify LINE webhook signature (X-Line-Signature).
 * @see https://developers.line.biz/en/docs/messaging-api/receiving-messages/
 */
export function verifyLineSignature(
  rawBody: string,
  signature: string | null,
  channelSecret: string,
): boolean {
  if (!signature || !channelSecret) return false;

  const hash = createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest();

  try {
    const expected = Buffer.from(signature, "base64");
    return (
      expected.length === hash.length &&
      timingSafeEqual(expected, hash)
    );
  } catch {
    return false;
  }
}
