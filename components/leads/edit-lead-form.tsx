"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/leads/form-section";
import { updateLead } from "@/lib/api/leads";
import { ApiError } from "@/lib/api/client";
import type { LeadOut } from "@/lib/api/types";
import {
  validateLeadForm,
  formDataToLeadPayload,
  leadToFormDefaults,
  type LeadFormErrors,
} from "@/lib/leads/form";
import { budgetRanges, productInterests, statusLabels } from "@/lib/mock-data";

const budgetOptions = budgetRanges.map((b) => ({ value: b.value, label: b.label }));
const productOptions = productInterests.map((p) => ({ value: p, label: p }));
const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

interface EditLeadFormProps {
  lead: LeadOut;
}

export function EditLeadForm({ lead }: EditLeadFormProps) {
  const router = useRouter();
  const defaults = leadToFormDefaults(lead);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const form = new FormData(e.currentTarget);
    const nextErrors = validateLeadForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = formDataToLeadPayload(form);
      await updateLead(lead.id, payload);
      router.push(`/leads/${lead.id}?updated=1`);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Failed to update lead. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      )}

      <FormSection
        title="Personal Information"
        description="Primary contact details for this lead"
        icon={User}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Full name"
              name="fullName"
              defaultValue={defaults.fullName}
              placeholder="e.g. Somchai Prasert"
              required
              error={errors.fullName}
            />
          </div>
          <Input
            label="Email address"
            name="email"
            type="email"
            defaultValue={defaults.email}
            placeholder="name@company.com"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="Contact person"
            name="contactPerson"
            defaultValue={defaults.contactPerson}
            placeholder="e.g. HR Manager, Owner"
          />
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            placeholder="+66 81 234 5678"
            autoComplete="tel"
            error={errors.phone}
          />
          <div className="sm:col-span-2">
            <Input
              label="LINE ID"
              name="lineId"
              defaultValue={defaults.lineId}
              placeholder="@username or LINE ID"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Business Information"
        description="Role and buying intent"
        icon={Briefcase}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Job position"
            name="jobPosition"
            defaultValue={defaults.jobPosition}
            placeholder="e.g. Sales Director, CEO"
          />
          <Select
            label="Product interest"
            name="productInterest"
            defaultValue={defaults.productInterest}
            options={productOptions}
            placeholder="Select product interest"
            error={errors.productInterest}
          />
          <Select
            label="Status"
            name="status"
            defaultValue={defaults.status}
            options={statusOptions}
          />
          <div className="sm:col-span-2">
            <Select
              label="Budget range"
              name="budgetRange"
              defaultValue={defaults.budgetRange}
              options={budgetOptions}
              placeholder="Select budget range"
              error={errors.budgetRange}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Additional Information"
        description="Optional context and follow-up notes"
        icon={FileText}
      >
        <Textarea
          label="Notes"
          name="notes"
          defaultValue={defaults.notes}
          placeholder="Meeting notes, preferences, next steps..."
          rows={5}
        />
      </FormSection>

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/leads/${lead.id}`)}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
