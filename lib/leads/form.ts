import type { LeadCreate, LeadOut, LeadStatus } from "@/lib/api/types";

export type LeadFormErrors = Partial<
  Record<"fullName" | "email" | "phone" | "budgetRange" | "productInterest", string>
>;

export function validateLeadForm(form: FormData): LeadFormErrors {
  const next: LeadFormErrors = {};

  if (!String(form.get("fullName")).trim()) {
    next.fullName = "Full name is required";
  }

  const email = String(form.get("email")).trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    next.email = "Enter a valid email address";
  }

  const phone = String(form.get("phone")).trim();
  if (phone && !/^[\d\s+\-()]+$/.test(phone)) {
    next.phone = "Enter a valid phone number";
  }

  if (!String(form.get("budgetRange")).trim()) {
    next.budgetRange = "Please select a budget range";
  }

  if (!String(form.get("productInterest")).trim()) {
    next.productInterest = "Please select a product interest";
  }

  return next;
}

export function formDataToLeadPayload(form: FormData): LeadCreate {
  const str = (key: string) => {
    const v = String(form.get(key) ?? "").trim();
    return v || null;
  };

  const status = str("status") as LeadStatus | null;

  return {
    name: str("fullName"),
    email: str("email"),
    contact_name: str("contactPerson"),
    phone: str("phone"),
    line_id: str("lineId"),
    company_name: str("companyName"),
    job_position: str("jobPosition"),
    product_interest: str("productInterest"),
    customer_budget: str("budgetRange") as LeadCreate["customer_budget"],
    internal_notes: str("notes"),
    status: status || "new",
  };
}

export function leadToFormDefaults(lead: LeadOut) {
  return {
    fullName: lead.name ?? "",
    email: lead.email ?? "",
    contactPerson: lead.contact_name ?? "",
    phone: lead.phone ?? "",
    lineId: lead.line_id ?? "",
    companyName: lead.company_name ?? "",
    jobPosition: lead.job_position ?? "",
    productInterest: lead.product_interest ?? "",
    budgetRange: lead.customer_budget ?? "",
    status: lead.status ?? "new",
    notes: lead.internal_notes ?? "",
  };
}
