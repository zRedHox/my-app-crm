/** Matches backend OpenAPI schemas */

export type BudgetRange =
  | "100,000 ฿ - 300,000 ฿"
  | "400,000 ฿ - 600,000 ฿"
  | "มากกว่า 700,000 ฿";

export type LeadStatus = "new" | "proposing" | "rd_request" | "sale_order";

export interface LeadCreate {
  name?: string | null;
  email?: string | null;
  contact_name?: string | null;
  contact_title?: string | null;
  job_position?: string | null;
  phone?: string | null;
  mobile?: string | null;
  line_id?: string | null;
  customer_budget?: BudgetRange | null;
  product_interest?: string | null;
  internal_notes?: string | null;
  company_name?: string | null;
  source?: string | null;
  status?: LeadStatus | null;
  probability?: number | null;
  invoice_total?: number | null;
  salesperson?: string | null;
  assigned_user_id?: number | null;
}

export interface LeadOut extends LeadCreate {
  id: number;
  created_at: string;
  updated_at?: string | null;
}

export interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationErrorItem[] | string;
}

export interface LoginResponse {
  access_token: string;
  token_type?: string;
}
