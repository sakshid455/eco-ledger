
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Loader2, 
  ShieldCheck, 
  Search,
  Zap,
  BarChart3,
  Edit3,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  Hash
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ApiGateway } from "@/services/api-gateway";

export default function CarbonVerificationPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [verifiedTonnes, setVerifiedTonnes] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const userDocRef = useMemoFirebase(() => (user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';
  
  const estimatesQuery = useMemoFirebase(() => 
    (db && isAdmin) ? query(collection(db, "carbon_estimates"), where("status", "==", "CALCULATED")) : null
  , [db, isAdmin]);

  const { data: estimates, isLoading: isLoadingEstimates } = useCollection(estimatesQuery);

  const handleApprove = async () => {
    if (!selectedEstimate || !verifiedTonnes || !user) return;
    setIsProcessing(true);

    try {
      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('VERIFY_CARBON', {
        estimateId: selectedEstimate.id,
        verifiedTonnes: parseFloat(verifiedTonnes),
        notes: adminNotes
      });

      toast({ title: "Estimate Verified", description: `Successfully verified ${verifiedTonnes} tonnes.` });
      setSelectedEstimate(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Protocol Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEstimates = estimates?.filter(e => 
    e.landParcelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin && profile) return <div className="p-20 text-center">Admin Access Required</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Carbon Verification</h1>
          <p className="text-muted-foreground mt-1">Review AI sequestration estimates and commit verified data.</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1.5 px-4 font-bold flex items-center gap-2 w-fit">
          <Zap className="w-4 h-4" /> AI Engine Active
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border ring-1 ring-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search estimates..." className="pl-10 border-none bg-transparent h-10 rounded-xl focus-visible:ring-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold pl-6">Estimate ID</TableHead>
                <TableHead className="font-bold">Parcel Reference</TableHead>
                <TableHead className="font-bold">AI Estimate (MT)</TableHead>
                <TableHead className="text-right pr-6 font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingEstimates ? (
                <TableRow><TableCell colSpan={4} className="h-64 text-center"><Loader2 className="animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
              ) : filteredEstimates?.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-64 text-center text-muted-foreground italic">No estimates pending review.</TableCell></TableRow>
              ) : filteredEstimates?.map((est) => (
                <TableRow key={est.id}>
                  <TableCell className="font-mono text-[10px] font-bold pl-6">EST_{est.id.substring(0, 8)}</TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{est.landParcelId}</TableCell>
                  <TableCell className="font-bold text-primary">{est.estimatedCarbonTonnes} MT</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button onClick={() => { setSelectedEstimate(est); setVerifiedTonnes(est.estimatedCarbonTonnes.toString()); }} className="rounded-xl font-bold h-9">
                      Verify Data
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedEstimate} onOpenChange={() => setSelectedEstimate(null)}>
        <SheetContent side="right" className="sm:max-w-2xl p-0 border-none shadow-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Carbon Verification Details</SheetTitle>
            <SheetDescription>Detailed analysis and verification controls.</SheetDescription>
          </SheetHeader>
          {selectedEstimate && (
            <div className="flex flex-col h-full bg-slate-50">
              <div className="bg-slate-900 p-10 text-white relative">
                <Badge className="bg-primary/20 text-primary border-none mb-4 font-bold text-[10px] uppercase tracking-widest">Carbon Audit Session</Badge>
                <h2 className="text-3xl font-headline font-bold">Verification Detail</h2>
                <p className="text-slate-400 text-sm mt-2">ID: {selectedEstimate.id}</p>
              </div>

              <div className="flex-1 px-8 py-10 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Verified Carbon Tonnes</Label>
                  <Input type="number" value={verifiedTonnes} onChange={(e) => setVerifiedTonnes(e.target.value)} className="rounded-xl h-12 text-lg font-bold" />
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Admin Notes</Label>
                  <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="rounded-xl min-h-[100px]" placeholder="Enter audit findings..." />
                </div>
                <Button onClick={handleApprove} disabled={isProcessing} className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl">
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="mr-2" /> Dispatch & Secure Verification</>}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
