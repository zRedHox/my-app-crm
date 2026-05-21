import { LeadEditView } from "@/components/leads/lead-edit-view";

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params;
  return <LeadEditView leadId={id} />;
}
