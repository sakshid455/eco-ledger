
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight,
  Database,
  Loader2,
  FileSearch,
  Zap,
  RefreshCw,
  Server,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, where, doc, limit, orderBy } from "firebase/firestore";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { ApiGateway } from "@/services/api-gateway";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  // 1. Fetch current user profile to verify admin role
  const userDocRef = useMemoFirebase(() => (user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);
  
  const isVerifiedAdmin = profile?.role === 'admin';

  // 2. Guard Stats Data fetching - Flat Collection Access
  const usersRef = useMemoFirebase(() => (db && isVerifiedAdmin) ? collection(db, "users") : null, [db, isVerifiedAdmin]);
  const { data: users } = useCollection(usersRef);

  // Sort by createdAt DESC to see newest pending lands first
  const pendingLandsQuery = useMemoFirebase(() => 
    (db && isVerifiedAdmin) ? query(
      collection(db, "lands"), 
      where("status", "==", "PENDING"),
      orderBy("createdAt", "desc")
    ) : null
  , [db, isVerifiedAdmin]);
  const { data: pendingLands, isLoading: isLoadingLands, error: landsError } = useCollection(pendingLandsQuery);

  const transactionsRef = useMemoFirebase(() => (db && isVerifiedAdmin) ? collection(db, "transactions") : null, [db, isVerifiedAdmin]);
  const { data: transactions } = useCollection(transactionsRef);

  const handleBootstrap = async () => {
    if (!user) return;
    setIsBootstrapping(true);
    try {
      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('REGISTER_LAND', {
        name: "Veridian Highland Reserve",
        location: "45.523, -122.676",
        area: "210",
        surveyNumber: "VHR-BBOOT-" + Math.floor(Math.random() * 9000),
        soilType: "Loam",
        vegetation: "Forest"
      });

      toast({ title: "Network Bootstrapped", description: "Sample pending asset anchored to the ledger." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Bootstrap Error", description: error.message });
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (isProfileLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">System Oversight</h1>
          <p className="text-muted-foreground mt-1">Global administration, network integrity, and real-time asset validation.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleBootstrap} 
            disabled={isBootstrapping}
            variant="outline" 
            className="rounded-xl font-bold border-slate-200 flex items-center gap-2 h-11 px-6"
          >
            {isBootstrapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Bootstrap Network
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStat title="Pending Approvals" value={pendingLands?.length.toString() || "0"} icon={<AlertCircle className="text-amber-600" />} trend="Queue Active" trendColor="text-amber-600 bg-amber-50" />
        <AdminStat title="Active Users" value={users?.length.toLocaleString() || "0"} icon={<Users className="text-blue-600" />} trend="Live Nodes" trendColor="text-blue-600 bg-blue-50" />
        <AdminStat title="Settlements" value={transactions?.length.toString() || "0"} icon={<Layers className="text-primary" />} trend="Verified Ledger" trendColor="text-primary bg-primary/5" />
        <AdminStat title="Network Health" value="Optimal" icon={<Activity className="text-emerald-600" />} trend="99.9% Uptime" trendColor="text-emerald-600 bg-emerald-50" />
      </div>

      {landsError && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="space-y-1">
            <h3 className="font-bold text-rose-900">Ledger Synchronization Delayed</h3>
            <p className="text-sm text-rose-800 opacity-80">The system is building the required database indices. This usually completes in 2-5 minutes.</p>
            <p className="text-[9px] font-mono text-rose-400 mt-2">{landsError.message}</p>
          </div>
        </div>
      )}

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
          <div>
            <CardTitle className="text-xl font-headline font-bold">Verification Queue</CardTitle>
            <CardDescription className="text-xs">Real landowner assets awaiting administrative validation (Newest first).</CardDescription>
          </div>
          <Link href="/dashboard/admin/verify">
            <Button variant="ghost" size="sm" className="text-primary font-bold h-9 text-[10px] uppercase tracking-widest hover:bg-primary/5">Manage All</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold pl-8 py-4">Parcel Name</TableHead>
                <TableHead className="font-bold">Landowner Node</TableHead>
                <TableHead className="font-bold">Area</TableHead>
                <TableHead className="text-right pr-8 font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingLands ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" />
                  </TableCell>
                </TableRow>
              ) : landsError ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-slate-400 italic">
                    Unable to load queue during index creation.
                  </TableCell>
                </TableRow>
              ) : (pendingLands?.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-slate-400 italic">
                    Queue is currently clear.
                  </TableCell>
                </TableRow>
              ) : (
                pendingLands?.slice(0, 10).map((parcel) => (
                  <TableRow key={parcel.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold pl-8 py-5">
                      <div className="flex items-center gap-3">
                        <Server className="w-4 h-4 text-primary" />
                        {parcel.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-muted-foreground">{parcel.ownerId?.substring(0, 16)}...</TableCell>
                    <TableCell className="text-sm font-medium">{parcel.area} {parcel.areaUnit}</TableCell>
                    <TableCell className="text-right pr-8">
                      <Link href="/dashboard/admin/verify">
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-primary">
                          Review <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminStat({ title, value, icon, trend, trendColor }: any) {
  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white p-8 ring-1 ring-slate-100 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
        <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${trendColor}`}>
          {trend}
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-headline font-bold text-slate-900 leading-none">{value}</h3>
      </div>
    </Card>
  );
}
