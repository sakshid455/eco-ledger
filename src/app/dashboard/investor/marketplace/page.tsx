
/**
 * @fileOverview Institutional Eco Marketplace
 * Enables investors to discover verified lands and acquire fractional investment tokens.
 */
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  Loader2, 
  ShieldCheck, 
  Leaf,
  Info,
  Globe,
  Ruler,
  Calendar,
  Lock,
  FileKey,
  ShieldAlert,
  Zap,
  TrendingUp,
  Coins,
  AlertCircle,
  Database,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiGateway } from "@/services/api-gateway";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewingLand, setViewingLand] = useState<any>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  
  // Investment State
  const [signingToken, setSigningToken] = useState<any>(null);
  const [investingLand, setInvestingLand] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState("10");
  const [privateKey, setPrivateKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch APPROVED lands
  const landsQuery = useMemoFirebase(() => 
    db ? query(collection(db, "lands"), where("status", "==", "APPROVED")) : null
  , [db]);
  const { data: lands, isLoading: isLoadingLands, error: landsError } = useCollection(landsQuery);

  // 2. Fetch active investment tokens to link with lands
  const tokensQuery = useMemoFirebase(() => 
    db ? collection(db, "investments") : null
  , [db]);
  const { data: tokens } = useCollection(tokensQuery);

  const filteredLands = useMemo(() => {
    return lands?.filter(l => {
      const matchesSearch = 
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || 
        l.vegetation?.toLowerCase().includes(filterType.toLowerCase());

      return matchesSearch && matchesType;
    }) || [];
  }, [lands, searchTerm, filterType]);

  const handleInvestInitiate = (land: any) => {
    const token = tokens?.find(t => t.landId === land.id);
    
    if (!token) {
      toast({
        variant: "destructive",
        title: "No Tokens Available",
        description: "The landowner has not yet issued investment units for this verified parcel."
      });
      return;
    }

    setInvestingLand(land);
    setSigningToken(token);
  };

  const handleInvestConfirm = async () => {
    if (!user || !signingToken || !privateKey) return;
    setIsProcessing(true);

    try {
      const gateway = new ApiGateway(db, user.uid);
      const unitPrice = 1250; 

      await gateway.dispatch('SETTLE_TRANSACTION', {
        token: signingToken,
        price: unitPrice,
        amount: parseFloat(investAmount),
        tokenType: 'InvestmentToken',
        privateKey
      });

      toast({
        title: "Investment Successful",
        description: `Acquired ${investAmount} units of ${signingToken.symbol}. Transaction anchored to ledger.`,
      });
      
      setSigningToken(null);
      setInvestingLand(null);
      setPrivateKey("");
      setInvestAmount("10");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Settlement Error", 
        description: error.message || "Failed to finalize investment transaction." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBootstrapApproved = async () => {
    if (!user) return;
    setIsBootstrapping(true);
    try {
      const gateway = new ApiGateway(db, user.uid);
      
      // Seed several approved assets for the marketplace
      const seeds = [
        { name: "Amazonia Alpha Reserve", location: "Manaus, Brazil", area: "1250", vegetation: "Forest", soilType: "Clay", status: "APPROVED" },
        { name: "Kerala Highland Mangroves", location: "Kochi, India", area: "450", vegetation: "Wetland", soilType: "Peat", status: "APPROVED" },
        { name: "Evergreen Boreal Tract", location: "Alberta, Canada", area: "2100", vegetation: "Forest", soilType: "Loam", status: "APPROVED" }
      ];

      for (const seed of seeds) {
        await gateway.dispatch('REGISTER_LAND', {
          ...seed,
          surveyNumber: "SEED-" + Math.floor(Math.random() * 10000)
        });
      }

      toast({ 
        title: "Registry Initialized", 
        description: "Institutional assets anchored directly to the marketplace." 
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Protocol Error", description: error.message });
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900">Eco Marketplace</h1>
          <p className="text-muted-foreground mt-1">Discover verified ecological assets and participate in green growth.</p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-2 px-4 font-bold flex items-center gap-2 w-fit">
          <ShieldCheck className="w-4 h-4" /> Institutional Verified
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 bg-white p-3 rounded-2xl shadow-sm border ring-1 ring-slate-100">
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search lands or locations..." 
            className="pl-10 h-12 border-none bg-slate-50 focus-visible:ring-1 focus-visible:ring-primary/20" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="lg:col-span-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-12 border-slate-100 bg-slate-50 rounded-xl focus:ring-1 focus:ring-primary/20">
              <SelectValue placeholder="All Project Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Ecosystems</SelectItem>
              <SelectItem value="forest">Forestry</SelectItem>
              <SelectItem value="wetland">Wetlands</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {landsError && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 items-start animate-in zoom-in-95">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="space-y-2">
            <h3 className="font-bold text-rose-900">Ledger Access Error</h3>
            <p className="text-sm text-rose-800 opacity-80 leading-relaxed">
              The network node could not retrieve the verified registry. This is usually due to a building database index.
            </p>
            <p className="text-[10px] font-mono bg-white/50 p-2 rounded-lg border border-rose-200">
              {landsError.message}
            </p>
          </div>
        </div>
      )}

      {isLoadingLands ? (
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary opacity-20 w-10 h-10" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Syncing Registry...</p>
          </div>
        </div>
      ) : !landsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLands.map((land) => {
            const token = tokens?.find(t => t.landId === land.id);
            const hasToken = !!token;
            
            return (
              <Card key={land.id} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-500 bg-white ring-1 ring-slate-100 flex flex-col group">
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <Image 
                    src={land.images?.[0] || `https://picsum.photos/seed/${land.id}/600/400`} 
                    alt={land.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                    data-ai-hint="nature land"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-primary font-bold text-[9px] uppercase border-none px-3 py-1 shadow-sm">
                      {land.vegetation}
                    </Badge>
                  </div>
                  {hasToken && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-emerald-500 text-white font-bold text-[9px] uppercase border-none px-3 py-1 flex items-center gap-1 shadow-lg">
                        <Zap className="w-2.5 h-2.5" /> Tokens Active
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="space-y-1 mb-6">
                    <h3 className="text-xl font-headline font-bold text-slate-900 leading-tight">{land.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Globe className="w-3 h-3" /> {land.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project Scale</p>
                      <p className="text-xs font-bold text-slate-700">{land.area} {land.areaUnit}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Soil Type</p>
                      <p className="text-xs font-bold text-slate-700 uppercase">{land.soilType}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Button onClick={() => setViewingLand(land)} variant="outline" className="flex-1 rounded-xl h-12 font-bold border-slate-200">Details</Button>
                    <Button 
                      onClick={() => handleInvestInitiate(land)}
                      className="flex-[1.5] rounded-xl h-12 font-bold bg-primary text-white shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95 shadow-lg"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" /> Invest Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredLands.length === 0 && (
            <div className="col-span-full h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="p-6 bg-slate-50 rounded-full mb-6">
                <Database className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-xl font-headline font-bold text-slate-800">No verified assets found</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
                Approved ecological assets will appear here once they pass institutional verification.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Button 
                  onClick={handleBootstrapApproved} 
                  disabled={isBootstrapping}
                  variant="outline" 
                  className="rounded-xl font-bold h-11 px-8 border-slate-200"
                >
                  {isBootstrapping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Initialize Verified Registry
                </Button>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Protocol Seeding Engine</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Detail Sheet */}
      <Sheet open={!!viewingLand} onOpenChange={() => setViewingLand(null)}>
        <SheetContent side="right" className="sm:max-w-xl bg-slate-50 p-0 border-none shadow-2xl overflow-y-auto">
          <SheetHeader className="p-12 bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <Badge className="bg-primary/20 text-primary border-none mb-4 font-bold text-[10px] uppercase tracking-[0.2em]">Institutional Asset</Badge>
              <SheetTitle className="text-white text-4xl font-headline font-bold leading-tight">{viewingLand?.name}</SheetTitle>
              <SheetDescription className="text-slate-400 mt-3 font-medium flex items-center gap-2">
                <Globe className="w-4 h-4" /> {viewingLand?.location}
              </SheetDescription>
            </div>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          </SheetHeader>
          {viewingLand && (
            <div className="px-10 py-12 space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <DetailInfo icon={<Ruler className="w-4 h-4" />} label="Project Scale" value={`${viewingLand.area} ${viewingLand.areaUnit}`} />
                <DetailInfo icon={<Calendar className="w-4 h-4" />} label="Verified Date" value={viewingLand.verifiedAt?.toDate().toLocaleDateString() || "Pending"} />
                <DetailInfo icon={<ShieldCheck className="w-4 h-4" />} label="Integrity" value="SHA-256 Hashed" />
                <DetailInfo icon={<Leaf className="w-4 h-4" />} label="Ecosystem" value={viewingLand.vegetation} />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Project Integrity Proof
                </h4>
                <div className="p-5 bg-white rounded-2xl border shadow-sm font-mono text-[10px] break-all text-slate-500 leading-relaxed">
                  {viewingLand.integrityHash}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => {
                    handleInvestInitiate(viewingLand);
                    setViewingLand(null);
                  }}
                  className="w-full h-16 rounded-2xl font-bold text-lg bg-primary shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  <TrendingUp className="w-5 h-5 mr-3" /> Acquire Investment Units
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Investment Settlement Dialog */}
      <Dialog open={!!signingToken} onOpenChange={() => !isProcessing && setSigningToken(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
                <Coins className="text-primary w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-headline font-bold">Settlement Authority</DialogTitle>
              <DialogDescription className="text-slate-400 mt-2">
                Acquiring investment units for <span className="text-white font-bold">{investingLand?.name}</span>
              </DialogDescription>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Investment Amount</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={investAmount} 
                    onChange={(e) => setInvestAmount(e.target.value)} 
                    className="rounded-xl h-12 font-bold pr-12 border-slate-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Units</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Market Rate</Label>
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-700">
                  ₹1,250 <span className="text-[9px] text-slate-400 font-bold uppercase ml-2">/ Unit</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <FileKey className="w-3.5 h-3.5 text-amber-600" /> RSA Private Key (.PEM)
              </Label>
              <Textarea 
                placeholder="-----BEGIN PRIVATE KEY-----" 
                className="font-mono text-[10px] min-h-[120px] bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary/20"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
              <p className="text-[9px] text-slate-400 italic px-1">This key is required to sign the Gateway settlement hash for non-repudiation.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                Settlement will generate a unique Merkle proof. This action is immutable once anchored to the network ledger.
              </p>
            </div>
          </div>

          <DialogFooter className="px-8 pb-8 flex gap-3">
            <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setSigningToken(null)}>Abort</Button>
            <Button 
              className="flex-[2] h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all active:scale-95"
              onClick={handleInvestConfirm}
              disabled={!privateKey || !investAmount || parseFloat(investAmount) <= 0 || isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign & Settle via Gateway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailInfo({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm space-y-1">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[9px] font-bold uppercase text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
