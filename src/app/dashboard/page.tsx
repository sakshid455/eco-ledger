
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Dashboard Root Entry
 * Handles the initial entry into the dashboard area and redirects users
 * to their specific role-based terminal.
 */
export default function DashboardRootPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Fetch user profile to determine the correct redirection path
  const userDocRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
      return;
    }

    if (profile && profile.role) {
      router.replace(`/dashboard/${profile.role}`);
    }
  }, [user, isUserLoading, profile, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] animate-pulse">Establishing Node Connection...</span>
      </div>
    </div>
  );
}
