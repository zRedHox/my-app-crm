import { apiClient } from "./client";
import { getAccessToken } from "@/lib/auth/token";
import type { LeadCreate, LeadOut, LeadUpdate } from "./types";

export interface GetLeadsParams {
  search?: string;
  status?: string;
  skip?: number;
  limit?: number;
  /** Admin: return all leads in the organization */
  all_leads?: boolean;
}

export async function getLeads(params: GetLeadsParams = {}): Promise<LeadOut[]> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.skip != null) qs.set("skip", String(params.skip));
  if (params.limit != null) qs.set("limit", String(params.limit));
  if (params.all_leads) qs.set("all_leads", "true");

  const query = qs.toString();
  return apiClient<LeadOut[]>(`/api/v1/leads${query ? `?${query}` : ""}`);
}

/** Create lead — no auth required per API */
export async function getLead(leadId: number | string): Promise<LeadOut> {
  return apiClient<LeadOut>(`/api/v1/leads/${leadId}`);
}

export async function deleteLead(leadId: number | string): Promise<void> {
  return apiClient<void>(`/api/v1/leads/${leadId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function updateLead(
  leadId: number | string,
  data: LeadUpdate,
): Promise<LeadOut> {
  return apiClient<LeadOut>(`/api/v1/leads/${leadId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function createLead(data: LeadCreate): Promise<LeadOut> {
  const hasToken = Boolean(getAccessToken());
  return apiClient<LeadOut>("/api/v1/leads", {
    method: "POST",
    body: JSON.stringify(data),
    auth: hasToken,
  });
}

export { formDataToLeadPayload as formDataToLeadCreate } from "@/lib/leads/form";
