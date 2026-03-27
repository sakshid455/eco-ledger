"use client";

import { Hash, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HashBoxProps {
  hash: string;
  label?: string;
  copyable?: boolean;
  className?: string;
  truncate?: boolean;
}

export function HashBox({ hash, label, copyable = true, className, truncate = true }: HashBoxProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast({ title: "Hash Copied", description: "Cryptographic signature copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group/hash", className)}>
      {label && <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight mb-1">{label}</p>}
      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 ring-offset-background focus-within:ring-1 focus-within:ring-primary/20">
        <Hash className="w-3 h-3 text-primary shrink-0" />
        <span className={cn(
          "text-[10px] font-mono text-slate-600 leading-none",
          truncate && "truncate max-w-[120px]"
        )}>
          {hash}
        </span>
        {copyable && (
          <button 
            onClick={handleCopy}
            className="ml-auto opacity-0 group-hover/hash:opacity-100 transition-opacity p-1 hover:bg-white rounded"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        )}
      </div>
    </div>
  );
}
