"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <Card className={cn(
      "border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[1.5rem] overflow-hidden bg-white ring-1 ring-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group",
      className
    )}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3.5 bg-slate-50 rounded-2xl group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-500 text-primary">
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
              trendUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}>
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-[1.75rem] font-headline font-bold text-slate-900 leading-none">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}