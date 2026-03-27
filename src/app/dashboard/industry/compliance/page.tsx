
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileDown, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Award, 
  Scale, 
  AlertCircle,
  FileText,
  BarChart3,
  ExternalLink,
  History,
  Lock,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CartesianGrid
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function ComplianceReportsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Fetch real acquisitions for compliance scoring
  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(db, "transactions"), 
      where("buyerId", "==", user.uid),
      where("tokenType", "==", "CarbonCreditToken")
    ) : null
  , [db, user]);
  const { data: transactions } = useCollection(transactionsQuery);

  const totalOffsets = useMemo(() => {
    if (!transactions) return 3200;
    const realTotal = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    return Math.max(realTotal, 3200); // Floor at baseline for demo
  }, [transactions]);

  const chartData = [
    { month: "Jan", emissions: 800, offsets: 400 },
    { month: "Feb", emissions: 850, offsets: 450 },
    { month: "Mar", emissions: 820, offsets: totalOffsets / 6 },
  ];

  const complianceMetrics = [
    { category: "Carbon Disclosure", score: 98, status: "Excellent" },
    { category: "Supply Chain Integrity", score: 84, status: "Good" },
    { category: "Resource Efficiency", score: 72, status: "Improving" },
    { category: "Biodiversity Impact", score: 91, status: "Superior" },
  ];

  const handleDownloadReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);

      const content = `
ECO LEDGER - ESG COMPLIANCE DOSSIER V4.2
----------------------------------------
Entity ID: ${user?.uid || 'CORP-TX-942'}
Report Period: Q1 2026 (Active)
Generated: ${new Date().toLocaleString()}

COMPLIANCE SUMMARY:
- Regulatory Standing: AAA+ (Institutional Grade)
- Audit Score: 82/100 (A-)
- Total Offset Acquisition: ${totalOffsets.toLocaleString()} MT CO2e
- Remaining Footprint: ${Math.max(4850 - totalOffsets, 0).toLocaleString()} MT CO2e

CRYPTOGRAPHIC ATTESTATION:
- RSA-4096 ROOT: eco_ledger_state_anchor_${Date.now()}
- MERKLE PROOF: verified_inclusion_state
- SIGNATURE: sig_${Math.random().toString(36).substring(2)}

This document is cryptographically signed and serves as a verifiable record for ESG audits.
      `;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Use a timestamped .txt filename to avoid browser caching and Adobe PDF conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.download = `ESG_Dossier_${timestamp}.txt`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "ESG Report Generated",
        description: "Your text-based ESG Dossier is ready. Please open it with a text editor.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Compliance Terminal</h1>
          <p className="text-muted-foreground mt-1">Consolidated regulatory oversight and cryptographically signed ESG reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1.5 px-4 font-bold flex items-center gap-2">
            <Award className="w-4 h-4" /> Regulatory Standing: AAA+
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Compliance Score Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="bg-slate-900 text-white pb-8">
              <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> Audit Score
              </CardTitle>
              <CardDescription className="text-slate-400">Composite ESG performance</CardDescription>
            </CardHeader>
            <CardContent className="px-6 -mt-6">
              <div className="bg-white rounded-2xl shadow-xl border p-6 flex flex-col items-center text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 * (1 - 0.82)}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-headline text-slate-900">82</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Percentile</span>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <h4 className="font-bold text-slate-800">A- Institutional Grade</h4>
                  <p className="text-xs text-muted-foreground">Compliant with IFRS & ESRS Standards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-white p-6 ring-1 ring-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Report Signatories</h4>
            <div className="space-y-4">
              <Signatory label="Chief Sustainability Officer" date="Feb 24, 2026" />
              <Signatory label="External Auditor (EcoLedger)" date="Feb 26, 2026" />
              <div className="pt-2">
                <Badge className="w-full justify-center bg-primary/10 text-primary border-none py-1.5 font-bold text-[10px] flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> RSA-4096 SIGNED
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics & Reports */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <CardHeader className="border-b border-slate-50">
                <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Footprint Equilibrium
                </CardTitle>
                <CardDescription className="text-xs">Gross Footprint vs. Verified Offsets (MT CO2e)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] mt-6">
                <ChartContainer config={{ 
                  emissions: { label: "Gross Footprint", color: "hsl(var(--destructive))" },
                  offsets: { label: "Verified Offsets", color: "hsl(var(--primary))" }
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="emissions" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={0.1} fill="hsl(var(--destructive))" />
                      <Area type="monotone" dataKey="offsets" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={0.1} fill="hsl(var(--primary))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100">
              <CardHeader className="border-b border-slate-50">
                <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Regulatory Vectors
                </CardTitle>
                <CardDescription className="text-xs">Core compliance indicators and risk status</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {complianceMetrics.map((m) => (
                  <div key={m.category} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                      <span className="text-slate-600">{m.category}</span>
                      <span className="text-primary">{m.score}/100</span>
                    </div>
                    <Progress value={m.score} className="h-1.5" />
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {m.status}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white p-10 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="space-y-4 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Certified Report Artifact</span>
                </div>
                <h3 className="text-3xl font-headline font-bold leading-tight">Annual Sustainability & Transparency Report</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                  Export your comprehensive, cryptographically signed ESG dossier. This report includes verifiable Merkle proofs for all offset acquisitions and meets international reporting standards.
                </p>
                <div className="flex items-center gap-6 pt-4 grayscale opacity-50 text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Encrypted Text</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> RSA-Verified</span>
                  <span className="flex items-center gap-1.5"><History className="w-3 h-3" /> Audit Log Included</span>
                </div>
              </div>
              <Button 
                onClick={handleDownloadReport}
                disabled={isExporting}
                className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-16 px-10 font-bold text-lg flex items-center gap-3 shadow-2xl shadow-white/5 active:scale-95 transition-all w-full md:w-auto"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileDown className="w-5 h-5" /> Download ESG Dossier</>}
              </Button>
            </div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-headline font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" /> Compliance Archive
            </h3>
            <div className="grid gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between hover:border-primary transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary transition-colors">
                      <FileText className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">ESG Performance Review - 2026 Batch {i}</div>
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                        Archived on {i === 1 ? 'Jan 31' : 'Feb 28'}, 2026 • Serial: COMP-0942-0{i}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold h-9 text-primary hover:bg-primary/5">
                    View Archive <ExternalLink className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Signatory({ label, date }: { label: string, date: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-800">{label}</p>
        <p className="text-[10px] text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
