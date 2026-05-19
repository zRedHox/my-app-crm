"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/leads/form-section";
import { createLead, formDataToLeadCreate } from "@/lib/api/leads";
import { getMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { isAuthenticated } from "@/lib/auth/token";
import { useIsAuthenticated } from "@/lib/auth/use-is-authenticated";
import { budgetRanges, productInterests } from "@/lib/mock-data";

type FormErrors = Partial<
  Record<"fullName" | "email" | "phone" | "budgetRange" | "productInterest", string>
>;

const budgetOptions = budgetRanges.map((b) => ({ value: b.value, label: b.label }));
const productOptions = productInterests.map((p) => ({ value: p, label: p }));

export function CreateLeadForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isAuthed = useIsAuthenticated();

  function validate(form: FormData): FormErrors {
    const next: FormErrors = {};

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const form = new FormData(e.currentTarget);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = formDataToLeadCreate(form);

      if (isAuthenticated()) {
        try {
          const me = await getMe();
          payload.assigned_user_id = me.id;
        } catch {
          /* continue without assignment if profile fetch fails */
        }
      }

      const created = await createLead(payload);
      router.push(`/leads?created=1&id=${created.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Failed to create lead. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isAuthed && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sign in before creating a lead so it appears in your leads list.
        </p>
      )}
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
              placeholder="e.g. Somchai Prasert"
              required
              error={errors.fullName}
            />
          </div>
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="Contact person"
            name="contactPerson"
            placeholder="e.g. HR Manager, Owner"
          />
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="+66 81 234 5678"
            autoComplete="tel"
            error={errors.phone}
          />
          <div className="sm:col-span-2">
            <Input
              label="LINE ID"
              name="lineId"
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
            placeholder="e.g. Sales Director, CEO"
          />
          <Select
            label="Product interest"
            name="productInterest"
            defaultValue=""
            options={productOptions}
            placeholder="Select product interest"
            error={errors.productInterest}
          />
          <div className="sm:col-span-2">
            <Select
              label="Budget range"
              name="budgetRange"
              defaultValue=""
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
          placeholder="Meeting notes, preferences, next steps..."
          rows={5}
        />
      </FormSection>

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create lead"}
        </Button>
      </div>
    </form>
  );
}
