"use client";

import { ShieldCheck, Zap, Fingerprint, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  type: 'rsa' | 'sha' | 'merkle' | 'ai';
  className?: string;
}

export function VerificationBadge({ type, className }: VerificationBadgeProps) {
  const configs = {
    rsa: { icon: <Lock className="w-3 h-3" />, text: "RSA-4096 SIGNED", style: "bg-blue-50 text-blue-700" },
    sha: { icon: <ShieldCheck className="w-3 h-3" />, text: "SHA-256 VERIFIED", style: "bg-emerald-50 text-emerald-700" },
    merkle: { icon: <Fingerprint className="w-3 h-3" />, text: "MERKLE PROOF", style: "bg-primary/10 text-primary" },
    ai: { icon: <Zap className="w-3 h-3" />, text: "AI AUDITED", style: "bg-amber-50 text-amber-700" },
  };

  const config = configs[type];

  return (
    <Badge className={cn(
      "border-none font-bold px-2 py-1 text-[9px] flex items-center gap-1 shadow-sm",
      config.style,
      className
    )}>
      {config.icon}
      {config.text}
    </Badge>
  );
}
