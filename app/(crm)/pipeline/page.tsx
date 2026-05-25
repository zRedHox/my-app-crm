import { PageHeader } from "@/components/layout/page-header";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default function PipelinePage() {
  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Kanban by lead status from the server"
      />
      <PipelineBoard />
    </>
  );
}
