interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ initials, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] font-semibold text-white ${sizeMap[size]} ${className}`}
      aria-hidden
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
