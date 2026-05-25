"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

export function LineSetupBanner() {
  const [info, setInfo] = useState<{
    webhook_url: string;
    status: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/line/webhook")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo(null));
  }, []);

  if (!info) return null;

  async function copyUrl() {
    if (!info?.webhook_url) return;
    await navigator.clipboard.writeText(info.webhook_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-4 rounded-xl border border-[#06C755]/30 bg-[#06C755]/5 px-4 py-3 text-sm">
      <p className="font-medium text-slate-800">LINE webhook (this app)</p>
      <p className="mt-1 text-xs text-slate-600">
        Paste this URL in LINE Developers → Messaging API → Webhook URL
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="flex-1 break-all rounded-lg bg-white px-2 py-1.5 text-xs text-slate-800">
          {info.webhook_url}
        </code>
        <button
          type="button"
          onClick={copyUrl}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            info.status === "ready"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {info.status === "ready" ? "Configured" : "Set .env.local"}
        </span>
      </div>
    </div>
  );
}
