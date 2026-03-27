"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TreeDeciduous, 
  TrendingUp, 
  Layers, 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  Loader2,
  Clock,
  Sparkles,
  ShieldCheck,
  Fingerprint,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CartesianGrid 
} from "recharts";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { DataTable } from "@/components/dashboard/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { VerificationBadge } from "@/components/dashboard/VerificationBadge";

export default function LandownerDashboard() {
  const { user } = useUser();
  const db = useFirestore();

  // Fetch Institutional Data - NEW FLAT SCHEMA
  const landsQuery = useMemoFirebase(() => 
    user ? query(collection(db, "lands"), where("ownerId", "==", user.uid)) : null
  , [db, user]);
  const { data: parcels, isLoading: isLoadingParcels } = useCollection(landsQuery);

  const projectsQuery = useMemoFirebase(() => 
    user ? query(collection(db, "carbon_projects"), where("ownerId", "==", user.uid)) : null
  , [db, user]);
  const { data: projects } = useCollection(projectsQuery);

  const activityRef = useMemoFirebase(() => 
    user ? query(collection(db, "auditLogs"), where("userId", "==", user.uid), limit(10)) : null
  , [db, user]);
  const { data: rawActivities } = useCollection(activityRef);

  const stats = useMemo(() => {
    if (!parcels) return { area: 0, carbon: 0, projects: 0, earnings: 0 };
    const totalArea = parcels.reduce((acc, p) => acc + (p.area || 0), 0);
    return {
      area: totalArea,
      carbon: totalArea * 4.2, 
      projects: projects?.length || 0,
      earnings: (projects?.length || 0) * 12500
    };
  }, [parcels, projects]);

  const chartData = [
    { month: "Jan", value: 120 }, { month: "Feb", value: 145 }, { month: "Mar", value: 180 },
    { month: "Apr", value: 210 }, { month: "May", value: 240 }, { month: "Jun", value: 280 },
    { month: "Jul", value: Math.round(stats.carbon) || 310 },
  ];

  if (isLoadingParcels) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900">Ecological Snapshot</h1>
          <p className="text-muted-foreground mt-1">Real-time status of your verified land assets and carbon sequestration.</p>
        </div>
        <Link href="/dashboard/landowner/land">
          <Button className="rounded-2xl px-8 font-bold flex items-center gap-2 h-14 shadow-2xl shadow-primary/20">
            <Plus className="w-5 h-5" /> Register New Land
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Land Area" value={`${stats.area.toLocaleString()} Acres`} icon={<TreeDeciduous />} trend="+4.2% Growth" trendUp={true} />
        <StatCard title="Carbon Generated" value={`${stats.carbon.toFixed(1)} MT`} icon={<TrendingUp />} trend="AI Projected" trendUp={true} />
        <StatCard title="Projects" value={stats.projects} icon={<Layers />} trend="Verified Ledger" trendUp={true} />
        <StatCard title="Earnings" value={`₹${stats.earnings.toLocaleString()}`} icon={<Wallet />} trend="+12.4% Annual" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChartCard title="Carbon Sequestration Trend" description="Historical and projected CO2 absorption (MT)" badge={<VerificationBadge type="ai" />} className="lg:col-span-2">
          <ChartContainer config={{ value: { label: "Carbon Tons", color: "hsl(var(--primary))" } }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50">
            <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary" /> Verification Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Registry Consistency</span>
                <span className="text-emerald-600">100% Match</span>
              </div>
              <Progress value={100} className="h-2 rounded-full" />
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 leading-tight">Node state is synchronized with global Merkle root.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-8">
          <div>
            <CardTitle className="text-xl font-headline font-bold">Managed Land Registry</CardTitle>
            <CardDescription className="text-xs">Institutional inventory of your registered ecological assets.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable headers={["Parcel Name", "Area", "Status", "Action"]} emptyMessage="No land parcels registered yet.">
            {parcels?.map((parcel) => (
              <TableRow key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-bold pl-8 py-5">
                  <div className="flex items-center gap-3">
                    <TreeDeciduous className="w-4 h-4 text-emerald-600" />
                    <span>{parcel.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-600">{parcel.area} {parcel.areaUnit}</TableCell>
                <TableCell><StatusBadge status={parcel.status} /></TableCell>
                <TableCell className="text-right pr-8">
                  <Link href={`/dashboard/landowner/land`}>
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-primary">
                      Details <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
