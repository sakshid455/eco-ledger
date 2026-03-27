"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ChartCard({ title, description, badge, children, className, contentClassName }: ChartCardProps) {
  return (
    <Card className={cn("border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-headline font-bold">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {badge}
      </CardHeader>
      <CardContent className={cn("h-[350px] mt-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
