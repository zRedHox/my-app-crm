"use client";

import { TagChip } from "@/components/tags/tag-chip";

interface TagListProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  size?: "sm" | "md";
  maxVisible?: number;
  className?: string;
}

export function TagList({
  tags,
  onRemove,
  size = "md",
  maxVisible,
  className = "",
}: TagListProps) {
  if (tags.length === 0) return null;

  const visible = maxVisible ? tags.slice(0, maxVisible) : tags;
  const overflow = maxVisible ? Math.max(0, tags.length - maxVisible) : 0;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visible.map((tag) => (
        <TagChip
          key={tag}
          name={tag}
          size={size}
          onRemove={onRemove ? () => onRemove(tag) : undefined}
        />
      ))}
      {overflow > 0 && (
        <span className={`self-center text-slate-400 ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
          +{overflow}
        </span>
      )}
    </div>
  );
}
