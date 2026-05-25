"use client";

import { useState } from "react";

interface AvatarProps {
  initials: string;
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  initials,
  src,
  alt = "",
  size = "md",
  className = "",
}: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(src?.trim()) && !imgFailed;

  if (showImage && src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- LINE CDN URLs; no domain allowlist needed
      <img
        src={src}
        alt={alt || initials}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`shrink-0 rounded-full object-cover bg-slate-100 ${sizeMap[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] font-semibold text-white ${sizeMap[size]} ${className}`}
      aria-hidden={!alt}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
