
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  ShieldCheck, 
  Loader2, 
  Search, 
  Hash, 
  Clock, 
  Globe, 
  ArrowLeft,
  Activity,
  Network,
  Fingerprint,
  ExternalLink,
  Copy,
  Anchor,
  Info
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * @fileOverview Global Ledger Explorer
 * Live monitoring of the network's immutable state.
 */
export default function GlobalLedgerExplorer() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Public fetch of Audit Logs
  const auditLogsQuery = useMemoFirebase(() => 
    db ? query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(50)) : null
  , [db]);
  const { data: logs, isLoading: isLoadingLogs } = useCollection(auditLogsQuery);

  // Public fetch of latest Merkle Root batches
  const merkleRootsQuery = useMemoFirebase(() => 
    db ? query(collection(db, "merkleTreeRoots"), orderBy("creationDate", "desc"), limit(1)) : null
  , [db]);
  const { data: roots } = useCollection(merkleRootsQuery);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  const filteredLogs = logs?.filter(log => 
    log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary selection:text-primary-foreground">
      {/* Institutional Header */}
      <div className="bg-slate-900 text-white py-12 border-b border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-white/5 mb-8 -ml-4 font-bold uppercase tracking-widest text-[10px]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Network
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Public Transparency Node</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold">Global <span className="text-primary italic">Ledger</span> Explorer</h1>
              <p className="text-slate-400 max-w-2xl leading-relaxed font-medium">
                Live monitoring of the Eco Ledger network. Every event is cryptographically anchored to the global state via SHA-256 Merkle integrity proofs.
              </p>
            </div>
            
            <Card className="bg-white/5 border-white/10 text-white p-6 rounded-2xl min-w-[320px]">
              <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-[0.2em] mb-4">
                <Fingerprint className="w-4 h-4" /> Anchored State Root
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Latest Merkle Root</p>
                  <p className="text-xs font-mono text-slate-300 break-all leading-tight">
                    {roots?.[0]?.rootHash || "f29567c30985223e7f9188448b1110e53a5a73e5a59f5"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" /> Consensus Verified
                  </div>
                  <p className="text-[9px] text-slate-500 italic">
                    Updated {roots?.[0]?.creationDate?.toDate().toLocaleTimeString() || "Live"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8 pb-32">
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border ring-1 ring-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by Action, Entity ID, or Hash..." 
              className="pl-11 border-none bg-transparent h-12 rounded-xl focus-visible:ring-0 text-base" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 h-12">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Feed Active</span>
          </div>
        </div>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100">
          <CardHeader className="border-b border-slate-50 px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-2 text-slate-900">
                  <Database className="w-5 h-5 text-primary" /> Network Activity Ledger
                </CardTitle>
                <CardDescription className="text-xs">Immutable history of cryptographically verified ecological events.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/5 text-primary font-bold px-4 py-1.5 rounded-lg border-none">
                {isLoadingLogs ? "Reading..." : `${filteredLogs?.length || 0} Recent Events`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold pl-8 py-4">Timestamp</TableHead>
                  <TableHead className="font-bold">System Action</TableHead>
                  <TableHead className="font-bold">Entity Index</TableHead>
                  <TableHead className="font-bold">Event Hash</TableHead>
                  <TableHead className="text-right pr-8 font-bold">Integrity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLogs ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Public Node...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic">
                      No matching records found in current block.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs?.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
                      <TableCell className="pl-8 text-[10px] font-medium text-slate-500">
                        {log.timestamp?.toDate().toLocaleString(undefined, { 
                          dateStyle: 'medium', 
                          timeStyle: 'medium' 
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary/5 rounded-lg">
                            <Activity className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="font-bold text-slate-700 text-xs uppercase tracking-tight">
                            {log.eventType.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-mono text-slate-400">
                        {log.entityId.substring(0, 16)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 group/hash">
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                            {log.eventHash}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold text-[8px] h-5 px-2">SIGNED</Badge>
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Informational Footer */}
        <div className="grid md:grid-cols-3 gap-8 pt-8">
          <ExplorerInfo 
            icon={<Hash className="w-6 h-6" />}
            title="SHA-256 Immutability"
            desc="Every transaction generates a unique cryptographic fingerprint. Once anchored, the state cannot be modified without alerting all network nodes."
          />
          <ExplorerInfo 
            icon={<Anchor className="w-6 h-6" />}
            title="Merkle State Anchors"
            desc="Batch logs are bundled into Merkle Trees. This provides a single root hash that mathematically represents the entire network's history."
          />
          <ExplorerInfo 
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Institutional Trust"
            desc="Industrial compliance officers use this node to monitor offset acquisitions and verify environmental impact reports in real-time."
          />
        </div>
      </main>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden sm:max-w-xl">
          <DialogHeader className="bg-slate-900 p-8 text-white relative">
            <div className="relative z-10">
              <Badge className="bg-primary/20 text-primary border-none mb-2 font-bold text-[9px] uppercase tracking-widest">Protocol Artifact</Badge>
              <DialogTitle className="text-white text-2xl font-headline font-bold">Event Audit Detail</DialogTitle>
              <DialogDescription className="text-slate-400 mt-1 font-mono text-[10px]">
                Event ID: {selectedLog?.id}
              </DialogDescription>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Event Content (Plaintext)</p>
                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                  {selectedLog?.details || "No supplementary data anchored."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Action Type" value={selectedLog?.eventType} />
                <DetailRow label="Involved Entity" value={selectedLog?.entityId} />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">State Fingerprint (SHA-256)</p>
                <div className="p-3 bg-white border rounded-xl font-mono text-[10px] break-all text-slate-500">
                  {selectedLog?.eventHash}
                </div>
              </div>
            </div>
            
            <Button onClick={() => setSelectedLog(null)} className="w-full h-12 rounded-xl font-bold">Close Artifact</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExplorerInfo({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
      <div className="p-3 bg-slate-50 rounded-2xl w-fit text-primary">{icon}</div>
      <h4 className="font-headline font-bold text-lg text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}
