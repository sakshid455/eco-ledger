
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  FileSearch, 
  Loader2, 
  ShieldCheck, 
  Search,
  Database,
  RefreshCw,
  Server,
  AlertCircle,
  Lock,
  FileKey,
  Hash,
  AlertTriangle
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ApiGateway } from "@/services/api-gateway";

export default function VerificationQueuePage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [adminPrivateKey, setAdminPrivateKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const userDocRef = useMemoFirebase(() => (user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userDocRef);
  const isAdmin = profile?.role === 'admin';
  
  const landsQuery = useMemoFirebase(() => 
    (db && isAdmin) ? query(
      collection(db, "lands"), 
      where("status", "==", "PENDING"),
      orderBy("createdAt", "desc")
    ) : null
  , [db, isAdmin]);

  const { data: lands, isLoading, error } = useCollection(landsQuery);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedLand || !user || !profile) return;
    if (status === 'APPROVED' && !adminPrivateKey) {
      toast({ variant: "destructive", title: "Signing Error", description: "RSA Private Key is required to sign the approval proof." });
      return;
    }

    setIsProcessing(true);
    try {
      const gateway = new ApiGateway(db, user.uid);
      
      await gateway.dispatch('VERIFY_LAND', {
        parcelId: selectedLand.id,
        landownerId: selectedLand.ownerId,
        status,
        notes: remarks || "Administrative verification completed.",
        privateKey: adminPrivateKey,
        authorityPublicKey: profile.publicKey
      });

      toast({ title: `Land ${status}`, description: `Asset status updated and signed using RSA-4096.` });
      setSelectedLand(null);
      setRemarks("");
      setAdminPrivateKey("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBootstrap = async () => {
    if (!user) return;
    setIsBootstrapping(true);
    try {
      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('REGISTER_LAND', {
        name: "Eco Highland Reserve",
        location: "Pune, Maharashtra",
        area: "12",
        surveyNumber: "VHR-" + Math.floor(1000 + Math.random() * 9000),
        soilType: "Black Soil",
        vegetation: "Evergreen Forest",
        latitude: "18.52",
        longitude: "73.85"
      });

      toast({ title: "Bootstrap Success", description: "Sample pending asset added to the network." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsBootstrapping(false);
    }
  };

  const filteredLands = lands?.filter(land => 
    (land.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (land.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (land.ownerId?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  if (!isAdmin && profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <ShieldCheck className="w-12 h-12 text-destructive opacity-20" />
        <h2 className="text-xl font-headline font-bold">Admin Required</h2>
        <p className="text-sm text-muted-foreground">Only system administrators can verify land assets.</p>
        <Link href="/"><Button variant="outline" className="mt-4 rounded-xl">Return Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Verification Hub</h1>
          <p className="text-muted-foreground mt-1">Institutional review of pending land registrations (Newest First).</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleBootstrap} 
            disabled={isBootstrapping}
            variant="outline" 
            className="rounded-xl font-bold h-11 px-6 bg-white"
          >
            {isBootstrapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Bootstrap Pending Data
          </Button>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1.5 px-4 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Authority Active
          </Badge>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border ring-1 ring-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Land Name or Owner ID..." 
            className="pl-10 border-none bg-transparent h-10 rounded-xl focus-visible:ring-0" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="font-bold border-slate-200 h-8 px-4 bg-slate-50">
          {filteredLands.length} Pending Assets
        </Badge>
      </div>

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 items-start animate-in zoom-in-95">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="space-y-2">
            <h3 className="font-bold text-rose-900">Ledger Access Error</h3>
            <p className="text-sm text-rose-800 opacity-80 leading-relaxed">
              The network node could not retrieve the pending queue. This is usually due to a building database index.
            </p>
            <p className="text-[10px] font-mono bg-white/50 p-2 rounded-lg border border-rose-200">
              {error.message}
            </p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Scanning Ledger...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6 text-center px-12 opacity-50">
            <Database className="w-12 h-12 text-slate-200" />
            <p className="text-sm text-slate-400 italic">Unable to load registry during network synchronization.</p>
          </div>
        ) : filteredLands.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6 text-center px-12">
            <div className="p-6 bg-slate-50 rounded-full">
              <Database className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-xl font-headline font-bold text-slate-800">Queue is Clear</h3>
            <p className="text-sm text-muted-foreground">All land parcels have been processed.</p>
            {!error && (
              <Button onClick={handleBootstrap} className="rounded-xl font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none">
                Generate Sample Data
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold pl-6">Land Name</TableHead>
                <TableHead className="font-bold">Owner Node</TableHead>
                <TableHead className="font-bold">Area</TableHead>
                <TableHead className="text-right pr-6 font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLands.map((land) => (
                <TableRow key={land.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-bold pl-6 py-5">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-primary" />
                      <div>
                        <p>{land.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {land.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{land.ownerId?.substring(0, 16)}...</TableCell>
                  <TableCell className="text-sm font-medium">{land.area} {land.areaUnit}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button onClick={() => setSelectedLand(land)} className="rounded-xl font-bold h-9 bg-primary">
                      <FileSearch className="w-4 h-4 mr-2" /> Review Asset
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={!!selectedLand} onOpenChange={() => !isProcessing && setSelectedLand(null)}>
        <SheetContent side="right" className="sm:max-w-2xl bg-slate-50 p-0 border-none shadow-2xl overflow-y-auto">
          <SheetHeader className="p-10 bg-slate-900 text-white">
            <Badge className="bg-primary/20 text-primary border-none mb-4 font-bold text-[10px] uppercase tracking-widest">Authority Node</Badge>
            <SheetTitle className="text-white text-3xl font-headline font-bold">{selectedLand?.name}</SheetTitle>
            <SheetDescription className="text-slate-400 font-mono mt-2">Land ID: {selectedLand?.id}</SheetDescription>
          </SheetHeader>
          
          {selectedLand && (
            <div className="px-8 py-10 space-y-8">
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Integrity Verification
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl font-mono text-[10px] break-all border text-slate-500">
                  {selectedLand.integrityHash}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1 flex items-center gap-2">
                  <FileKey className="w-3 h-3 text-amber-600" /> Administrative Private Key
                </Label>
                <Textarea 
                  placeholder="-----BEGIN PRIVATE KEY-----" 
                  className="font-mono text-[10px] min-h-[120px] bg-white border-slate-200 rounded-xl focus-visible:ring-primary/20"
                  value={adminPrivateKey}
                  onChange={(e) => setAdminPrivateKey(e.target.value)}
                />
                <p className="text-[9px] text-slate-400 italic px-1">Required to sign the integrity hash for institutional approval.</p>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Admin Remarks</Label>
                <Textarea 
                  placeholder="Enter verification findings..." 
                  className="min-h-[100px] rounded-xl focus-visible:ring-primary/20"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 sticky bottom-0 bg-slate-50 pb-8">
                <Button 
                  variant="outline" 
                  className="h-14 rounded-2xl font-bold text-destructive" 
                  onClick={() => handleAction('REJECTED')} 
                  disabled={isProcessing}
                >
                  <XCircle className="w-5 h-5 mr-2" /> Reject Asset
                </Button>
                <Button 
                  className="h-14 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20" 
                  onClick={() => handleAction('APPROVED')} 
                  disabled={isProcessing || !adminPrivateKey}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Sign & Approve</>}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
