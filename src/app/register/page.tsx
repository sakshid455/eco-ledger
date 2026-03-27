"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TreeDeciduous, 
  ArrowRight, 
  ArrowLeft, 
  Fingerprint,
  UserCog,
  Loader2,
  Coins,
  Factory,
  Copy,
  AlertTriangle,
  Download,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { generateNodeKeyPair, generateSalt, hashPassword, type NodeKeyPair } from '@/lib/crypto';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type UserRole = 'landowner' | 'investor' | 'industry' | 'admin';

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | "">("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [keyPair, setKeyPair] = useState<NodeKeyPair | null>(null);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInitializeNode = async () => {
    if (!role) return;
    setLoading(true);
    
    try {
      const generatedKeys = await generateNodeKeyPair();
      setKeyPair(generatedKeys);
      setStep(3);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Key Generation Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadKey = () => {
    if (!keyPair) return;
    
    const element = document.createElement("a");
    const file = new Blob([keyPair.privateKey], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `eco_ledger_private_key_${email.replace(/[^a-z0-9]/gi, '_')}.pem`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setIsDownloaded(true);
    toast({ 
      title: "Key Downloaded", 
      description: "Institutional credentials saved. Enrollment button activated." 
    });
  };

  const handleCompleteEnrollment = async () => {
    if (!keyPair || !role || !isDownloaded) return;
    setLoading(true);

    try {
      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);
      const userCredential = await createUserWithEmailAndPassword(auth, email, hashedPassword);
      const finalUser = userCredential.user;
      
      // Save profile with custom auth details
      await setDoc(doc(db, 'users', finalUser.uid), {
        id: finalUser.uid,
        name: fullName,
        email: email,
        role: role,
        verified: true,
        createdAt: serverTimestamp(),
        registrationDate: serverTimestamp(),
        publicKey: keyPair.publicKey,
        password_hash: hashedPassword,
        salt: salt,
        protocol: "RSA-4096 + SHA-256 (v4.2)",
        authType: "password",
        preferences: {
          twoFactorAuth: false,
          emailNotifications: true,
          marketplaceAlerts: true
        }
      });

      toast({ title: "Node Initialized", description: "Cryptographic identity confirmed." });
      router.push(`/dashboard/${role}`);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Enrollment Error", description: error.message });
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} has been copied to your clipboard.` });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center gap-4 mb-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg">
              <TreeDeciduous className="text-white w-6 h-6" />
            </div>
            <span className="font-headline text-2xl font-bold text-slate-900">Eco Ledger</span>
          </Link>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
          <CardHeader className="text-center pt-10 pb-4">
            <CardTitle className="text-2xl font-headline font-bold uppercase tracking-tight">
              {step === 1 ? "Identity" : step === 2 ? "Protocol Role" : "Security Keys"}
            </CardTitle>
            <CardDescription>
              {step === 1 ? "Start your institutional enrollment" : step === 2 ? "Select your network function" : "Non-custodial identity generated"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 pb-10">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <Input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-2xl h-14" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                  <Input type="email" placeholder="identity@corporation.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-2xl h-14" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Access Key</label>
                  <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl h-14" />
                </div>
                <Button disabled={!fullName || !email || !password || loading} onClick={() => setStep(2)} className="w-full h-14 rounded-2xl mt-4 font-bold bg-primary shadow-xl shadow-primary/10 group">
                  <Mail className="mr-2 w-4 h-4" /> Continue Enrollment <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-2 gap-4">
                  <RoleBtn active={role === 'landowner'} icon={<TreeDeciduous />} title="Landowner" onClick={() => setRole('landowner')} />
                  <RoleBtn active={role === 'investor'} icon={<Coins />} title="Investor" onClick={() => setRole('investor')} />
                  <RoleBtn active={role === 'industry'} icon={<Factory />} title="Industry" onClick={() => setRole('industry')} />
                  <RoleBtn active={role === 'admin'} icon={<UserCog />} title="Admin" onClick={() => setRole('admin')} />
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-bold">Back</Button>
                  <Button disabled={!role || loading} onClick={handleInitializeNode} className="flex-[2] h-14 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/10">
                    {loading ? <Loader2 className="animate-spin" /> : "Initialize Node Keys"}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && keyPair && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-rose-900 leading-none">Security Requirement</h4>
                    <p className="text-[11px] text-rose-800/70 leading-relaxed">
                      Download and copy your <strong>Private Key</strong>. Access to the network will be granted only after the key is saved.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RSA Private Key (.PEM)</Label>
                      <button onClick={() => copyToClipboard(keyPair.privateKey, "Private Key")} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                        <Copy className="w-3 h-3" /> Copy Key
                      </button>
                    </div>
                    <Textarea 
                      readOnly 
                      value={keyPair.privateKey} 
                      className="font-mono text-[9px] h-48 bg-slate-50 border-slate-200 rounded-2xl leading-tight resize-none"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Button 
                      onClick={handleDownloadKey}
                      variant={isDownloaded ? "outline" : "default"}
                      className={cn(
                        "w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2",
                        isDownloaded && "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      )}
                    >
                      {isDownloaded ? (
                        <><CheckCircle2 className="w-5 h-5" /> Key Saved to Disk</>
                      ) : (
                        <><Download className="w-5 h-5" /> Download Private Key</>
                      )}
                    </Button>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="confirm" 
                          checked={keyConfirmed} 
                          onChange={(e) => setKeyConfirmed(e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="confirm" className="text-xs font-medium text-slate-600 select-none">
                          I have securely saved my Private Key and understand it cannot be recovered.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  disabled={!keyConfirmed || !isDownloaded || loading} 
                  onClick={handleCompleteEnrollment} 
                  className="w-full h-16 rounded-2xl font-bold text-lg bg-slate-900 hover:bg-slate-800 shadow-2xl transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Complete Enrollment & Join Network"}
                </Button>
              </div>
            )}
          </CardContent>
          {step < 3 && (
            <CardFooter className="bg-slate-50/50 py-6 px-10 border-t flex items-center justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Already registered? <Link href="/login" className="text-primary hover:underline ml-1">Access Node</Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

function RoleBtn({ active, icon, title, onClick }: any) {
  return (
    <button onClick={onClick} className={cn(
      "p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all",
      active ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200"
    )}>
      <div className={cn("p-3 rounded-xl", active ? "bg-primary text-white" : "bg-slate-50")}>{icon}</div>
      <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
    </button>
  );
}