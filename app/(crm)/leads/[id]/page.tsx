import { LeadDetailView } from "@/components/leads/lead-detail-view";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  return <LeadDetailView leadId={id} />;
}
