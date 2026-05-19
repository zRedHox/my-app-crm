import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function FormSection({ title, description, icon: Icon, children }: FormSectionProps) {
  return (
    <Card>
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1d4ed8]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}
