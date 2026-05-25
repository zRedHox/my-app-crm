import { apiClient } from "@/lib/api/client";
import {
  LINE_INBOX_FETCH_LIMIT,
  LINE_THREAD_SCAN_LIMIT,
} from "./config";
import type { LineMessageOut } from "./types";

const MESSAGES_PATH = "/api/v1/line/messages";
const PAGE_SIZE = 500;
const COUNT_STORAGE_KEY = "ecobz_line_message_count";
const COUNT_CACHE_MS = 5 * 60_000;

/** In-memory + sessionStorage count cache */
let cachedTotal: { count: number; at: number } | null = null;

function readStoredCount(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(COUNT_STORAGE_KEY);
    const n = raw ? Number.parseInt(raw, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeStoredCount(count: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(COUNT_STORAGE_KEY, String(count));
  } catch {
    /* ignore quota */
  }
}

function setCachedCount(count: number): void {
  cachedTotal = { count, at: Date.now() };
  writeStoredCount(count);
}

function getCachedCount(): number | null {
  const now = Date.now();
  if (cachedTotal && now - cachedTotal.at < COUNT_CACHE_MS) {
    return cachedTotal.count;
  }
  const stored = readStoredCount();
  if (stored) {
    cachedTotal = { count: stored, at: now };
    return stored;
  }
  return null;
}

async function fetchMessagePage(skip: number, limit: number): Promise<LineMessageOut[]> {
  const qs = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  return apiClient<LineMessageOut[]>(`${MESSAGES_PATH}?${qs}`, { auth: false });
}

/** Find total message count without scanning from 0 (probes high skip values first). */
async function findMessageTotalFast(): Promise<number> {
  const probes = [12_000, 6_000, 3_000, 1_500, 750, 0];
  let lastHit = 0;

  for (const skip of probes) {
    const batch = await fetchMessagePage(skip, 1);
    if (batch.length > 0) lastHit = skip;
  }

  let skip = lastHit;
  while (true) {
    const batch = await fetchMessagePage(skip, PAGE_SIZE);
    if (batch.length === 0) return skip;
    if (batch.length < PAGE_SIZE) return skip + batch.length;
    skip += batch.length;
  }
}

async function resolveMessageTotal(force = false): Promise<number> {
  if (!force) {
    const cached = getCachedCount();
    if (cached) return cached;
  }
  const count = await findMessageTotalFast();
  setCachedCount(count);
  return count;
}

/** Recent inbox messages — usually 1 HTTP request when count is cached */
export async function fetchRecentLineMessages(
  maxMessages = LINE_INBOX_FETCH_LIMIT,
): Promise<LineMessageOut[]> {
  let total = getCachedCount();

  if (!total) {
    total = await findMessageTotalFast();
    setCachedCount(total);
  }

  const skip = Math.max(0, total - maxMessages);
  const messages = await fetchMessagePage(skip, maxMessages);

  const newTotal = skip + messages.length;
  if (newTotal > total) setCachedCount(newTotal);

  return messages;
}

/** Thread history — scans recent tail only (not the full DB) */
export async function fetchLineMessagesForUser(
  userId: string,
): Promise<LineMessageOut[]> {
  const total = await resolveMessageTotal();
  const scanFrom = Math.max(0, total - LINE_THREAD_SCAN_LIMIT);
  const matched: LineMessageOut[] = [];
  let skip = scanFrom;

  while (skip < total) {
    const batch = await fetchMessagePage(
      skip,
      Math.min(PAGE_SIZE, total - skip),
    );
    if (batch.length === 0) break;
    matched.push(...batch.filter((m) => m.user_id === userId));
    skip += batch.length;
    if (batch.length < PAGE_SIZE) break;
  }

  return matched.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

/** Merge by message id — keeps history when live events arrive (WebSocket-safe) */
export function mergeLineMessages(
  existing: LineMessageOut[],
  incoming: LineMessageOut[],
): LineMessageOut[] {
  const byId = new Map<number, LineMessageOut>();
  for (const m of existing) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

export function invalidateLineMessageCountCache(): void {
  cachedTotal = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(COUNT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
