"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMe } from "@/lib/api/users";
import { Select } from "@/components/ui/select";
import {
  defaultLeadFieldLabels,
  defaultPipelineStages,
  leadFieldLabelKeys,
  leadStatusOrder,
  pipelineBadgeColorOptions,
  pipelineColumnColorOptions,
  readLeadFieldLabels,
  readPipelineStages,
  readProductInterests,
  writeLeadFieldLabels,
  writePipelineStages,
  writeProductInterests,
  type PipelineStageConfig,
} from "@/lib/back-office/config";
import { productInterests } from "@/lib/mock-data";

export default function BackOfficePage() {
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saved, setSaved] = useState(false);

  const [labels, setLabels] = useState(defaultLeadFieldLabels);
  const [pipelineStages, setPipelineStages] = useState<PipelineStageConfig[]>(
    defaultPipelineStages,
  );
  const [productInput, setProductInput] = useState("");
  const [productList, setProductList] = useState<string[]>([]);

  useEffect(() => {
    getMe()
      .then((me) => setIsAdmin(me.role_id === 1))
      .catch(() => setIsAdmin(false))
      .finally(() => setCheckingRole(false));
  }, []);

  useEffect(() => {
    setLabels(readLeadFieldLabels());
    setPipelineStages(readPipelineStages());
    setProductList(readProductInterests(productInterests));
  }, []);

  function updatePipelineStage(
    id: PipelineStageConfig["id"],
    patch: Partial<Pick<PipelineStageConfig, "label" | "columnColor" | "badgeColor">>,
  ) {
    setPipelineStages((curr) =>
      curr.map((stage) => (stage.id === id ? { ...stage, ...patch } : stage)),
    );
    setSaved(false);
  }

  const canAdd = productInput.trim().length > 0;

  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of productList) {
      const key = item.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item.trim());
    }
    return out;
  }, [productList]);

  function addProduct() {
    const value = productInput.trim();
    if (!value) return;
    setProductList((curr) => [...curr, value]);
    setProductInput("");
    setSaved(false);
  }

  function removeProduct(index: number) {
    setProductList((curr) => curr.filter((_, i) => i !== index));
    setSaved(false);
  }

  function saveAll() {
    writeLeadFieldLabels(labels);
    writePipelineStages(pipelineStages);
    writeProductInterests(uniqueProducts);
    setProductList(uniqueProducts);
    setPipelineStages(readPipelineStages());
    setSaved(true);
  }

  function resetDefaults() {
    setLabels(defaultLeadFieldLabels);
    setPipelineStages([...defaultPipelineStages]);
    setProductList([...productInterests]);
    setSaved(false);
  }

  if (checkingRole) {
    return (
      <>
        <PageHeader title="Back office" description="Admin configuration" />
        <Card className="py-10 text-center text-sm text-slate-500">Checking access...</Card>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Back office" description="Admin configuration" />
        <Card className="flex items-center gap-3 border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <p className="text-sm">Only admin users can manage Back office settings.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Back office"
        description="Manage field labels, pipeline stages, and default form data for leads"
      />

      <div className="space-y-4 max-w-3xl">
        <Card className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Field labels</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Rename labels shown in lead create/edit forms
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {leadFieldLabelKeys.map((key) => (
              <Input
                key={key}
                label={defaultLeadFieldLabels[key]}
                value={labels[key]}
                onChange={(e) => {
                  setLabels((curr) => ({ ...curr, [key]: e.target.value }));
                  setSaved(false);
                }}
              />
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Pipeline stages</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Rename stages and colors shown on the pipeline board and lead status badges
            </p>
          </div>
          <ul className="space-y-4">
            {leadStatusOrder.map((statusId) => {
              const stage = pipelineStages.find((s) => s.id === statusId);
              if (!stage) return null;
              const defaultStage = defaultPipelineStages.find((s) => s.id === statusId)!;
              return (
                <li
                  key={stage.id}
                  className="space-y-3 rounded-lg border border-slate-200 p-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Status key: {stage.id}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Stage label"
                      value={stage.label}
                      onChange={(e) => updatePipelineStage(stage.id, { label: e.target.value })}
                    />
                    <div className="flex items-end gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${stage.badgeColor}`}
                      >
                        {stage.label || defaultStage.label}
                      </span>
                    </div>
                    <Select
                      label="Column color"
                      value={stage.columnColor}
                      options={pipelineColumnColorOptions.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      onChange={(e) =>
                        updatePipelineStage(stage.id, { columnColor: e.target.value })
                      }
                    />
                    <Select
                      label="Badge color"
                      value={stage.badgeColor}
                      options={pipelineBadgeColorOptions.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      onChange={(e) =>
                        updatePipelineStage(stage.id, { badgeColor: e.target.value })
                      }
                    />
                  </div>
                  <div
                    className={`rounded-xl px-3 py-2 ${stage.columnColor}`}
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {stage.label || defaultStage.label}
                    </p>
                    <p className="text-xs text-slate-500">Pipeline column preview</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Default product interest list</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Controls options in Product interest dropdown
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              label="New product interest"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              placeholder="e.g. OEM Service"
            />
            <Button type="button" className="self-end" disabled={!canAdd} onClick={addProduct}>
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {productList.map((item, idx) => (
              <li
                key={`${item}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span>{item}</span>
                <Button type="button" variant="ghost" onClick={() => removeProduct(idx)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={saveAll}>
            Save changes
          </Button>
          <Button type="button" variant="outline" onClick={resetDefaults}>
            Reset to defaults
          </Button>
          {saved && <span className="text-xs text-emerald-600">Saved</span>}
        </div>
      </div>
    </>
  );
}
