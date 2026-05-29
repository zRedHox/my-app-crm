"use client";

import { X } from "lucide-react";
import { tagColorStyle } from "@/lib/tags/colors";

interface TagChipProps {
  name: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function TagChip({ name, onRemove, size = "md" }: TagChipProps) {
  const style = tagColorStyle(name);
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const padding = size === "sm" ? "px-1.5 py-0" : "px-2 py-0.5";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-0.5 rounded-full border font-medium ${textSize} ${padding}`}
      style={style}
      title={name}
    >
      <span className="truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full p-0.5 opacity-70 hover:opacity-100"
          aria-label={`Remove tag ${name}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
