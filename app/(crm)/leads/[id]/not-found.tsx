import { ButtonLink } from "@/components/ui/button";

export default function LeadNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Lead not found</h1>
      <p className="mt-2 text-sm text-slate-500">This lead may have been removed.</p>
      <ButtonLink href="/leads" className="mt-6">
        Back to Leads
      </ButtonLink>
    </div>
  );
}
