"use client";

import { CustomerTagsEditor } from "@/components/tags/customer-tags-editor";
import { TagList } from "@/components/tags/tag-list";
import { useCustomerTags } from "@/hooks/use-customer-tags";

interface CustomerTagsPanelProps {
  customerKey: string;
  isAdmin: boolean;
  compact?: boolean;
}

export function CustomerTagsPanel({ customerKey, isAdmin, compact }: CustomerTagsPanelProps) {
  const { tags, save } = useCustomerTags(customerKey);

  if (!isAdmin && tags.length === 0) return null;

  return (
    <div className={compact ? "px-4 pb-3" : "border-t border-slate-100 px-4 py-3"}>
      {isAdmin ? (
        <CustomerTagsEditor tags={tags} onChange={save} compact={compact} />
      ) : (
        <TagList tags={tags} size="sm" />
      )}
    </div>
  );
}
