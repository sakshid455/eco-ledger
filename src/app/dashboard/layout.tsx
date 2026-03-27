
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';

/**
 * @fileOverview Secure Dashboard Shell & Fixed Layout Guard
 * Enforces role-based path isolation and provides a strictly fixed navigation terminal.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch institutional profile to determine authorized node
  const userDocRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    // 1. Authenticated Protocol Check
    if (!isUserLoading && !user) {
      router.replace('/login');
      return;
    }

    // 2. Role-Based Path Isolation
    if (profile && profile.role) {
      const roleHome = `/dashboard/${profile.role}`;
      
      // Define paths that are accessible by ALL authenticated roles
      const sharedPaths = [
        '/dashboard/settings', 
        '/dashboard/certificates', 
      ];
      
      const isShared = sharedPaths.includes(pathname);

      const isWrongNode = !pathname.startsWith(roleHome) && !isShared;
      const isRootPath = pathname === '/dashboard';

      if (isWrongNode || isRootPath) {
        router.replace(roleHome);
      }
    }
  }, [user, isUserLoading, profile, pathname, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] animate-pulse">Verifying Network Access...</span>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* STRICTLY FIXED DESKTOP SIDEBAR */}
      <div className="hidden lg:block lg:w-64 lg:shrink-0 relative">
        <div className="fixed inset-y-0 left-0 w-64 z-40 bg-white border-r border-slate-200">
          <Sidebar role={profile.role} />
        </div>
      </div>

      {/* Mobile Terminal Navigation */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px] border-none shadow-2xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Terminal Navigation</SheetTitle>
            <SheetDescription>Access network tools.</SheetDescription>
          </SheetHeader>
          <Sidebar role={profile.role} isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content Node - Independent Scroll */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DashboardHeader 
          userProfile={profile} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
