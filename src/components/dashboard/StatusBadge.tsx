"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = 'Approved' | 'Pending' | 'Rejected' | 'Verified' | 'Issued' | 'Frozen' | 'Settled';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    Approved: "bg-emerald-100 text-emerald-700",
    Verified: "bg-emerald-100 text-emerald-700",
    Settled: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Frozen: "bg-amber-100 text-amber-700",
    Rejected: "bg-rose-100 text-rose-700",
    Issued: "bg-blue-100 text-blue-700",
  };

  return (
    <Badge className={cn(
      "hover:bg-opacity-80 border-none px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest",
      styles[status] || "bg-slate-100 text-slate-600",
      className
    )}>
      {status}
    </Badge>
  );
}
