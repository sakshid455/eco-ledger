"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityIndicatorProps {
  label: string;
  status: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SecurityIndicator({ label, status, icon, className }: SecurityIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100", className)}>
      <div className="flex items-center gap-3">
        {icon || <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        <span className="text-xs font-bold text-slate-700">{label}</span>
      </div>
      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{status}</span>
    </div>
  );
}
