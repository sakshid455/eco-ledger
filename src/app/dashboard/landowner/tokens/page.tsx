"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layers, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Info, 
  Database, 
  Link as LinkIcon,
  Lock,
  FileKey,
  AlertTriangle,
  Fingerprint
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, limit, doc, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { ApiGateway } from "@/services/api-gateway";

/**
 * @fileOverview Token Minting Terminal
 * Institutional terminal for minting investment units or carbon credits.
 * Data is authorized via API Gateway and cryptographically signed.
 */
export default function TokenIssuancePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedParcelId, setSelectedParcelId] = useState<string>("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [tokenType, setTokenType] = useState<"investment" | "carbon">("investment");
  const [privateKey, setPrivateKey] = useState("");

  const [formData, setFormData] = useState({
    symbol: "",
    totalUnits: "",
    unitValue: "",
  });

  const userDocRef = useMemoFirebase(() => (user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: profile } = useDoc(userDocRef);

  // Fetch all user lands
  const parcelsRef = useMemoFirebase(() => 
    user ? query(collection(db, "lands"), where("ownerId", "==", user.uid)) : null
  , [db, user]);
  const { data: parcels, isLoading: isLoadingParcels } = useCollection(parcelsRef);

  const selectedParcel = parcels?.find(p => p.id === selectedParcelId);
  const isApproved = selectedParcel?.status === "APPROVED";

  const merkleRootsRef = useMemoFirebase(() => query(collection(db, "merkleTreeRoots"), limit(1)), [db]);
  const { data: merkleRoots } = useCollection(merkleRootsRef);

  const latestMerkleRoot = merkleRoots?.[0]?.rootHash || "f29567c30985223e7f9188448b1110e53a5a73e5a59f5";

  // Fetch issued tokens
  const invTokensRef = useMemoFirebase(() => collection(db, "investments"), [db]);
  const carbTokensRef = useMemoFirebase(() => collection(db, "carbon_credits"), [db]);
  const { data: invTokens } = useCollection(invTokensRef);
  const { data: carbTokens } = useCollection(carbTokensRef);

  const myTokens = useMemo(() => {
    const inv = invTokens?.filter(t => t.landownerId === user?.uid) || [];
    const carb = carbTokens?.filter(t => t.landownerId === user?.uid) || [];
    return [...inv, ...carb].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [invTokens, carbTokens, user]);

  const handleIssueTokens = async () => {
    if (!user || !db || !selectedParcel || !privateKey || !profile) return;
    if (!isApproved) {
      toast({ variant: "destructive", title: "Protocol Violation", description: "Only assets with APPROVED status can anchor tokens to the ledger." });
      return;
    }
    
    setIsIssuing(true);

    try {
      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('ISSUE_TOKENS', {
        parcelId: selectedParcelId,
        tokenType,
        symbol: formData.symbol,
        totalUnits: formData.totalUnits,
        unitValue: formData.unitValue,
        privateKey,
        publicIdentity: profile.publicKey
      });

      toast({
        title: "Minting Success",
        description: `Token symbol ${formData.symbol} has been signed and anchored to the ledger.`,
      });

      setFormData({ symbol: "", totalUnits: "", unitValue: "" });
      setPrivateKey("");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Issuance Error", 
        description: error.message || "The gateway rejected the minting request." 
      });
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary shrink-0">Token Minting Terminal</h1>
          <p className="text-muted-foreground mt-1">Institutional protocol for ecological asset tokenization and ledger anchoring.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Network Node Active</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg font-headline font-bold">Asset Selection</CardTitle>
              <CardDescription className="text-xs">Choose a verified land parcel to tokenize.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Parcel</Label>
                <Select value={selectedParcelId} onValueChange={setSelectedParcelId}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder={isLoadingParcels ? "Syncing ledger..." : "Select land asset"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {parcels?.map((parcel) => (
                      <SelectItem key={parcel.id} value={parcel.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{parcel.name}</span>
                          <Badge variant="outline" className={`text-[8px] font-bold uppercase ${parcel.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {parcel.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!isApproved && selectedParcelId && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                    This asset status is <strong>{selectedParcel?.status}</strong>. The network protocol restricts token minting to institutional-approved assets only.
                  </p>
                </div>
              )}

              <div className="bg-slate-900 text-white p-5 rounded-2xl overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
                    <Database className="w-3 h-3" /> Ledger Consensus Root
                  </div>
                  <p className="text-[10px] font-mono break-all text-slate-300 leading-relaxed">{latestMerkleRoot}</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-amber-50 border-b">
              <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                <FileKey className="w-5 h-5 text-amber-600" /> Signing Authority
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">RSA Private Key (.PEM)</Label>
                <Textarea 
                  placeholder="-----BEGIN PRIVATE KEY-----" 
                  className="font-mono text-[10px] min-h-[120px] bg-slate-50 border-slate-200 rounded-xl"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <p className="text-[9px] text-slate-400 italic px-1">Required to sign the token issuance transaction hash.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
            <Tabs defaultValue="investment" onValueChange={(v) => setTokenType(v as any)}>
              <CardHeader className="border-b bg-white flex flex-row items-center justify-between px-6 py-4">
                <CardTitle className="text-lg font-headline font-bold">Asset Specifications</CardTitle>
                <TabsList className="bg-slate-100 p-1 rounded-xl h-10">
                  <TabsTrigger value="investment" className="rounded-lg font-bold px-6">Investment</TabsTrigger>
                  <TabsTrigger value="carbon" className="rounded-lg font-bold px-6">Carbon</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Token Symbol</Label>
                      <Input placeholder="e.g. ECO-FOREST-01" className="rounded-xl h-12 uppercase font-bold" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Total Supply (Units/MT)</Label>
                      <Input type="number" className="rounded-xl h-12 font-bold" value={formData.totalUnits} onChange={(e) => setFormData({...formData, totalUnits: e.target.value})} />
                    </div>
                    {tokenType === 'investment' && (
                      <div className="grid gap-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                          Unit Price (₹) <Lock className="w-3 h-3 text-primary" />
                        </Label>
                        <Input type="number" className="rounded-xl h-12 font-bold" value={formData.unitValue} onChange={(e) => setFormData({...formData, unitValue: e.target.value})} />
                      </div>
                    )}
                    <Button 
                      onClick={handleIssueTokens}
                      disabled={!selectedParcelId || !isApproved || !formData.symbol || !formData.totalUnits || !privateKey || isIssuing}
                      className="w-full h-14 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
                    >
                      {isIssuing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5 mr-2" /> Sign & Mint Asset</>}
                    </Button>
                  </div>
                  
                  <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-center text-center space-y-4">
                    <div className="mx-auto p-4 bg-white rounded-2xl shadow-sm">
                      <Fingerprint className="w-10 h-10 text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">API Gateway Logic</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                      Token data is validated against your institutional identity and signed with your private key before being anchored to the global ledger.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Tabs>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-headline font-bold flex items-center gap-2 text-slate-800">
              <LinkIcon className="w-5 h-5 text-primary" /> Issued Asset Ledger
            </h3>
            <div className="grid gap-4">
              {myTokens.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed rounded-[2rem] bg-white text-muted-foreground italic">
                  <Database className="w-10 h-10 mx-auto mb-4 opacity-10" />
                  <p>No tokens issued by this node yet.</p>
                </div>
              ) : myTokens.map((token) => (
                <Card key={token.id} className="border-none shadow-sm rounded-2xl bg-white ring-1 ring-slate-100 p-6 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary transition-colors">
                        <Layers className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-slate-900">{token.symbol}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] font-mono text-slate-400 uppercase">{token.id}</p>
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] font-bold h-5">
                            {token.amount.toLocaleString()} {token.unitValue ? 'Units' : 'MT'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Status</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Signed & Anchored</p>
                      </div>
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
