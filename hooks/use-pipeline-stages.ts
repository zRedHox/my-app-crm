"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultPipelineStages,
  pipelineStagesForKanban,
  pipelineStagesToColors,
  pipelineStagesToLabels,
  readPipelineStages,
  type PipelineStageConfig,
} from "@/lib/back-office/config";

export function usePipelineStages() {
  const [stages, setStages] = useState<PipelineStageConfig[]>(defaultPipelineStages);

  useEffect(() => {
    setStages(readPipelineStages());
  }, []);

  const labels = useMemo(() => pipelineStagesToLabels(stages), [stages]);
  const colors = useMemo(() => pipelineStagesToColors(stages), [stages]);
  const kanbanStages = useMemo(() => pipelineStagesForKanban(stages), [stages]);

  return { stages, labels, colors, kanbanStages, reload: () => setStages(readPipelineStages()) };
}
