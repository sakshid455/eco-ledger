
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  UserCircle, 
  ShieldCheck, 
  Bell, 
  Lock, 
  Loader2, 
  Save, 
  Mail, 
  Key, 
  Fingerprint,
  Copy,
  AlertTriangle,
  Cpu,
  Database,
  ShieldAlert
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { user: authUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => (authUser ? doc(db, "users", authUser.uid) : null), [db, authUser]);
  const { data: profile, isLoading } = useDoc(userDocRef);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.name?.split(' ')[0] || "",
        lastName: profile.name?.split(' ').slice(1).join(' ') || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!authUser || !userDocRef) return;
    setIsSaving(true);

    try {
      await updateDoc(userDocRef, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
      });

      toast({
        title: "Profile Updated",
        description: "Your information has been successfully saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save your changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePreference = async (key: string, value: boolean) => {
    if (!authUser || !userDocRef) return;
    
    try {
      await updateDoc(userDocRef, {
        [`preferences.${key}`]: value
      });
      
      toast({
        title: "Preference Updated",
        description: `Network setting for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been committed.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Protocol Error",
        description: "Failed to update node preferences.",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} has been copied.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const preferences = profile?.preferences || {
    emailNotifications: true,
    marketplaceAlerts: true,
    twoFactorAuth: true
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Security & Identity</h1>
          <p className="text-muted-foreground mt-1">Manage your cryptographic profile and session integrity.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 py-1.5 px-4 font-bold flex items-center gap-2 w-fit">
          <ShieldCheck className="w-4 h-4" /> Account Verified
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl h-11 w-full md:w-auto justify-start gap-1 mb-8 shadow-sm">
          <TabsTrigger value="profile" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Profile</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Security & Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-10 animate-in fade-in duration-300">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              {/* Profile Information */}
              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
                <CardHeader className="border-b bg-slate-50/50 px-8 py-6">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl font-headline font-bold">Personal Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                      <Input 
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="rounded-2xl h-12 border-slate-200 focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                      <Input 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="rounded-2xl h-12 border-slate-200 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address (Immutable)</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={profile?.email} disabled className="pl-11 rounded-2xl h-12 bg-slate-50 border-slate-100 opacity-70 font-medium" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="rounded-2xl font-bold h-12 px-10 bg-primary shadow-lg shadow-primary/10">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Profile Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences Section - Based on your reference image */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-headline font-bold text-slate-900">Preferences</h3>
                </div>
                <div className="grid gap-4">
                  <PreferenceToggle 
                    label="Email Notifications" 
                    desc="Weekly summary of asset growth and compliance." 
                    checked={preferences.emailNotifications}
                    onCheckedChange={(val) => handleUpdatePreference('emailNotifications', val)}
                  />
                  <PreferenceToggle 
                    label="Marketplace Alerts" 
                    desc="Real-time notifications for new tokenized land listings." 
                    checked={preferences.marketplaceAlerts}
                    onCheckedChange={(val) => handleUpdatePreference('marketplaceAlerts', val)}
                  />
                  <PreferenceToggle 
                    label="Two-Factor Authentication (2FA)" 
                    desc="Requires biometric or hardware key for all signing events." 
                    checked={preferences.twoFactorAuth}
                    onCheckedChange={(val) => handleUpdatePreference('twoFactorAuth', val)}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white overflow-hidden relative group">
                <CardContent className="p-10 relative z-10">
                  <div className="p-4 bg-white/10 rounded-[1.5rem] w-fit mb-8 border border-white/10">
                    <Fingerprint className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-3">Institutional ID</h3>
                  <p className="text-slate-400 leading-relaxed mb-8">
                    Your account is assigned the <span className="text-white font-bold uppercase tracking-widest">{profile?.role}</span> role, granting you specific permissions within the Eco Ledger network.
                  </p>
                  <div className="pt-8 border-t border-white/10 space-y-5">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>Node Identity</span>
                      <span className="text-slate-300">#{authUser?.uid.substring(0, 8)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>Security Level</span>
                      <span className="text-primary font-bold">Tier 3 (Enterprise)</span>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 animate-in fade-in duration-300">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white ring-1 ring-slate-100">
                <CardHeader className="bg-slate-50/50 border-b p-8">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg font-headline font-bold">Institutional Public Key</CardTitle>
                  </div>
                  <CardDescription>This SPKI identifier is visible to the network for signature verification.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 font-mono text-[11px] break-all leading-relaxed text-slate-600 relative group">
                    <div className="mb-2 font-bold text-slate-400">---BEGIN RSA PUBLIC KEY---</div>
                    {profile?.publicKey || "NO_PUBLIC_KEY_DETECTED"}
                    <div className="mt-2 font-bold text-slate-400">---END RSA PUBLIC KEY---</div>
                    <button 
                      onClick={() => copyToClipboard(profile?.publicKey || "", "Public Key")}
                      className="absolute top-6 right-6 p-3 bg-white shadow-xl border rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
                    >
                      <Copy className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                  
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-5">
                    <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                      <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-amber-900">Private Key Status: Non-Custodial</h4>
                      <p className="text-xs text-amber-800/70 leading-relaxed max-w-lg">
                        Eco Ledger uses non-custodial security. Your <strong>Private Key</strong> is never stored on our servers. Only you hold the authority to sign and decrypt your asset data.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <ProtocolCard icon={<ShieldCheck className="w-5 h-5" />} title="SHA-256 Hashing" role="Integrity" desc="Tamper-evident fingerprints for all records." />
                <ProtocolCard icon={<Lock className="w-5 h-5" />} title="AES-256-GCM" role="Privacy" desc="Confidentiality for sensitive financial data." />
                <ProtocolCard icon={<Cpu className="w-5 h-5" />} title="RSA-4096 Signatures" role="Authenticity" desc="Non-repudiable proof of action." />
                <ProtocolCard icon={<Database className="w-5 h-5" />} title="Merkle State" role="Consensus" desc="Efficient global state verification." />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-sm rounded-[3rem] bg-slate-900 text-white p-10 relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-[0.25em]">
                    <ShieldAlert className="w-6 h-6" /> Protocol Health
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Ledger Sync</span>
                      <span className="text-emerald-400">OPTIMAL</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Encryption Level</span>
                      <span className="text-emerald-400">256-BIT</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-slate-500">Consensus Root</span>
                      <span className="text-emerald-400">VERIFIED</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-500 leading-relaxed italic font-medium">
                      Continuous audit active. Every state change is anchored to the global Merkle root via your institutional node.
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-[80px]"></div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PreferenceToggle({ label, desc, checked, onCheckedChange }: { label: string, desc: string, checked: boolean, onCheckedChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 group">
      <div className="space-y-1.5">
        <div className="text-lg font-bold text-slate-900 font-headline leading-none">{label}</div>
        <div className="text-sm text-slate-500 font-medium">{desc}</div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
        className="data-[state=checked]:bg-primary h-7 w-12" 
      />
    </div>
  );
}

function ProtocolCard({ icon, title, role, desc }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] border bg-white shadow-sm space-y-4 group hover:border-primary/30 hover:shadow-xl transition-all duration-500">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-slate-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">{icon}</div>
        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-100 bg-slate-50/50">{role}</Badge>
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}
