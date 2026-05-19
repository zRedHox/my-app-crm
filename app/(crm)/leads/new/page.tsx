import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CreateLeadForm } from "@/components/leads/create-lead-form";

export default function CreateLeadPage() {
  return (
    <>
      <Link
        href="/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#1d4ed8] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      <PageHeader
        title="Create Lead"
        description="Add a new lead to your pipeline"
      />

      <div className="mx-auto max-w-2xl">
        <CreateLeadForm />
      </div>
    </>
  );
}
