/** Server-only LINE credentials (never use NEXT_PUBLIC_ for secrets) */

export interface LineConfig {
  channelAccessToken: string;
  channelSecret: string;
  appUrl: string;
}

export function getLineConfig(): LineConfig {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  const channelSecret = process.env.LINE_CHANNEL_SECRET?.trim();
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, "");

  if (!channelAccessToken) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }
  if (!channelSecret) {
    throw new Error("LINE_CHANNEL_SECRET is not set");
  }

  return { channelAccessToken, channelSecret, appUrl };
}

export function tryGetLineConfig(): LineConfig | null {
  try {
    return getLineConfig();
  } catch {
    return null;
  }
}
