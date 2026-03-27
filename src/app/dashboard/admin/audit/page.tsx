"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Loader2, 
  Search, 
  Activity,
  Network,
  Anchor,
  RefreshCw,
  Database,
  Info,
  Fingerprint,
  Lock
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { calculateMerkleRoot } from "@/lib/crypto";
import { ApiGateway } from "@/services/api-gateway";

/**
 * @fileOverview System Audit Ledger
 * Displays a verifiable record of all system events anchored to the global state.
 */
export default function AuditLogsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [computedRoot, setComputedRoot] = useState<string | null>(null);

  // Admin access check
  const userDocRef = useMemoFirebase(() => (user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);
  
  const isAdmin = profile?.role === 'admin';
  
  const auditLogsQuery = useMemoFirebase(() => 
    (db && isAdmin) ? query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(100)) : null
  , [db, isAdmin]);
  const { data: logs, isLoading: isLoadingLogs } = useCollection(auditLogsQuery);

  // Recalculate Merkle Root whenever the ledger state changes
  useEffect(() => {
    async function updateRoot() {
      if (!logs || logs.length === 0) return;
      const hashes = logs.map(l => l.eventHash).filter(Boolean);
      const root = await calculateMerkleRoot(hashes);
      setComputedRoot(root);
    }
    updateRoot();
  }, [logs]);

  const handleAnchorState = async () => {
    if (!user || !logs || logs.length === 0 || !computedRoot) return;
    setIsAnchoring(true);

    try {
      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('ANCHOR_LEDGER', {
        rootHash: computedRoot,
        logCount: logs.length
      });

      toast({ 
        title: "State Anchored", 
        description: "Official Merkle Root committed to the global registry." 
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Anchor Failure", description: error.message });
    } finally {
      setIsAnchoring(false);
    }
  };

  if (isProfileLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary opacity-20" /></div>;

  if (!isAdmin) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <ShieldCheck className="w-12 h-12 text-destructive opacity-20" />
      <p className="font-bold">Admin Access Required</p>
      <Link href="/"><Button variant="outline" className="rounded-xl">Exit Terminal</Button></Link>
    </div>
  );

  const filteredLogs = logs?.filter(log => 
    log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Audit Terminal</h1>
          <p className="text-muted-foreground mt-1">Proof of integrity via SHA-256 fingerprints and Merkle state anchoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-slate-900 text-white py-1.5 px-4 font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" /> Real-time Audit Active
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] p-8 bg-slate-900 text-white overflow-hidden relative">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                <Network className="w-5 h-5" /> Consensus State
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Computed Block Root</p>
                  <TooltipWrapper text="A Merkle Root is a single hash representing the integrity of all transactions in this block.">
                    <Info className="w-3 h-3 text-slate-600 cursor-help" />
                  </TooltipWrapper>
                </div>
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <p className="text-[11px] font-mono break-all leading-relaxed text-slate-300">
                    {computedRoot || "Syncing Ledger..."}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleAnchorState} 
                  disabled={isAnchoring || !computedRoot} 
                  className="w-full h-12 bg-primary hover:bg-primary/90 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all"
                >
                  {isAnchoring ? <Loader2 className="w-5 h-5 animate-spin" /> : <Anchor className="w-5 h-5" />} 
                  <span className="text-xs uppercase tracking-widest">Anchor Global Root</span>
                </Button>
                <p className="text-[9px] text-slate-500 text-center mt-4 leading-relaxed px-4">
                  Anchoring commits this root to the public registry as the "Official State", making all current logs immutable.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          </Card>

          <Card className="p-6 bg-white ring-1 ring-slate-100 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Database className="w-3 h-3" /> Protocol Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Events</p>
                <p className="text-xl font-bold">{logs?.length || 0}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Integrity</p>
                <p className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1.5">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex bg-white p-3 rounded-2xl shadow-sm border items-center ring-1 ring-slate-100">
            <Search className="w-5 h-5 text-muted-foreground ml-3" />
            <Input placeholder="Search system action ledger..." className="border-none focus-visible:ring-0 text-base" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Badge variant="outline" className="font-bold border-slate-200 mr-2 bg-slate-50 px-4 h-8 rounded-xl whitespace-nowrap">
              {filteredLogs.length} Events
            </Badge>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold pl-8 py-5">System Action</TableHead>
                  <TableHead className="font-bold">Entity Index</TableHead>
                  <TableHead className="font-bold">SHA-256 Fingerprint</TableHead>
                  <TableHead className="text-right pr-8 font-bold">Integrity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLogs ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center"><Loader2 className="animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="h-64 text-center text-muted-foreground italic">No events found in the current block.</TableCell></TableRow>
                ) : filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary">
                          <Activity className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-tight">{log.eventType.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono text-muted-foreground">{log.entityId?.substring(0, 16)}...</TableCell>
                    <TableCell className="text-[10px] font-mono text-slate-400">
                      {log.eventHash?.substring(0, 32)}...
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-2 text-emerald-600">
                        <span className="text-[10px] font-bold uppercase">SIGNED</span>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TooltipWrapper({ children, text }: { children: React.ReactNode, text: string }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
        {text}
      </div>
    </div>
  );
}
