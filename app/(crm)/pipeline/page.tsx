import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import {
  pipelineStages,
  pipelineDeals,
  formatCurrency,
} from "@/lib/mock-data";

export default function PipelinePage() {
  const totalValue = pipelineDeals.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <PageHeader
        title="Pipeline"
        description={`${pipelineDeals.length} deals · ${formatCurrency(totalValue)} total`}
      />

      {/* Horizontal scroll kanban — mobile & tablet friendly */}
      <div className="flex gap-3 overflow-x-auto pb-2 scroll-thin snap-x snap-mandatory md:gap-4">
        {pipelineStages.map((stage) => {
          const deals = pipelineDeals.filter((d) => d.stage === stage.id);
          const stageValue = deals.reduce((s, d) => s + d.value, 0);

          return (
            <div
              key={stage.id}
              className="flex w-[280px] shrink-0 snap-start flex-col sm:w-[300px]"
            >
              <div className={`mb-3 rounded-xl px-3 py-2 ${stage.color}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">{stage.label}</h2>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {deals.length}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{formatCurrency(stageValue)}</p>
              </div>

              <ul className="flex flex-1 flex-col gap-2">
                {deals.map((deal) => (
                  <li key={deal.id}>
                    <Card padding="sm" className="cursor-pointer transition hover:border-[#1d4ed8]/30 hover:shadow-md">
                      <p className="font-medium text-slate-900">{deal.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{deal.company}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1d4ed8]">
                          {formatCurrency(deal.value)}
                        </span>
                        <span className="text-xs text-slate-400">{deal.probability}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#1d4ed8]"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{deal.owner}</p>
                    </Card>
                  </li>
                ))}
                {deals.length === 0 && (
                  <li className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                    No deals
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
