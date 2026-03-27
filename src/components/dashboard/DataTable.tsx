"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  headers: string[];
  isLoading?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ headers, isLoading, emptyMessage = "No records found.", children, className }: DataTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto custom-scrollbar", className)}>
      <div className="inline-block min-w-full align-middle">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              {headers.map((header, i) => (
                <TableHead 
                  key={header} 
                  className={cn(
                    "font-bold uppercase text-[10px] tracking-widest text-muted-foreground py-4 whitespace-nowrap",
                    i === 0 && "pl-6",
                    i === headers.length - 1 && "text-right pr-6"
                  )}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reading Ledger...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !children || (Array.isArray(children) && children.length === 0) ? (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-64 text-center text-muted-foreground italic">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
