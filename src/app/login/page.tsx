"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TreeDeciduous, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Fingerprint, 
  Loader2, 
  Mail
} from 'lucide-react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/auth-service';

/**
 * @fileOverview Institutional Login Portal
 * Validates node credentials via salted SHA-256.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    try {
      const authService = new AuthService(db);
      const userData = await authService.authenticate(email, password);
      
      // Establish session directly using the hashed password as the secret
      await signInWithEmailAndPassword(auth, email, userData.password_hash);
      
      toast({
        title: "Session Established",
        description: "Cryptographic identity verified.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message || "Invalid credentials.",
      });
      setIsAuthenticating(false);
    }
  };

  const handleResetNode = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Email Required", description: "Enter network ID to reset." });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Reset Dispatched", description: "Secure link sent to network email." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Reset Failed", description: error.message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6">
      <div className="w-full max-w-[440px] space-y-10">
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="flex items-center gap-3 transition-transform active:scale-95">
            <div className="p-2.5 bg-primary rounded-2xl shadow-xl shadow-primary/20">
              <TreeDeciduous className="text-white w-8 h-8" />
            </div>
            <span className="font-headline text-[2.5rem] font-bold text-slate-900 tracking-tight leading-none">Eco Ledger</span>
          </Link>
        </div>
        
        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100 relative">
          <CardHeader className="space-y-2 text-center pt-10 pb-4">
            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-2">
              <Fingerprint className="text-primary w-6 h-6" />
            </div>
            <CardTitle className="text-[1.75rem] font-headline font-bold">Corporate Access</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-sm">
              Validated via Authentication Layer
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Network Identity</label>
                <Input 
                  type="email" 
                  placeholder="identity@corporation.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl h-14 bg-slate-50 border-slate-100 focus:bg-white transition-all font-semibold"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Access Key</label>
                  <button type="button" onClick={handleResetNode} className="text-[10px] font-bold text-primary hover:underline uppercase">
                    {isResetting ? "..." : "Reset Node"}
                  </button>
                </div>
                <Input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl h-14 bg-slate-50 border-slate-100 focus:bg-white transition-all"
                />
              </div>
              <Button type="submit" disabled={isAuthenticating} className="w-full bg-primary hover:bg-primary/90 h-14 text-base font-bold rounded-2xl mt-4 shadow-2xl shadow-primary/20 group">
                {isAuthenticating ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Secure Node Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-6 bg-slate-50/50 py-8 px-10 border-t border-slate-50">
            <div className="flex items-center justify-between w-full grayscale opacity-40">
              <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /><span className="text-[9px] font-bold tracking-widest uppercase">AES-256</span></div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /><span className="text-[9px] font-bold tracking-widest uppercase">SHA-256</span></div>
              <div className="flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5" /><span className="text-[9px] font-bold tracking-widest uppercase">RSA-4096</span></div>
            </div>
            <div className="text-xs text-center font-bold text-slate-400 uppercase tracking-widest">
              No Identity? <Link href="/register" className="text-primary hover:underline ml-1">Enroll Node</Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}