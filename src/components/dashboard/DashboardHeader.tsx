
"use client";

import { useState, useMemo } from "react";
import { Bell, Menu, Search, ShieldCheck, Lock, LogOut, Settings, TreeDeciduous, CheckCircle2, Coins, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { collection, query, where, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Dashboard Header
 * Standard navigation header with user profile controls and real-time notification node.
 */
export function DashboardHeader({ userProfile, onMenuClick }: { userProfile: any; onMenuClick?: () => void }) {
  const auth = useAuth();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // --- Real-time Notification Logic ---
  
  // 1. Listen for Approved Lands (Flat Schema)
  const landParcelsQuery = useMemoFirebase(() => 
    (db && user && userProfile?.role === 'landowner') 
      ? query(collection(db, "lands"), where("ownerId", "==", user.uid), where("status", "==", "APPROVED"), limit(5))
      : null
  , [db, user, userProfile]);
  const { data: verifiedParcels } = useCollection(landParcelsQuery);

  // 2. Listen for Sales
  const investmentQuery = useMemoFirebase(() => 
    (db && user && userProfile?.role === 'landowner')
      ? query(collection(db, "transactions"), where("toUser", "==", user.uid), limit(10))
      : null
  , [db, user, userProfile]);
  const { data: rawSales } = useCollection(investmentQuery);

  const notifications = useMemo(() => {
    const list: any[] = [];
    
    verifiedParcels?.forEach(p => {
      list.push({
        id: `ver-${p.id}`,
        title: "Land Verified",
        desc: `Asset '${p.name}' has been approved by the network authority.`,
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        date: p.verifiedAt?.toDate() || new Date(),
        type: 'verification'
      });
    });

    const sortedSales = rawSales 
      ? [...rawSales].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      : [];

    sortedSales.slice(0, 5).forEach(s => {
      list.push({
        id: `sale-${s.id}`,
        title: "New Transaction",
        desc: `A node has performed a settlement for your asset.`,
        icon: <Coins className="w-4 h-4 text-primary" />,
        date: s.createdAt?.toDate() || new Date(),
        type: 'investment'
      });
    });

    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [verifiedParcels, rawSales]);

  // Compute initials for the avatar fallback - Enhanced for exact character match
  const userInitials = useMemo(() => {
    const primaryName = userProfile?.name || userProfile?.email || "U";
    const trimmed = primaryName.trim();
    if (!trimmed) return "U";
    
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return trimmed.charAt(0).toUpperCase();
  }, [userProfile?.name, userProfile?.email]);

  const hasUnread = notifications.length > 0;

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden shrink-0 h-10 w-10 rounded-xl" 
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
        
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search network assets..." 
            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-1 focus-visible:ring-primary/20 w-full text-sm"
          />
        </div>

        <div className="sm:hidden flex items-center gap-2">
          <TreeDeciduous className="text-primary w-6 h-6" />
          <span className="font-headline text-base font-bold text-primary truncate whitespace-nowrap">Eco Ledger</span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl relative transition-all active:scale-95 group">
              <Bell className={cn("w-5 h-5", hasUnread && "text-primary animate-pulse")} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 rounded-2xl shadow-2xl border-none mt-2 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest">Network Alerts</h4>
                <Badge variant="outline" className="bg-primary/20 text-primary border-none text-[9px]">{notifications.length}</Badge>
              </div>
            </div>
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar bg-white">
              {notifications.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <Bell className="w-8 h-8 text-slate-100 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry is Quiet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                    <div className="flex gap-3">
                      <div className="mt-0.5">{n.icon}</div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 leading-tight">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{n.desc}</p>
                        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase tracking-tight pt-1">
                          <Clock className="w-2.5 h-2.5" />
                          {n.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-all focus:outline-none">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold leading-none text-slate-900">{userProfile?.name || userProfile?.email}</div>
                <Badge variant="outline" className="text-[9px] font-bold text-primary uppercase tracking-wider mt-1.5 border-primary/10 bg-primary/5 px-1.5 py-0 h-4">
                  {userProfile?.role}
                </Badge>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-primary/10">
                <AvatarFallback className="bg-primary text-white font-bold text-sm uppercase">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl p-2 border-none mt-3">
            <DropdownMenuLabel className="flex items-center gap-2 px-3 py-3 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
              <Lock className="w-3 h-3" /> Secure Access
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50 mx-2" />
            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-3 text-sm font-semibold text-slate-700" onClick={() => router.push('/dashboard/settings')}>
              <Settings className="w-4 h-4 mr-3 text-slate-400" /> Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer px-3 py-3 text-sm font-semibold text-slate-700" onClick={() => router.push('/dashboard/certificates')}>
              <ShieldCheck className="w-4 h-4 mr-3 text-slate-400" /> Verifiable Keys
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-50 mx-2" />
            <DropdownMenuItem 
              className="rounded-xl cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600 px-3 py-3 text-sm font-bold"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" /> Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
