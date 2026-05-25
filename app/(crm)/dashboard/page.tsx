import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live overview of leads and LINE chats"
        action={
          <ButtonLink href="/leads" variant="outline" size="sm">
            View all leads
          </ButtonLink>
        }
      />
      <DashboardView />
    </>
  );
}
