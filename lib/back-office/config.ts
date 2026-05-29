"use client";

import type { LeadStatus } from "@/lib/api/types";

export const BACK_OFFICE_PRODUCT_INTERESTS_KEY = "crm_back_office_product_interests";
export const BACK_OFFICE_FIELD_LABELS_KEY = "crm_back_office_field_labels";
export const BACK_OFFICE_PIPELINE_STAGES_KEY = "crm_back_office_pipeline_stages";

export const leadStatusOrder: LeadStatus[] = [
  "new",
  "proposing",
  "rd_request",
  "sale_order",
];

export interface PipelineStageConfig {
  id: LeadStatus;
  label: string;
  columnColor: string;
  badgeColor: string;
}

export const pipelineColumnColorOptions = [
  { value: "bg-slate-100", label: "Slate" },
  { value: "bg-blue-50", label: "Blue" },
  { value: "bg-indigo-50", label: "Indigo" },
  { value: "bg-amber-50", label: "Amber" },
  { value: "bg-emerald-50", label: "Emerald" },
  { value: "bg-violet-50", label: "Violet" },
  { value: "bg-rose-50", label: "Rose" },
] as const;

export const pipelineBadgeColorOptions = [
  { value: "bg-slate-100 text-slate-800", label: "Slate" },
  { value: "bg-blue-100 text-blue-800", label: "Blue" },
  { value: "bg-indigo-100 text-indigo-800", label: "Indigo" },
  { value: "bg-amber-100 text-amber-800", label: "Amber" },
  { value: "bg-emerald-100 text-emerald-800", label: "Emerald" },
  { value: "bg-violet-100 text-violet-800", label: "Violet" },
  { value: "bg-rose-100 text-rose-800", label: "Rose" },
] as const;

export const defaultPipelineStages: PipelineStageConfig[] = [
  {
    id: "new",
    label: "New Lead",
    columnColor: "bg-slate-100",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    id: "proposing",
    label: "Contacted",
    columnColor: "bg-blue-50",
    badgeColor: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "rd_request",
    label: "Appointment",
    columnColor: "bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  {
    id: "sale_order",
    label: "Demo",
    columnColor: "bg-emerald-50",
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
];

const defaultByStatus = Object.fromEntries(
  defaultPipelineStages.map((s) => [s.id, s]),
) as Record<LeadStatus, PipelineStageConfig>;

function normalizeStage(raw: Partial<PipelineStageConfig> | undefined, id: LeadStatus): PipelineStageConfig {
  const fallback = defaultByStatus[id];
  const label = typeof raw?.label === "string" ? raw.label.trim() : "";
  const columnColor =
    typeof raw?.columnColor === "string" ? raw.columnColor.trim() : "";
  const badgeColor = typeof raw?.badgeColor === "string" ? raw.badgeColor.trim() : "";
  return {
    id,
    label: label || fallback.label,
    columnColor: columnColor || fallback.columnColor,
    badgeColor: badgeColor || fallback.badgeColor,
  };
}

export function readPipelineStages(): PipelineStageConfig[] {
  if (typeof window === "undefined") return [...defaultPipelineStages];
  try {
    const raw = localStorage.getItem(BACK_OFFICE_PIPELINE_STAGES_KEY);
    if (!raw) return [...defaultPipelineStages];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...defaultPipelineStages];
    const byId = new Map<LeadStatus, Partial<PipelineStageConfig>>();
    for (const item of parsed) {
      if (!item || typeof item !== "object" || typeof item.id !== "string") continue;
      if (!leadStatusOrder.includes(item.id as LeadStatus)) continue;
      byId.set(item.id as LeadStatus, item as Partial<PipelineStageConfig>);
    }
    return leadStatusOrder.map((id) => normalizeStage(byId.get(id), id));
  } catch {
    return [...defaultPipelineStages];
  }
}

export function writePipelineStages(stages: PipelineStageConfig[]): void {
  if (typeof window === "undefined") return;
  const normalized = leadStatusOrder.map((id) => {
    const found = stages.find((s) => s.id === id);
    return normalizeStage(found, id);
  });
  localStorage.setItem(BACK_OFFICE_PIPELINE_STAGES_KEY, JSON.stringify(normalized));
}

export function pipelineStagesToLabels(stages: PipelineStageConfig[]): Record<string, string> {
  return Object.fromEntries(stages.map((s) => [s.id, s.label]));
}

export function pipelineStagesToColors(stages: PipelineStageConfig[]): Record<string, string> {
  return Object.fromEntries(stages.map((s) => [s.id, s.badgeColor]));
}

export function pipelineStagesForKanban(stages: PipelineStageConfig[]) {
  return stages.map((s) => ({
    id: s.id,
    label: s.label,
    color: s.columnColor,
  }));
}

export type LeadFieldLabelKey =
  | "fullName"
  | "email"
  | "contactPerson"
  | "phone"
  | "lineId"
  | "companyName"
  | "jobPosition"
  | "productInterest"
  | "budgetRange"
  | "status"
  | "notes";

export const leadFieldLabelKeys: LeadFieldLabelKey[] = [
  "fullName",
  "email",
  "contactPerson",
  "phone",
  "lineId",
  "companyName",
  "jobPosition",
  "productInterest",
  "budgetRange",
  "status",
  "notes",
];

export const defaultLeadFieldLabels: Record<LeadFieldLabelKey, string> = {
  fullName: "Full name",
  email: "Email address",
  contactPerson: "Contact person",
  phone: "Phone number",
  lineId: "LINE ID",
  companyName: "Company name",
  jobPosition: "Job position",
  productInterest: "Product interest",
  budgetRange: "Budget range",
  status: "Status",
  notes: "Notes",
};

export function readProductInterests(fallback: readonly string[]): string[] {
  if (typeof window === "undefined") return [...fallback];
  try {
    const raw = localStorage.getItem(BACK_OFFICE_PRODUCT_INTERESTS_KEY);
    if (!raw) return [...fallback];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...fallback];
    const list = parsed
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
    return list.length > 0 ? list : [...fallback];
  } catch {
    return [...fallback];
  }
}

export function writeProductInterests(values: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BACK_OFFICE_PRODUCT_INTERESTS_KEY, JSON.stringify(values));
}

export function readLeadFieldLabels(): Record<LeadFieldLabelKey, string> {
  if (typeof window === "undefined") return { ...defaultLeadFieldLabels };
  try {
    const raw = localStorage.getItem(BACK_OFFICE_FIELD_LABELS_KEY);
    if (!raw) return { ...defaultLeadFieldLabels };
    const parsed = JSON.parse(raw) as Partial<Record<LeadFieldLabelKey, string>>;
    return Object.fromEntries(
      leadFieldLabelKeys.map((key) => [
        key,
        parsed[key]?.trim() || defaultLeadFieldLabels[key],
      ]),
    ) as Record<LeadFieldLabelKey, string>;
  } catch {
    return { ...defaultLeadFieldLabels };
  }
}

export function writeLeadFieldLabels(values: Record<LeadFieldLabelKey, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BACK_OFFICE_FIELD_LABELS_KEY, JSON.stringify(values));
}
