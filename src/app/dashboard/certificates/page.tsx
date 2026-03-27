
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Globe, 
  Lock, 
  Hash, 
  Eye, 
  Cpu, 
  Database, 
  Search,
  AlertTriangle 
} from "lucide-react";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { verifySignature } from "@/lib/crypto";

/**
 * @fileOverview Compliance Hub
 * Provides tools for institutional verification of document integrity and authority signatures.
 */
export default function ComplianceHubPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [valData, setValData] = useState("");
  const [valSig, setValSig] = useState("");
  const [valPub, setValPub] = useState("");
  const [valResult, setValResult] = useState<"none" | "valid" | "invalid">("none");
  const [isValidating, setIsValidating] = useState(false);

  const userDocRef = useMemoFirebase(() => (user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userDocRef);

  // Fetch verified lands (APPROVED only)
  const landsQuery = useMemoFirebase(() => 
    db ? query(collection(db, "lands"), where("status", "==", "APPROVED")) : null
  , [db]);
  const { data: verifiedLands, isLoading: isLoadingLands, error: landsError } = useCollection(landsQuery);

  const filteredLands = verifiedLands?.filter(land => 
    (land.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (land.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (land.location?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  const handleManualValidation = async () => {
    if (!valData || !valSig || !valPub) {
      toast({ variant: "destructive", title: "Missing Data", description: "All three cryptographic fields are required." });
      return;
    }
    
    setIsValidating(true);
    setValResult("none");

    try {
      const isValid = await verifySignature(valData, valSig, valPub);
      setValResult(isValid ? "valid" : "invalid");
      
      toast({
        variant: isValid ? "default" : "destructive",
        title: isValid ? "Proof Authenticated" : "Verification Failed",
        description: isValid 
          ? "RSA-4096 signature matches authority credentials. The asset integrity is confirmed." 
          : "Cryptographic mismatch detected. The signature or data has been tampered with.",
      });
    } catch (e: any) {
      setValResult("invalid");
      toast({ variant: "destructive", title: "Protocol Error", description: "Invalid key or signature format." });
    } finally {
      setIsValidating(false);
    }
  };

  const loadLandForVerification = (land: any) => {
    setValData(land.integrityHash || "");
    setValSig(land.authoritySignature || "");
    setValPub(land.authorityPublicKey || "");
    setValResult("none");
    toast({ title: "Audit Metadata Loaded", description: "Document hash and signatures pre-filled." });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Compliance Hub</h1>
          <p className="text-muted-foreground mt-1">Institutional verification of document integrity and authority signatures.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 py-1.5 px-4 font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> RSA-4096 Protocol Active
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-[2rem] bg-slate-900 text-white overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10">
              <CardTitle className="text-lg font-headline font-bold">Authenticity Tool</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500">Document Hash (SHA-256)</Label>
                <Input value={valData} onChange={(e) => setValData(e.target.value)} className="bg-white/5 border-white/10 rounded-xl font-mono text-[10px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500">Digital Signature (RSA-4096)</Label>
                <Textarea value={valSig} onChange={(e) => setValSig(e.target.value)} className="bg-white/5 border-white/10 rounded-xl min-h-[80px] font-mono text-[10px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold uppercase text-slate-500">Authority Public Key (RSA)</Label>
                <Textarea value={valPub} onChange={(e) => setValPub(e.target.value)} className="bg-white/5 border-white/10 rounded-xl min-h-[80px] font-mono text-[10px]" />
              </div>
              
              {valResult !== "none" && (
                <div className={`p-5 rounded-2xl flex items-center gap-4 border animate-in zoom-in-95 ${valResult === 'valid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {valResult === 'valid' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  <div>
                    <span className="text-sm font-bold uppercase tracking-widest block">{valResult === 'valid' ? 'Signature Valid' : 'Invalid Proof'}</span>
                    <p className="text-[10px] opacity-70 mt-0.5">{valResult === 'valid' ? 'The state is mathematically proven.' : 'Verification failed protocol check.'}</p>
                  </div>
                </div>
              )}

              <Button onClick={handleManualValidation} disabled={isValidating} className="w-full h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-lg transition-all active:scale-95">
                {isValidating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />} 
                Verify RSA Proof
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white ring-1 ring-slate-100 rounded-[2rem] overflow-hidden shadow-sm h-full min-h-[600px]">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-headline font-bold">Network Authority Registry</CardTitle>
                  <CardDescription>Verified land assets with anchored cryptographic proofs.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search verified registry..." 
                    className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-1 focus-visible:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {landsError && (
                <div className="p-10 m-8 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 items-start animate-in zoom-in-95">
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-rose-900 text-lg">Ledger Access Error</h3>
                    <p className="text-sm text-rose-800 opacity-80 leading-relaxed">
                      The network node could not retrieve the verified registry. This is usually due to a building database index.
                    </p>
                    <p className="text-[10px] font-mono bg-white/50 p-3 rounded-xl border border-rose-200 break-all">
                      {landsError.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-50">
                {isLoadingLands ? (
                  <div className="flex justify-center py-32">
                    <Loader2 className="animate-spin text-primary opacity-20 w-10 h-10" />
                  </div>
                ) : filteredLands.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-slate-400 italic">
                    <Database className="w-12 h-12 mb-4 opacity-10" />
                    <p>{searchTerm ? "No matching assets found." : "No verified assets found in registry."}</p>
                  </div>
                ) : (
                  filteredLands.map((land) => (
                    <div key={land.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                      <div className="flex items-center justify-between gap-6">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h5 className="font-bold text-xl text-slate-900">{land.name}</h5>
                            {land.authoritySignature ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-none text-[9px] h-5 px-2 font-bold">SIGNED</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] h-5 px-2 font-bold text-slate-400 border-slate-200">PENDING SIGNATURE</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-y-2 gap-x-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                              <Hash className="w-3 h-3" /> {land.id.substring(0, 16)}...
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                              <Globe className="w-3 h-3" /> {land.location}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl font-bold h-12 px-6 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95"
                          onClick={() => loadLandForVerification(land)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> Extract Proof
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
