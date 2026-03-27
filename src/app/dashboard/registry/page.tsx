
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Search, 
  ShieldCheck, 
  Loader2, 
  Filter,
  Database
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

/**
 * @fileOverview Global Network Registry
 * Publicly visible directory of all land assets registered on the network.
 * Filtered to show ONLY APPROVED parcels.
 */
export default function GlobalRegistryPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  // UNIFIED SCHEMA: Query from top-level 'lands'
  const parcelsQuery = useMemoFirebase(() => 
    db ? query(collection(db, "lands"), where("status", "==", "APPROVED")) : null
  , [db]);
  
  const { data: parcels, isLoading } = useCollection(parcelsQuery);

  const filteredParcels = parcels?.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Network Registry</h1>
          <p className="text-muted-foreground mt-1">Consolidated view of all verified land assets across the Eco Ledger network.</p>
        </div>
        <Badge className="bg-slate-900 text-white border-none py-1.5 px-4 font-bold flex items-center gap-2 w-fit">
          <Database className="w-4 h-4 text-primary" /> Immutable Registry
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border ring-1 ring-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search approved assets..." 
            className="pl-10 border-none bg-transparent h-10 rounded-xl focus-visible:ring-0" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" className="gap-2 font-bold px-4 h-10 rounded-xl text-xs uppercase tracking-widest text-muted-foreground">
          <Filter className="w-3.5 h-3.5" /> Filter Assets
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="bg-slate-50/50 border-b px-6 py-4">
          <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Verified Ecological Reserves
          </CardTitle>
          <CardDescription className="text-xs">Real-time listing of digitized physical properties.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold pl-6">Parcel Name</TableHead>
                <TableHead className="font-bold">Institutional Owner</TableHead>
                <TableHead className="font-bold">Area</TableHead>
                <TableHead className="font-bold">Registry Status</TableHead>
                <TableHead className="text-right pr-6 font-bold">Integrity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
              ) : filteredParcels?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-64 text-center text-muted-foreground italic">No verified assets found in the network registry.</TableCell></TableRow>
              ) : filteredParcels?.map((parcel) => (
                <TableRow key={parcel.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="font-bold pl-6">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      {parcel.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-muted-foreground">{parcel.ownerId?.substring(0, 16)}...</TableCell>
                  <TableCell className="text-sm font-medium">{parcel.area?.toLocaleString()} {parcel.areaUnit}</TableCell>
                  <TableCell><StatusBadge status={parcel.status} /></TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant="outline" className="text-[8px] bg-emerald-50 text-emerald-700 border-emerald-100">SHA-256 HASHED</Badge>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
