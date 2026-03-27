
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wind, 
  ShieldCheck, 
  CheckCircle2, 
  ShoppingCart, 
  Loader2, 
  ExternalLink, 
  Target, 
  Zap, 
  TrendingUp,
  Info,
  ArrowRight,
  Plus,
  FileKey,
  ShieldAlert,
  BarChart3,
  LineChart as LineChartIcon,
  TrendingDown
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApiGateway } from "@/services/api-gateway";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";

/**
 * @fileOverview Industry Acquisition Terminal
 * Manages institutional carbon offset procurement and bulk compliance orders.
 */
export default function CarbonCreditsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Signing State
  const [signingCredit, setSigningCredit] = useState<any>(null);
  const [privateKey, setPrivateKey] = useState("");

  // Hydration guard for charts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Target credits for bulk compliance - Corrected collection to "carbon_credits"
  const creditsRef = useMemoFirebase(() => 
    db ? query(collection(db, "carbon_credits"), where("status", "==", "ACTIVE")) : null
  , [db]);
  const { data: credits, isLoading } = useCollection(creditsRef);

  // Fetch real acquisitions to calculate gap
  const txQuery = useMemoFirebase(() => user ? query(collection(db, "transactions"), where("buyerId", "==", user.uid), where("tokenType", "==", "CarbonCreditToken")) : null, [db, user]);
  const { data: userTxs } = useCollection(txQuery);

  const stats = useMemo(() => {
    const totalEmissions = 4850;
    const offsetsHeld = userTxs?.reduce((acc, tx) => acc + (tx.amount || 0), 0) || 3200;
    return { totalEmissions, offsetsHeld };
  }, [userTxs]);

  const requiredMT = Math.max(stats.totalEmissions - stats.offsetsHeld, 0);

  const forecastData = [
    { month: "Oct", price: 1180 },
    { month: "Nov", price: 1210 },
    { month: "Dec", price: 1250 },
    { month: "Jan", price: 1320 },
    { month: "Feb", price: 1280 },
    { month: "Mar", price: 1320 },
    { month: "Apr", price: 1410, projected: true },
    { month: "May", price: 1480, projected: true },
  ];

  const handleAcquire = async () => {
    if (!user || !signingCredit || !privateKey) return;
    setIsProcessing(signingCredit.id);

    try {
      const gateway = new ApiGateway(db, user.uid);
      
      await gateway.dispatch('SETTLE_TRANSACTION', {
        token: signingCredit,
        price: 1320,
        amount: signingCredit.amount, 
        tokenType: 'CarbonCreditToken',
        privateKey
      });

      toast({
        title: "Settlement Confirmed",
        description: `Acquisition finalized with cryptographic signature via API Gateway.`,
      });
      
      setSigningCredit(null);
      setPrivateKey("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gateway Dispatch Error", description: error.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleBulkAcquire = async () => {
    if (!credits || credits.length === 0) {
      toast({ variant: "destructive", title: "Marketplace Empty", description: "No verified offsets available for bulk acquisition." });
      return;
    }
    
    setIsBulkLoading(true);
    setTimeout(() => {
      setIsBulkLoading(false);
      setSigningCredit(credits[0]);
      toast({
        title: "Compliance Order Prepared",
        description: `Strategic gap of ${requiredMT} MT calculated. Proceed to sign bulk acquisition.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Acquisition Terminal</h1>
          <p className="text-muted-foreground mt-1">Strategic offset procurement for institutional ESG compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 py-1.5 px-4 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> RSA-4096 Protocol Enabled
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-slate-900 text-white overflow-hidden relative group">
          <CardContent className="p-8 relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Strategic Gap Analysis</span>
              </div>
              <div>
                <h3 className="text-2xl font-headline font-bold">Recommended Acquisition</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
                  To achieve carbon neutrality for the current audit period, your corporate wallet requires an additional acquisition of <span className="text-white font-bold">{requiredMT.toLocaleString()} MT CO2e</span>.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Cost</p>
                  <p className="text-xl font-bold text-primary">₹{(requiredMT * 1250).toLocaleString()}</p>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Impact</p>
                  <p className="text-xl font-bold text-emerald-400">+{(requiredMT > 0 ? (requiredMT / stats.totalEmissions * 100).toFixed(1) : 0)}% Neutrality</p>
                </div>
              </div>
              <Button 
                onClick={handleBulkAcquire}
                disabled={isBulkLoading || requiredMT <= 0}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-bold text-lg shadow-2xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all"
              >
                {isBulkLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Execute Bulk Compliance Order</>}
              </Button>
            </div>
            <div className="w-full md:w-64 bg-white/5 rounded-3xl border border-white/10 p-6 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Compliance Status</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>NET ZERO PROGRESS</span>
                    <span className="text-primary">{Math.min(100, Math.round((stats.offsetsHeld / stats.totalEmissions) * 100))}%</span>
                  </div>
                  <Progress value={(stats.offsetsHeld / stats.totalEmissions) * 100} className="h-2 bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>ESG AUDIT SCORE</span>
                    <span className="text-primary">AAA</span>
                  </div>
                  <Progress value={85} className="h-2 bg-white/10" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Audit Ready Artifact</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-white p-8 ring-1 ring-slate-100 flex flex-col justify-center">
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-2xl w-fit">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-headline font-bold">Market Intelligence</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Carbon credit pricing is currently <span className="text-primary font-bold">4.2% lower</span> than the trailing 30-day average. 
              </p>
            </div>
            <Button 
              onClick={() => setShowForecast(true)}
              variant="outline" 
              className="w-full rounded-xl font-bold border-slate-200 h-11 group"
            >
              View Price Forecast <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-headline font-bold flex items-center gap-2">
          <Wind className="w-5 h-5 text-primary" /> Available Verified Offsets
        </h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Syncing Global Inventory...</p>
          </div>
        ) : !credits || credits.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] bg-white text-muted-foreground italic">
            No verified offsets currently available in the network registry.
          </div>
        ) : (
          <div className="grid gap-6">
            {credits.map((credit) => (
               <CreditListItem 
                  key={credit.id}
                  symbol={credit.symbol}
                  tonnes={credit.amount}
                  project={`Project ID: ${credit.landId?.substring(0, 12) || '---'}...`}
                  issuer="Eco Ledger Authority"
                  price={1320}
                  status={credit.status}
                  onAcquire={() => setSigningCredit(credit)}
                  isProcessing={isProcessing === credit.id}
               />
            ))}
          </div>
        )}
      </div>

      {/* Price Forecast Modal */}
      <Dialog open={showForecast} onOpenChange={setShowForecast}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Market Intelligence: Price Forecast</DialogTitle>
            <DialogDescription>Quantitative modeling of institutional carbon asset pricing.</DialogDescription>
          </DialogHeader>
          <div className="bg-slate-900 p-8 text-white relative">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <Badge className="bg-primary/20 text-primary border-none mb-2 font-bold text-[10px] uppercase tracking-widest">Market Pulse v4.2</Badge>
                <h2 className="text-2xl font-headline font-bold">Price Analytics</h2>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <LineChartIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="h-[250px] w-full">
              {isMounted ? (
                <ChartContainer config={{ 
                  price: { label: "Unit Price", color: "hsl(var(--primary))" }
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                      <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-primary opacity-20" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Rate</p>
                <p className="text-xl font-bold text-slate-900">₹1,320</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Q2 Forecast</p>
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-emerald-700">₹1,480</p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                Institutional analysis suggests a <span className="font-bold">12.1% increase</span> in acquisition costs by late April. Current settlements are recommended before the Q2 liquidity reallocation.
              </p>
            </div>

            <Button onClick={() => setShowForecast(false)} className="w-full h-12 rounded-xl font-bold">
              Close Intelligence Terminal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settlement Authority Dialog */}
      <Dialog open={!!signingCredit} onOpenChange={() => !isProcessing && setSigningCredit(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
              <FileKey className="text-emerald-600 w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-headline font-bold text-center">Settlement Authority</DialogTitle>
            <DialogDescription className="text-center">
              Authorizing purchase of <span className="font-bold text-slate-900">{signingCredit?.amount} MT CO2e</span>. Provide your RSA Private Key to sign the Gateway settlement hash.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">RSA Private Key (.PEM)</Label>
              <Textarea 
                placeholder="-----BEGIN PRIVATE KEY-----" 
                className="font-mono text-[10px] min-h-[120px] bg-slate-50 border-slate-200 rounded-xl"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
              />
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-800 leading-tight">
                This signature serves as institutional proof of acquisition and will be validated by the API Gateway before ledger commitment.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 mt-2">
            <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setSigningCredit(null)}>Abort</Button>
            <Button 
              className="flex-[2] h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/10"
              onClick={handleAcquire}
              disabled={!privateKey || !!isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign & Settle via Gateway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreditListItem({ symbol, tonnes, project, issuer, price, status, onAcquire, isProcessing }: any) {
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 bg-white ring-1 ring-slate-100 group">
      <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
        <div className="p-8 bg-slate-50 flex items-center justify-center md:w-56 border-r border-slate-100 group-hover:bg-primary/5 transition-colors">
          <div className="text-center">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 mx-auto w-fit">
              <Wind className="w-10 h-10 text-primary" />
            </div>
            <div className="text-2xl font-bold font-headline text-slate-900">{symbol}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Offset</p>
          </div>
        </div>
        <div className="p-8 flex-1 grid md:grid-cols-3 gap-8 items-center">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Project Source</p>
            <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 group/link">
              {project} <ExternalLink className="w-4 h-4 text-slate-300 group-hover/link:text-primary transition-colors" />
            </h4>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[9px] uppercase">AI Verified</Badge>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-bold text-[9px] uppercase">Gateway Signed</Badge>
            </div>
          </div>
          <div className="text-center space-y-2 md:border-x border-slate-100">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ecological Impact</p>
            <div className="text-3xl font-bold text-primary">{tonnes?.toLocaleString() || 0} <span className="text-sm font-medium text-slate-400">MT CO2e</span></div>
            <p className="text-[10px] font-bold text-slate-400 italic">Net Footprint Reduction</p>
          </div>
          <div className="flex flex-col gap-4 items-end">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit Price</p>
              <p className="text-2xl font-bold text-slate-900">₹{price?.toLocaleString() || 0}</p>
            </div>
            <Button 
              onClick={onAcquire}
              disabled={isProcessing}
              className="rounded-2xl px-8 h-12 font-bold flex items-center gap-2 shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShoppingCart className="w-4 h-4" /> Acquire Credits</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
