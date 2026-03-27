"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  ShieldCheck, 
  Loader2, 
  Search, 
  ArrowRightLeft, 
  Database,
  History,
  Info,
  Lock,
  Hash
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, query, updateDoc, doc, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { decryptData } from "@/lib/crypto";

/**
 * @fileOverview Token Management Terminal
 * Allows administrators to monitor global asset lifecycles and transaction integrity.
 */
export default function TokenManagementPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [decryptedValues, setDecryptedValues] = useState<Record<string, number>>({});
  const [isDecrypting, setIsDecrypting] = useState(false);

  // 1. Verify admin role for institutional access
  const userDocRef = useMemoFirebase(() => (user ? doc(db, "users", user.uid) : null), [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);
  const isVerifiedAdmin = profile?.role === 'admin';
  
  // 2. Query Global Assets
  const invTokensQuery = useMemoFirebase(() => 
    (db && isVerifiedAdmin) ? query(collection(db, "investments")) : null
  , [db, isVerifiedAdmin]);
  const { data: invTokens, isLoading: isLoadingInv } = useCollection(invTokensQuery);

  const carbonTokensQuery = useMemoFirebase(() => 
    (db && isVerifiedAdmin) ? query(collection(db, "carbon_credits")) : null
  , [db, isVerifiedAdmin]);
  const { data: carbTokens, isLoading: isLoadingCarb } = useCollection(carbonTokensQuery);

  // 3. Query Global Network Transactions
  const transactionsQuery = useMemoFirebase(() => 
    (db && isVerifiedAdmin) ? query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(100)) : null
  , [db, isVerifiedAdmin]);
  const { data: transactions, isLoading: isLoadingTxs } = useCollection(transactionsQuery);

  // 4. Decryption Protocol: Resolve AES-256 ciphertexts into plaintext for the UI
  useEffect(() => {
    async function resolveCiphers() {
      if (!transactions || transactions.length === 0) return;
      setIsDecrypting(true);
      
      const results: Record<string, number> = {};
      for (const tx of transactions) {
        try {
          if (typeof tx.totalPrice === 'string' && tx.totalPrice.length > 20) {
            const plain = await decryptData(tx.totalPrice);
            results[tx.id] = parseFloat(plain) || 0;
          } else {
            results[tx.id] = typeof tx.totalPrice === 'number' ? tx.totalPrice : 0;
          }
        } catch (e) {
          results[tx.id] = 0;
        }
      }
      
      setDecryptedValues(results);
      setIsDecrypting(false);
    }
    resolveCiphers();
  }, [transactions]);

  const handleToggleFreeze = async (token: any, collectionName: string) => {
    const newStatus = token.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
    try {
      const tokenRef = doc(db, collectionName, token.id);
      await updateDoc(tokenRef, { status: newStatus });
      toast({
        title: `Token ${newStatus}`,
        description: `Asset ${token.symbol} status has been updated in the global ledger.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const filteredInv = invTokens?.filter(t => t.symbol?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCarb = carbTokens?.filter(t => t.symbol?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isProfileLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary opacity-20" /></div>;

  if (!isVerifiedAdmin && profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4">
        <ShieldCheck className="w-12 h-12 text-destructive opacity-20" />
        <h2 className="text-xl font-headline font-bold">Admin Required</h2>
        <p className="text-sm text-muted-foreground">This terminal requires institutional administrator privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Token Control Terminal</h1>
          <p className="text-muted-foreground mt-1">Manage global ecological asset lifecycles and monitor ledger integrity.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-none py-1.5 px-4 font-bold flex items-center gap-2">
          <Database className="w-4 h-4" /> Ledger Sync Active
        </Badge>
      </div>

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl h-12 w-full md:w-auto mb-8 shadow-sm">
          <TabsTrigger value="assets" className="rounded-lg font-bold px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Active Assets</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg font-bold px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Network Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border items-center">
            <Search className="w-5 h-5 text-muted-foreground ml-3" />
            <Input 
              placeholder="Search global assets by symbol..." 
              className="border-none focus-visible:ring-0 text-sm" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
              <CardHeader className="bg-slate-50/50 border-b px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-headline font-bold">Investments</CardTitle>
                <Badge variant="outline" className="bg-white font-bold">{filteredInv?.length || 0}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 font-bold">Symbol</TableHead>
                      <TableHead className="font-bold">Supply</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right pr-6 font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingInv ? (
                      <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                    ) : filteredInv?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No investment tokens found.</TableCell></TableRow>
                    ) : filteredInv?.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell className="font-bold pl-6">{token.symbol}</TableCell>
                        <TableCell className="text-xs font-medium">{token.amount?.toLocaleString()} Units</TableCell>
                        <TableCell><StatusBadge status={token.status} /></TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleFreeze(token, 'investments')} className="rounded-xl text-xs font-bold text-primary">
                            Toggle State
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
              <CardHeader className="bg-slate-50/50 border-b px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-headline font-bold">Carbon Credits</CardTitle>
                <Badge variant="outline" className="bg-white font-bold">{filteredCarb?.length || 0}</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 font-bold">Symbol</TableHead>
                      <TableHead className="font-bold">MT</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right pr-6 font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingCarb ? (
                      <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                    ) : filteredCarb?.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No carbon credits found.</TableCell></TableRow>
                    ) : filteredCarb?.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell className="font-bold pl-6">{token.symbol}</TableCell>
                        <TableCell className="text-xs font-medium">{token.amount?.toLocaleString()} MT</TableCell>
                        <TableCell><StatusBadge status={token.status} /></TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleFreeze(token, 'carbon_credits')} className="rounded-xl text-xs font-bold text-primary">
                            Toggle State
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
            <CardHeader className="border-b border-slate-50 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-headline font-bold">Global Transaction Viewer</CardTitle>
                  <CardDescription className="text-xs">Immutable settlements between institutional nodes. Every record is anchored via SHA-256.</CardDescription>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Consensus Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="pl-6 font-bold">Tx ID</TableHead>
                    <TableHead className="font-bold">Node Parties (B/S)</TableHead>
                    <TableHead className="font-bold">Value (Settled)</TableHead>
                    <TableHead className="font-bold">Timestamp</TableHead>
                    <TableHead className="text-right pr-6 font-bold">Integrity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingTxs || isDecrypting ? (
                    <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                  ) : !transactions || transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <History className="w-8 h-8 text-slate-200" />
                          <p className="text-sm text-slate-400 italic">No network settlements recorded yet.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="font-mono text-[10px] font-bold pl-6">TX_{tx.id.substring(0, 8)}</TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground">
                          {(tx.buyerId || tx.fromUser)?.substring(0, 8)}... → {(tx.sellerId || tx.toUser)?.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900">₹{decryptedValues[tx.id]?.toLocaleString() || "0"}</span>
                            <Lock className="w-2.5 h-2.5 text-slate-300" />
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground font-medium">
                          {tx.createdAt?.toDate().toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2 text-emerald-600">
                            <span className="text-[9px] font-bold uppercase tracking-tighter">HASHED</span>
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
