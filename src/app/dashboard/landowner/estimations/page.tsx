
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  TreeDeciduous, 
  Zap, 
  History, 
  Calculator, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Download,
  BarChart3,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  Leaf,
  Clock
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { estimateCarbonPotential, type EstimateCarbonPotentialOutput } from "@/ai/flows/estimate-carbon-potential";
import { useToast } from "@/hooks/use-toast";
import { ApiGateway } from "@/services/api-gateway";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

export default function EstimationsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [selectedParcelId, setSelectedParcelId] = useState<string>("");
  const [isEstimating, setIsEstimating] = useState(false);
  const [aiResult, setAiResult] = useState<EstimateCarbonPotentialOutput | null>(null);

  const [formData, setFormData] = useState({
    soilType: "Loam",
    vegetationType: "Forest",
    forestSubType: "Evergreen",
    growthRate: "2.4",
    climateZone: "Temperate",
    historicalLandUse: "Untouched",
    locationDescription: ""
  });

  // UNIFIED SCHEMA: Query from top-level 'lands'
  const parcelsRef = useMemoFirebase(() => 
    user ? query(collection(db, "lands"), where("ownerId", "==", user.uid)) : null
  , [db, user]);
  const { data: parcels, isLoading: isLoadingParcels } = useCollection(parcelsRef);

  const estimatesRef = useMemoFirebase(() => 
    (user && selectedParcelId) ? query(collection(db, "carbon_estimates"), where("landParcelId", "==", selectedParcelId), orderBy("estimationDate", "desc")) : null
  , [db, user, selectedParcelId]);
  const { data: estimates, isLoading: isLoadingEstimates } = useCollection(estimatesRef);

  const selectedParcel = parcels?.find(p => p.id === selectedParcelId);

  const projectionData = useMemo(() => {
    if (!aiResult) return [];
    const base = aiResult.carbonSequestrationPotentialTonsPerYear;
    const userGrowthRate = parseFloat(formData.growthRate) / 2.0;
    
    return Array.from({ length: 10 }, (_, i) => ({
      year: 2026 + i,
      projection: Math.round(base * Math.pow(1 + (userGrowthRate * 0.02), i)),
      benchmark: Math.round(base * 0.85 * Math.pow(1.01, i))
    }));
  }, [aiResult, formData.growthRate]);

  const handleRunEstimation = async () => {
    if (!selectedParcel || !user) return;
    
    setIsEstimating(true);
    setAiResult(null);

    try {
      // Area is stored in acres in the flat schema
      const acres = selectedParcel.area || 0;

      const result = await estimateCarbonPotential({
        landAreaAcres: acres,
        soilType: formData.soilType,
        vegetationType: `${formData.vegetationType} - ${formData.forestSubType}`,
        climateZone: formData.climateZone,
        historicalLandUse: formData.historicalLandUse,
        locationDescription: `Primary Growth Rate: ${formData.growthRate}. Additional context: ${formData.locationDescription || selectedParcel.description}`
      });

      setAiResult(result);

      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('RECORD_ESTIMATE', {
        parcelId: selectedParcelId,
        estimate: {
          ...result,
          metadata: {
            soilType: formData.soilType,
            forestType: formData.forestSubType,
            inputGrowthRate: formData.growthRate,
            climateZone: formData.climateZone
          }
        }
      });

      toast({
        title: "Estimate Signed & Logged",
        description: "AI results have been committed to the secure ledger.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Protocol Violation",
        description: error.message || "Failed to execute secure estimation flow.",
      });
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900">Carbon Analytics</h1>
          <p className="text-muted-foreground mt-1">Advanced AI modeling for ecological sequestration and asset valuation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1.5 px-4 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Integrity Verification Active
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
            <CardHeader className="bg-slate-50/50 border-b p-6">
              <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" /> Parameters
              </CardTitle>
              <CardDescription className="text-xs">Configure ecosystem variables.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Asset</Label>
                <Select value={selectedParcelId} onValueChange={setSelectedParcelId}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder={isLoadingParcels ? "Syncing registry..." : "Choose property"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {parcels?.map((parcel) => (
                      <SelectItem key={parcel.id} value={parcel.id}>
                        {parcel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedParcel && (
                <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Forest Type Selector</Label>
                    <Select value={formData.forestSubType} onValueChange={(v) => setFormData({...formData, forestSubType: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Evergreen">Evergreen Coniferous</SelectItem>
                        <SelectItem value="Deciduous">Deciduous Broadleaf</SelectItem>
                        <SelectItem value="Tropical">Tropical Rainforest</SelectItem>
                        <SelectItem value="Mangrove">Coastal Mangroves</SelectItem>
                        <SelectItem value="Savanna">Wooded Savanna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Growth Rate Input (cm/yr)</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      className="rounded-xl h-11 border-slate-200 focus-visible:ring-primary/20"
                      value={formData.growthRate}
                      onChange={(e) => setFormData({...formData, growthRate: e.target.value})}
                    />
                  </div>

                  <Button 
                    onClick={handleRunEstimation} 
                    disabled={isEstimating}
                    className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/10 mt-2 transition-all active:scale-95"
                  >
                    {isEstimating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Run AI Analysis</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {aiResult ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Annual Potential</p>
                    <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
                  </div>
                  <div className="flex items-end gap-2">
                    <h3 className="text-3xl font-headline font-bold text-slate-900">{aiResult.carbonSequestrationPotentialTonsPerYear}</h3>
                    <span className="text-xs font-bold text-muted-foreground mb-1.5">MT CO2e</span>
                  </div>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6 ring-1 ring-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ECO Token Yield</p>
                    <div className="p-2 bg-primary/5 rounded-lg"><Zap className="w-4 h-4 text-primary" /></div>
                  </div>
                  <div className="flex items-end gap-2">
                    <h3 className="text-3xl font-headline font-bold text-primary">{aiResult.projectedCarbonCreditsPerYear}</h3>
                    <span className="text-xs font-bold text-muted-foreground mb-1.5">Tokens/Yr</span>
                  </div>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6 ring-1 ring-slate-100 border-l-4 border-l-primary">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Service Status</p>
                    <Badge className="bg-emerald-100 text-emerald-700 font-bold text-[9px]">HASHED</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Result anchored to audit ledger via API Gateway.</p>
                </Card>
              </div>

              <Card className="border-none shadow-sm rounded-[2rem] bg-white ring-1 ring-slate-100 overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-8">
                  <CardTitle className="text-xl font-headline font-bold">10-Year Sequestration Projection</CardTitle>
                  <CardDescription className="text-xs">Verifiable ecological modeling vs. benchmarks.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 h-[400px]">
                  <ChartContainer config={{ 
                    projection: { label: "Your Asset", color: "hsl(var(--primary))" },
                    benchmark: { label: "Benchmark", color: "#e2e8f0" }
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData}>
                        <defs>
                          <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="projection" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorProj)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <div className="p-8 bg-slate-50 rounded-full mb-8">
                <BarChart3 className="w-20 h-20 text-slate-200" />
              </div>
              <h3 className="text-3xl font-headline font-bold text-slate-800 mb-3">Carbon Estimation Service</h3>
              <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
                Select an asset to initiate secure AI analysis. Every result is cryptographically hashed to ensure absolute data integrity.
              </p>
            </div>
          )}

          {selectedParcelId && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2 text-slate-700">
                <History className="w-5 h-5 text-muted-foreground" /> Sequestration Audit Trail
              </h3>
              <div className="grid gap-3">
                {isLoadingEstimates ? (
                  <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" /></div>
                ) : estimates?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic bg-white p-8 rounded-2xl border text-center">No historical states recorded.</p>
                ) : (
                  estimates?.map((est) => (
                    <div key={est.id} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between hover:border-primary transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-primary transition-colors">
                          <ShieldCheck className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{est.estimatedCarbonTonnes} MT CO2e / Year</div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3 opacity-50" /> {est.estimationDate?.toDate().toLocaleString()} • Service Validated
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase h-6">VERIFIED</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
