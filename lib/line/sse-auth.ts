/** Verify CRM token for SSE connections (server-side). */

export async function verifySseToken(token: string | null): Promise<boolean> {
  if (!token?.trim()) return false;

  const base = (
    process.env.NEXT_PUBLIC_API_URL ?? "https://backend.ecobz.team"
  ).replace(/\/$/, "");

  try {
    const res = await fetch(`${base}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token.trim()}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
