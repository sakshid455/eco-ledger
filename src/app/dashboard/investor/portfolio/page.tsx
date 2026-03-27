
"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  ArrowUpRight, 
  Loader2, 
  PieChart as PieChartIcon,
  ExternalLink,
  History,
  DollarSign,
  Tag,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { 
  Pie, 
  PieChart, 
  Cell
} from "recharts";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { decryptData } from "@/lib/crypto";

export default function InvestorPortfolioPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [decryptedHoldings, setDecryptedHoldings] = useState<any[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Fetch Investor Transactions to derive owned tokens
  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(db, "transactions"), 
      where("buyerId", "==", user.uid)
    ) : null
  , [db, user]);
  const { data: transactions, isLoading } = useCollection(transactionsQuery);

  // Process and Decrypt Holdings
  useEffect(() => {
    async function processTransactions() {
      if (!transactions) return;
      setIsDecrypting(true);
      
      const groups: Record<string, any> = {};
      
      for (const tx of transactions) {
        // Use tokenId as the stable key for grouping
        const id = tx.tokenId || "UNKNOWN_ASSET";
        
        if (!groups[id]) {
          groups[id] = {
            id,
            symbol: tx.tokenType === 'InvestmentToken' ? 'INV' : 'CC',
            type: tx.tokenType,
            amount: 0,
            totalCost: 0,
            latestTxHash: tx.transactionHash,
            txDate: tx.transactionDate
          };
        }

        let plainPrice = 0;
        try {
          // Decrypt price if it's an AES-256 string
          if (typeof tx.totalPrice === 'string') {
            const val = await decryptData(tx.totalPrice);
            plainPrice = parseFloat(val) || 0;
          } else {
            plainPrice = tx.totalPrice || 0;
          }
        } catch (e) {
          plainPrice = 0;
        }

        groups[id].amount += (tx.amount || 0);
        groups[id].totalCost += plainPrice;
      }

      setDecryptedHoldings(Object.values(groups).filter(h => h.amount > 0));
      setIsDecrypting(false);
    }

    processTransactions();
  }, [transactions]);

  const stats = useMemo(() => {
    const totalInvested = decryptedHoldings.reduce((acc, h) => acc + h.totalCost, 0);
    const mockValue = totalInvested * 1.12; // 12% mock profit
    const profit = mockValue - totalInvested;
    
    return {
      totalInvested,
      currentValue: mockValue,
      profit,
      profitPct: totalInvested > 0 ? (profit / totalInvested) * 100 : 0
    };
  }, [decryptedHoldings]);

  const chartData = useMemo(() => {
    const investmentCount = decryptedHoldings.filter(h => h.type === 'InvestmentToken').length;
    const carbonCount = decryptedHoldings.filter(h => h.type === 'CarbonCreditToken').length;
    
    return [
      { name: "Investment Tokens", value: investmentCount, color: "hsl(var(--primary))" },
      { name: "Carbon Credits", value: carbonCount, color: "hsl(var(--secondary))" },
    ].filter(d => d.value > 0);
  }, [decryptedHoldings]);

  const handleResell = (holding: any) => {
    toast({
      title: "Resell Initiated",
      description: `Listing request for ${holding.amount} units of ${holding.id.substring(0,8)}... has been sent to the marketplace.`,
    });
  };

  if (isLoading || isDecrypting) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">My Portfolio</h1>
          <p className="text-muted-foreground mt-1">Detailed view of your owned ecological assets and market valuation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`py-1.5 px-4 font-bold flex items-center gap-2 ${stats.profit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {stats.profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            Net Return: {stats.profitPct.toFixed(2)}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PortfolioStat title="Portfolio Value" value={`₹${stats.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<Wallet className="text-primary" />} />
        <PortfolioStat title="Total Invested" value={`₹${stats.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<Briefcase className="text-blue-600" />} />
        <PortfolioStat title="Realized Profit" value={`₹${stats.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="text-emerald-600" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-sm rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" /> Asset Allocation
            </CardTitle>
            <CardDescription className="text-xs">Distribution by token classification</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center pt-6">
            {chartData.length > 0 ? (
              <ChartContainer 
                config={{ 
                  value: { label: "Count", color: "hsl(var(--primary))" } 
                }}
                className="mx-auto aspect-square max-h-[280px] w-full"
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-2 text-[10px]" />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic">
                <PieChartIcon className="w-12 h-12 mb-2 opacity-10" />
                <p>No asset data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-lg font-headline font-bold">Owned Assets</CardTitle>
            <CardDescription className="text-xs">Detailed inventory of your current holdings</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold pl-6">Asset ID</TableHead>
                    <TableHead className="font-bold">Amount</TableHead>
                    <TableHead className="font-bold">Total Cost</TableHead>
                    <TableHead className="font-bold">Tx Hash</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decryptedHoldings.map((holding) => (
                    <TableRow key={holding.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold pl-6">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-primary" />
                          <span className="truncate max-w-[100px]">{holding.id}</span>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4">
                            {holding.type === 'InvestmentToken' ? 'INV' : 'CC'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{holding.amount.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">₹{holding.totalCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                           <span className="truncate max-w-[80px]">{holding.latestTxHash}</span>
                           <ExternalLink className="w-3 h-3" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleResell(holding)}
                          className="rounded-xl font-bold h-8 text-primary hover:bg-primary/5"
                        >
                          <Tag className="w-3.5 h-3.5 mr-1" /> Resell
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {decryptedHoldings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                        <div className="flex flex-col items-center gap-2">
                          <History className="w-8 h-8 opacity-20" />
                          <p>You do not own any ecological tokens yet.</p>
                          <Button variant="link" className="text-primary font-bold">Browse Marketplace</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PortfolioStat({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white p-6 ring-1 ring-slate-100 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-headline font-bold mt-1 text-slate-900">{value}</h3>
      </div>
    </Card>
  );
}
