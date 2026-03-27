
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Loader2, 
  DollarSign, 
  Target,
  Calendar,
  Filter,
  Download,
  Activity,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Bar,
  BarChart,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { decryptData } from "@/lib/crypto";

export default function ROIAnalyticsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [activeRange, setActiveRange] = useState("6M");
  
  const [stats, setStats] = useState({ totalYield: 0, avgRoi: 0, sharpeRatio: 0 });
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch transactions to derive historical growth - Using indexed sorted query
  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(db, "transactions"), 
      where("buyerId", "==", user.uid),
      orderBy("createdAt", "desc")
    ) : null
  , [db, user]);
  const { data: transactions, isLoading: isLoadingTransactions } = useCollection(transactionsQuery);

  // Decryption Protocol: Resolve financial values for quantitative analytics
  useEffect(() => {
    async function calculateYield() {
      if (!transactions || transactions.length === 0) {
        setStats({ totalYield: 0, avgRoi: 0, sharpeRatio: 0 });
        return;
      }
      
      setIsCalculating(true);
      let totalValue = 0;

      for (const tx of transactions) {
        let plainPrice = 0;
        try {
          if (typeof tx.totalPrice === 'string' && tx.totalPrice.length > 20) {
            const val = await decryptData(tx.totalPrice);
            plainPrice = parseFloat(val) || 0;
          } else {
            plainPrice = typeof tx.totalPrice === 'number' ? tx.totalPrice : 0;
          }
        } catch (e) {
          plainPrice = 0;
        }
        
        if (!isNaN(plainPrice)) {
          totalValue += plainPrice;
        }
      }

      setStats({
        totalYield: totalValue * 0.092, // Mock 9.2% yield based on real holdings
        avgRoi: 9.4,
        sharpeRatio: 2.1
      });
      setIsCalculating(false);
    }

    calculateYield();
  }, [transactions]);

  const performanceData = [
    { date: "Jan", yield: 1200, growth: 420000 },
    { date: "Feb", yield: 1450, growth: 450000 },
    { date: "Mar", yield: 1300, growth: 480000 },
  ];

  const sectorPerformance = [
    { name: "Forestry", roi: 11.2, color: "hsl(var(--primary))" },
    { name: "Wetlands", roi: 8.4, color: "hsl(var(--chart-2))" },
    { name: "Grassland", roi: 7.1, color: "hsl(var(--chart-3))" },
    { name: "Mangroves", roi: 12.5, color: "hsl(var(--chart-4))" },
  ];

  if (isLoadingTransactions || isCalculating) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Running Quantitative Models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">ROI Analytics</h1>
          <p className="text-muted-foreground mt-1">Quantitative performance tracking and yield projections (Q1 2026).</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border rounded-xl p-1 flex items-center shadow-sm">
            {["1M", "3M", "ALL"].map((range) => (
              <Button 
                key={range}
                variant={activeRange === range ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-lg h-8 px-3 font-bold text-[10px]"
                onClick={() => setActiveRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="rounded-xl font-bold border-slate-200 h-10 gap-2">
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticsStat title="Cumulative Yield" value={`₹${stats.totalYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign className="text-emerald-600" />} trend="+14.2%" />
        <AnalyticsStat title="Net Annual ROI" value={`${stats.avgRoi}%`} icon={<TrendingUp className="text-primary" />} trend="+0.8%" />
        <AnalyticsStat title="Target Yield" value="10.5%" icon={<Target className="text-blue-600" />} trend="In Range" />
        <AnalyticsStat title="Volatility Index" value="Low" icon={<Activity className="text-amber-600" />} trend="Stable" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
          <Tabs defaultValue="growth" className="w-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-4 bg-white">
              <div>
                <CardTitle className="text-lg font-headline font-bold">Performance Matrix</CardTitle>
                <CardDescription className="text-xs">Valuation and yield distributions (as of Mar 4, 2026)</CardDescription>
              </div>
              <TabsList className="bg-slate-100 p-1 rounded-xl h-10">
                <TabsTrigger value="growth" className="rounded-lg font-bold px-4">Asset Growth</TabsTrigger>
                <TabsTrigger value="yield" className="rounded-lg font-bold px-4">Monthly Yield</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-6">
              <TabsContent value="growth" className="mt-0 h-[350px]">
                <ChartContainer config={{ growth: { label: "Valuation", color: "hsl(var(--primary))" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="growth" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="yield" className="mt-0 h-[350px]">
                <ChartContainer config={{ yield: { label: "Cash Flow", color: "hsl(var(--secondary))" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="yield" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Sector Yields
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {sectorPerformance.map((sector) => (
                <div key={sector.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tight">
                    <span className="text-slate-600">{sector.name}</span>
                    <span className="text-primary">{sector.roi}% ROI</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${(sector.roi / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <Badge className="bg-primary/20 text-primary border-none mb-4 font-bold text-[9px] uppercase tracking-widest">Projection AI</Badge>
              <h4 className="text-lg font-bold mb-2">Sustainable Upside</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Carbon credit pricing is projected to rise by <span className="text-primary font-bold">18%</span> in late March 2026. Re-allocating 5% of your portfolio to Tropical Mangroves could net <span className="text-white font-bold">₹4,20,000</span> in additional dividends.
              </p>
              <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs hover:no-underline group-hover:gap-2 transition-all">
                Run Simulation <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
          </Card>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="border-b border-slate-50 px-6 py-4">
          <CardTitle className="text-lg font-headline font-bold">Yield Distribution History</CardTitle>
          <CardDescription className="text-xs">Historical settlements and ROI milestones (Early 2026).</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Settlement ID</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Asset Category</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Date</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Yield Amount</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-right uppercase text-[10px] tracking-widest pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-900">SET_0942_0{i}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {i % 2 === 0 ? 'Ecological Reserve' : 'Carbon Offset Bundle'}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">Feb {12 + i}, 2026</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">+₹1,42,000</td>
                    <td className="px-6 py-4 text-right pr-6">
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold text-[9px] uppercase">Settled</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsStat({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white p-6 ring-1 ring-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-headline font-bold mt-1 text-slate-900">{value}</h3>
      </div>
    </Card>
  );
}
