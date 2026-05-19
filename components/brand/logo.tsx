import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 48, text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, href, className = "" }: LogoProps) {
  const { icon, text } = sizes[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="48" height="48" rx="12" fill="#1d4ed8" />
        <path
          d="M14 30V18h6.5c3.3 0 5.5 2 5.5 5s-2.2 5-5.5 5H18v2H14zm4-8h2.2c1.5 0 2.3-.8 2.3-2s-.8-2-2.3-2H18v4z"
          fill="white"
        />
        <path
          d="M26 30V18h8v3.5h-4V24h3.5v3H30v2.5H26z"
          fill="white"
          opacity="0.9"
        />
        <circle cx="38" cy="14" r="4" fill="#93c5fd" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-[#1d4ed8] ${text}`}>
            ecobz
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
            crm
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
