"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagChip } from "@/components/tags/tag-chip";
import { TagList } from "@/components/tags/tag-list";
import { addTagToCatalog, readTagCatalog } from "@/lib/tags/config";

interface CustomerTagsEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  compact?: boolean;
}

function tagDedupeKeyLocal(name: string): string {
  return name.trim().toLowerCase();
}

export function CustomerTagsEditor({ tags, onChange, compact }: CustomerTagsEditorProps) {
  const [newTag, setNewTag] = useState("");
  const [open, setOpen] = useState(false);
  const catalog = useMemo(() => readTagCatalog(), [tags, open]);

  const availableCatalog = catalog.filter(
    (name) => !tags.some((t) => tagDedupeKeyLocal(t) === tagDedupeKeyLocal(name)),
  );

  function addTag(name: string) {
    const trimmed = addTagToCatalog(name);
    if (!trimmed) return;
    if (tags.some((t) => tagDedupeKeyLocal(t) === tagDedupeKeyLocal(trimmed))) return;
    onChange([...tags, trimmed]);
    setNewTag("");
  }

  function removeTag(name: string) {
    onChange(tags.filter((t) => tagDedupeKeyLocal(t) !== tagDedupeKeyLocal(name)));
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <TagList tags={tags} onRemove={removeTag} size="sm" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-medium text-[#1d4ed8] hover:underline"
        >
          {open ? "Hide tags" : "Manage tags"}
        </button>
        {open && (
          <TagEditorPanel
            newTag={newTag}
            setNewTag={setNewTag}
            availableCatalog={availableCatalog}
            onAdd={addTag}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TagList tags={tags} onRemove={removeTag} />
      <TagEditorPanel
        newTag={newTag}
        setNewTag={setNewTag}
        availableCatalog={availableCatalog}
        onAdd={addTag}
      />
    </div>
  );
}

function TagEditorPanel({
  newTag,
  setNewTag,
  availableCatalog,
  onAdd,
}: {
  newTag: string;
  setNewTag: (v: string) => void;
  availableCatalog: string[];
  onAdd: (name: string) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs font-medium text-slate-600">Add tag</p>
      <div className="flex gap-2">
        <Input
          label="New tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Type a tag name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd(newTag);
            }
          }}
        />
        <Button
          type="button"
          className="self-end shrink-0"
          disabled={!newTag.trim()}
          onClick={() => onAdd(newTag)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {availableCatalog.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {availableCatalog.map((name) => (
            <button key={name} type="button" onClick={() => onAdd(name)}>
              <TagChip name={name} size="sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
