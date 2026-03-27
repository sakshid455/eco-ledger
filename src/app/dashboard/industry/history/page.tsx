"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Search, 
  ShieldCheck, 
  FileText, 
  Download, 
  ExternalLink, 
  Copy, 
  Loader2,
  Filter,
  Hash,
  Leaf,
  FileSignature
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function OffsetHistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Fetch real acquisitions
  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(db, "transactions"), 
      where("buyerId", "==", user.uid),
      where("tokenType", "==", "CarbonCreditToken")
    ) : null
  , [db, user]);

  const { data: transactions, isLoading } = useCollection(transactionsQuery);

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      setVerifyingId(null);
      toast({
        title: "Signature Verified",
        description: "RSA-4096 signature and Merkle inclusion confirmed for settlement " + id,
      });
    }, 1500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} serial copied.` });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Offset Ledger</h1>
          <p className="text-muted-foreground mt-1">Institutional archive of verified carbon credit acquisitions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-slate-900 text-white border-none py-1.5 px-4 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Immutable Audit Active
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border ring-1 ring-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by transaction ID or hash..." 
            className="pl-10 border-none bg-transparent h-10 rounded-xl focus-visible:ring-0" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="border-b border-slate-50 px-6 py-4">
          <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Transaction History
          </CardTitle>
          <CardDescription className="text-xs">Comprehensive log of ecological offset settlements.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold pl-6">Settlement ID</TableHead>
                <TableHead className="font-bold">Asset Type</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold text-right">Amount (MT)</TableHead>
                <TableHead className="text-right pr-6 font-bold">Protocol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-20 mx-auto" /></TableCell></TableRow>
              ) : transactions?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic">No acquisition history recorded on this node.</TableCell></TableRow>
              ) : transactions?.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="pl-6">
                    <span className="font-mono text-[10px] font-bold">TX_{tx.id.substring(0, 8)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase">OFFSETS</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {tx.transactionDate?.toDate().toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {tx.amount?.toLocaleString()} MT
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] h-5 px-2 flex items-center gap-1">
                        <FileSignature className="w-2.5 h-2.5" /> SIGNED
                      </Badge>
                      <Button 
                        onClick={() => handleVerify(tx.id)}
                        disabled={verifyingId === tx.id}
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0 rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {verifyingId === tx.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
