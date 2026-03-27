
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Eye, 
  Loader2, 
  ShieldCheck,
  ImageIcon,
  Trash2,
  Ruler,
  Calendar,
  Hash,
  Fingerprint,
  MapPin,
  Lock,
  Key,
  Copy,
  AlertCircle
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import { ApiGateway } from "@/services/api-gateway";

/**
 * @fileOverview Land Management Terminal
 * Allows landowners to register assets and view anchored cryptographic proofs.
 */
export default function LandManagementPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({ 
    name: "", 
    location: "", 
    area: "", 
    areaUnit: "acres",
    description: "",
    surveyNumber: "",
    soilType: "",
    vegetation: "",
    latitude: "",
    longitude: "",
    imageUrl: ""
  });

  const landsQuery = useMemoFirebase(() => 
    user ? query(collection(db, "lands"), where("ownerId", "==", user.uid)) : null
  , [db, user]);
  const { data: lands, isLoading } = useCollection(landsQuery);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLand = async () => {
    if (!user || !db) return;
    try {
      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('REGISTER_LAND', formData);
      
      toast({ title: "Land Registered", description: "Your asset is PENDING administrative verification." });
      setIsAdding(false);
      setFormData({ name: "", location: "", area: "", areaUnit: "acres", description: "", surveyNumber: "", soilType: "", vegetation: "", latitude: "", longitude: "", imageUrl: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteLand = async (landId: string) => {
    if (!user || !db) return;
    setIsDeleting(landId);
    try {
      const gateway = new ApiGateway(db, user.uid);
      await gateway.dispatch('DELETE_LAND', { parcelId: landId });
      toast({ title: "Asset Removed", description: "Land record deleted successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsDeleting(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Land Registry</h1>
          <p className="text-muted-foreground mt-1">Manage and register your land assets for carbon projects.</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-bold flex items-center gap-2 h-11 px-6 shadow-lg shadow-primary/10">
              <Plus className="w-4 h-4" /> Register New Land
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-3xl border-none shadow-2xl overflow-hidden p-0">
            <DialogHeader className="p-8 bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                <DialogTitle className="text-2xl font-headline font-bold">Land Registration</DialogTitle>
                <DialogDescription className="text-slate-400">Submit property metadata for network enrollment.</DialogDescription>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            </DialogHeader>
            
            <div className="grid gap-6 p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Property Images</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                    formData.imageUrl ? "border-primary/50" : "border-slate-200 hover:border-primary/30"
                  )}
                >
                  {formData.imageUrl ? (
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                      <p className="text-xs font-bold">Upload Image</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Land Name</Label>
                  <Input placeholder="Green Valley Farm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Survey Number</Label>
                  <Input placeholder="SN-1023" value={formData.surveyNumber} onChange={(e) => setFormData({...formData, surveyNumber: e.target.value})} className="rounded-xl h-12" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Location (City/State)</Label>
                  <Input placeholder="Pune, Maharashtra" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Area (Acres)</Label>
                  <Input type="number" placeholder="5" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="rounded-xl h-12" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Soil Type</Label>
                  <Input placeholder="Black Soil" value={formData.soilType} onChange={(e) => setFormData({...formData, soilType: e.target.value})} className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Vegetation</Label>
                  <Input placeholder="Forest / Crop" value={formData.vegetation} onChange={(e) => setFormData({...formData, vegetation: e.target.value})} className="rounded-xl h-12" />
                </div>
              </div>

              <Button onClick={handleAddLand} className="w-full font-bold h-14 rounded-2xl bg-primary hover:bg-primary/90 mt-4">
                Submit Registration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary opacity-20" /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {lands?.map((land) => (
            <Card key={land.id} className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100 flex flex-col group">
              <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                <Image 
                  src={land.images?.[0] || `https://picsum.photos/seed/${land.id}/600/400`} 
                  alt={land.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-all duration-1000" 
                />
                <div className="absolute top-5 left-5"><StatusBadge status={land.status} /></div>
                <div className="absolute bottom-5 left-6 right-6 text-white drop-shadow-md">
                  <p className="text-[10px] font-bold uppercase opacity-80 mb-1">{land.area} {land.areaUnit}</p>
                  <h3 className="font-headline font-bold text-2xl truncate">{land.name}</h3>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Integrity Proof</p>
                    <div className="flex items-center gap-2">
                      {land.authoritySignature ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] h-5 font-bold">SIGNED</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[8px] h-5 font-bold text-slate-400">HASHED</Badge>
                      )}
                      <p className="text-[10px] font-mono text-slate-500 truncate w-24">{land.integrityHash}</p>
                    </div>
                  </div>
                  <ShieldCheck className={cn("w-5 h-5", land.authoritySignature ? "text-emerald-500" : "text-slate-200")} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setSelectedLand(land)} className="flex-1 h-12 rounded-xl font-bold bg-primary/5 text-primary hover:bg-primary/10 border-none shadow-none">
                    <Eye className="w-4 h-4 mr-2" /> Details & Proofs
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="h-12 w-12 rounded-xl text-rose-600 p-0 border-slate-100 hover:bg-rose-50 hover:border-rose-100">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Land Asset?</AlertDialogTitle>
                        <AlertDialogDescription>This action will permanently delete '{land.name}' from the registry node.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLand(land.id)} className="bg-rose-600 rounded-xl">Confirm Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selectedLand} onOpenChange={() => setSelectedLand(null)}>
        <SheetContent side="right" className="sm:max-w-2xl bg-slate-50 p-0 border-none shadow-2xl overflow-y-auto">
          <SheetHeader className="p-12 bg-slate-900 text-white relative overflow-hidden">
            <Badge className="bg-primary/20 text-primary border-none mb-4 font-bold text-[10px] uppercase tracking-widest relative z-10 w-fit">Property Node</Badge>
            <SheetTitle className="text-4xl font-headline font-bold text-white leading-tight relative z-10">{selectedLand?.name}</SheetTitle>
            <SheetDescription className="text-slate-400 flex items-center gap-2 mt-3 font-mono text-sm relative z-10">
              ID: {selectedLand?.id}
            </SheetDescription>
            <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          </SheetHeader>
          
          {selectedLand && (
            <div className="px-10 py-12 space-y-10">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem icon={<Ruler className="w-4 h-4" />} label="Total Area" value={`${selectedLand.area} ${selectedLand.areaUnit}`} />
                <DetailItem icon={<MapPin className="w-4 h-4" />} label="Coordinates" value={`${selectedLand.latitude || 0}, ${selectedLand.longitude || 0}`} />
                <DetailItem icon={<Fingerprint className="w-4 h-4" />} label="Status" value={selectedLand.status} />
                <DetailItem icon={<Calendar className="w-4 h-4" />} label="Registered" value={selectedLand.createdAt?.toDate().toLocaleDateString()} />
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Location Details</Label>
                  <p className="text-sm font-medium text-slate-700">{selectedLand.location}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Soil & Vegetation</Label>
                  <p className="text-sm font-medium text-slate-700">{selectedLand.soilType} • {selectedLand.vegetation}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-headline font-bold flex items-center gap-2 text-slate-800">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Cryptographic Integrity Engine
                </h3>
                
                <div className="space-y-4">
                  {/* DOCUMENT HASH */}
                  <Card className="p-6 bg-white border rounded-2xl shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                          <Hash className="w-3 h-3" /> Integrity Hash (SHA-256)
                        </Label>
                        <button onClick={() => copyToClipboard(selectedLand.integrityHash, "Hash")} className="p-1 hover:bg-slate-100 rounded transition-colors">
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl font-mono text-[10px] break-all border text-slate-600 leading-relaxed">
                        {selectedLand.integrityHash}
                      </div>
                    </div>
                  </Card>

                  {/* AUTHORITY SIGNATURE */}
                  {selectedLand.authoritySignature ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <Card className="p-6 bg-emerald-50/50 border-emerald-100 rounded-2xl shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-bold uppercase text-emerald-700 flex items-center gap-2">
                              <Lock className="w-3 h-3" /> Authority Digital Signature (RSA-4096)
                            </Label>
                            <button onClick={() => copyToClipboard(selectedLand.authoritySignature, "Signature")} className="p-1 hover:bg-white/50 rounded transition-colors">
                              <Copy className="w-3 h-3 text-emerald-400" />
                            </button>
                          </div>
                          <div className="p-3 bg-white/80 rounded-xl font-mono text-[9px] break-all border border-emerald-100 text-emerald-800 leading-tight">
                            {selectedLand.authoritySignature}
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 bg-white border rounded-2xl shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                              <Key className="w-3 h-3" /> Administrator Public Key
                            </Label>
                            <button onClick={() => copyToClipboard(selectedLand.authorityPublicKey, "Public Key")} className="p-1 hover:bg-slate-100 rounded transition-colors">
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl font-mono text-[9px] break-all border text-slate-500 leading-tight h-24 overflow-y-auto custom-scrollbar">
                            {selectedLand.authorityPublicKey}
                          </div>
                        </div>
                      </Card>
                    </div>
                  ) : selectedLand.status === 'APPROVED' ? (
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center justify-center text-center gap-3">
                      <AlertCircle className="w-8 h-8 text-amber-400" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Signature Pending</p>
                        <p className="text-[10px] text-amber-600/80 max-w-[240px]">This asset is approved but lacks a cryptographic signature. Contact an Administrator to re-sign this parcel for full proof-of-state.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-100 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center gap-3 grayscale opacity-60">
                      <Lock className="w-8 h-8 text-slate-300" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Verification</p>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">Once an administrator verifies this parcel, your digital signature proof will be anchored here.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm space-y-1">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[9px] font-bold uppercase text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
