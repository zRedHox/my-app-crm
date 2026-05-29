"use client";

export const TAG_CATALOG_KEY = "crm_tag_catalog";
export const CUSTOMER_TAGS_KEY = "crm_customer_tags";

export type CustomerTagScope = "line" | "lead" | "mock";

export function customerTagKey(scope: CustomerTagScope, id: string): string {
  return `${scope}:${id}`;
}

export function leadTagLookupKeys(leadId: string | number, lineId?: string | null): string[] {
  const keys = [customerTagKey("lead", String(leadId))];
  const trimmed = lineId?.trim();
  if (trimmed) keys.push(customerTagKey("line", trimmed));
  return keys;
}

function normalizeTagName(name: string): string {
  return name.trim();
}

function tagDedupeKey(name: string): string {
  return name.trim().toLowerCase();
}

export function readTagCatalog(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TAG_CATALOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of parsed) {
      if (typeof item !== "string") continue;
      const name = normalizeTagName(item);
      const key = tagDedupeKey(name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
    return out;
  } catch {
    return [];
  }
}

export function writeTagCatalog(tags: string[]): void {
  if (typeof window === "undefined") return;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of tags) {
    const name = normalizeTagName(item);
    const key = tagDedupeKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  localStorage.setItem(TAG_CATALOG_KEY, JSON.stringify(out));
  dispatchTagsUpdated();
}

export function addTagToCatalog(name: string): string {
  const trimmed = normalizeTagName(name);
  if (!trimmed) return "";
  const catalog = readTagCatalog();
  const exists = catalog.some((t) => tagDedupeKey(t) === tagDedupeKey(trimmed));
  if (!exists) {
    writeTagCatalog([...catalog, trimmed]);
  }
  return trimmed;
}

export function readCustomerTagsMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOMER_TAGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!Array.isArray(value)) continue;
      out[key] = value
        .map((v) => (typeof v === "string" ? normalizeTagName(v) : ""))
        .filter(Boolean);
    }
    return out;
  } catch {
    return {};
  }
}

export function readCustomerTags(customerKey: string): string[] {
  return readCustomerTagsMap()[customerKey] ?? [];
}

export function getCustomerTagsForKey(customerKey: string): string[] {
  return readCustomerTags(customerKey);
}

export function writeCustomerTags(customerKey: string, tags: string[]): void {
  if (typeof window === "undefined") return;
  const map = readCustomerTagsMap();
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const tag of tags) {
    const name = normalizeTagName(tag);
    const key = tagDedupeKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    normalized.push(name);
    addTagToCatalog(name);
  }
  map[customerKey] = normalized;
  localStorage.setItem(CUSTOMER_TAGS_KEY, JSON.stringify(map));
  dispatchTagsUpdated();
}

export function readMergedCustomerTags(keys: string[]): string[] {
  const map = readCustomerTagsMap();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const customerKey of keys) {
    for (const tag of map[customerKey] ?? []) {
      const key = tagDedupeKey(tag);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(tag);
    }
  }
  return out;
}

/** Keep lead detail and LINE chat in sync when a lead has a LINE id. */
export function writeLeadCustomerTags(
  leadId: string | number,
  lineId: string | null | undefined,
  tags: string[],
): void {
  writeCustomerTags(customerTagKey("lead", String(leadId)), tags);
  const trimmed = lineId?.trim();
  if (trimmed) {
    writeCustomerTags(customerTagKey("line", trimmed), tags);
  }
}

export const TAGS_UPDATED_EVENT = "crm-tags-updated";

export function dispatchTagsUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TAGS_UPDATED_EVENT));
}
