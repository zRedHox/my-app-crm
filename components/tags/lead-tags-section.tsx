"use client";

import { useMemo } from "react";
import { CustomerTagsEditor } from "@/components/tags/customer-tags-editor";
import { TagList } from "@/components/tags/tag-list";
import { useMergedCustomerTags } from "@/hooks/use-customer-tags";
import { leadTagLookupKeys, writeLeadCustomerTags } from "@/lib/tags/config";

interface LeadTagsSectionProps {
  leadId: string;
  lineId?: string | null;
  isAdmin: boolean;
}

export function LeadTagsSection({ leadId, lineId, isAdmin }: LeadTagsSectionProps) {
  const keys = useMemo(() => leadTagLookupKeys(leadId, lineId), [leadId, lineId]);
  const { tags, reload } = useMergedCustomerTags(keys);

  function handleChange(next: string[]) {
    writeLeadCustomerTags(leadId, lineId, next);
    reload();
  }

  if (!isAdmin && tags.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Tags</p>
      {isAdmin ? (
        <CustomerTagsEditor tags={tags} onChange={handleChange} />
      ) : (
        <TagList tags={tags} />
      )}
    </div>
  );
}
