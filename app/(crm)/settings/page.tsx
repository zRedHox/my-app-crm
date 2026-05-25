import { PageHeader } from "@/components/layout/page-header";
import { LineWebhookSetup } from "@/components/settings/line-webhook-setup";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Admin tools and integrations"
      />
      <section className="max-w-2xl space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Admin tools</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            LINE webhook and channel configuration
          </p>
        </div>
        <LineWebhookSetup />
      </section>
    </>
  );
}
