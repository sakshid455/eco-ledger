
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TreeDeciduous, 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Settings, 
  Factory, 
  Briefcase,
  Layers,
  Search,
  Database,
  Calculator,
  Lock,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const ROLE_NAV: Record<string, SidebarItem[]> = {
  landowner: [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', href: '/dashboard/landowner' },
    { icon: <TreeDeciduous size={18} />, label: 'My Land', href: '/dashboard/landowner/land' },
    { icon: <FileText size={18} />, label: 'Estimations', href: '/dashboard/landowner/estimations' },
    { icon: <Layers size={18} />, label: 'Token Issuance', href: '/dashboard/landowner/tokens' },
  ],
  investor: [
    { icon: <LayoutDashboard size={18} />, label: 'Overview', href: '/dashboard/investor' },
    { icon: <Briefcase size={18} />, label: 'Portfolio', href: '/dashboard/investor/portfolio' },
    { icon: <Search size={18} />, label: 'Marketplace', href: '/dashboard/investor/marketplace' },
    { icon: <TrendingUp size={18} />, label: 'ROI Analytics', href: '/dashboard/investor/analytics' },
    { icon: <FileText size={18} />, label: 'Transactions', href: '/dashboard/investor/transactions' },
  ],
  industry: [
    { icon: <LayoutDashboard size={18} />, label: 'Tracker', href: '/dashboard/industry' },
    { icon: <Factory size={18} />, label: 'Credits', href: '/dashboard/industry/credits' },
    { icon: <ShieldCheck size={18} />, label: 'Compliance', href: '/dashboard/industry/compliance' },
    { icon: <FileText size={18} />, label: 'Offset History', href: '/dashboard/industry/history' },
  ],
  admin: [
    { icon: <LayoutDashboard size={18} />, label: 'Admin Hub', href: '/dashboard/admin' },
    { icon: <ShieldCheck size={18} />, label: 'Land Verification', href: '/dashboard/admin/verify' },
    { icon: <Calculator size={18} />, label: 'Carbon Verification', href: '/dashboard/admin/carbon' },
    { icon: <Layers size={18} />, label: 'Tokenization', href: '/dashboard/admin/tokens' },
    { icon: <Database size={18} />, label: 'Audit Logs', href: '/dashboard/admin/audit' },
  ],
};

export function Sidebar({ role, isMobile }: { role: string; isMobile?: boolean }) {
  const pathname = usePathname();
  const navItems = ROLE_NAV[role] || [];

  return (
    <aside className={cn(
      "h-full flex flex-col bg-white border-r border-slate-200",
      !isMobile ? 'w-64' : 'w-full'
    )}>
      {/* Institutional Branding Container */}
      <div className="h-16 flex items-center gap-3 px-6 border-b bg-white shrink-0 overflow-hidden">
        <div className="p-1.5 bg-primary rounded-lg shadow-sm shadow-primary/20 shrink-0">
          <TreeDeciduous className="text-white w-5 h-5" />
        </div>
        <span className="font-headline text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          Eco Ledger
        </span>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-8 px-4 space-y-10">
        <nav className="space-y-1.5">
          <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Navigation Terminal</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group",
                  isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className={cn(
                  "transition-colors",
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                )}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1.5">
          <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Trust & Identity</div>
          <SidebarLink 
            href="/dashboard/certificates" 
            icon={<ShieldCheck size={18} />} 
            label="Compliance Proofs" 
            active={pathname === '/dashboard/certificates'} 
          />
          <SidebarLink 
            href="/dashboard/settings" 
            icon={<Settings size={18} />} 
            label="Node Settings" 
            active={pathname === '/dashboard/settings'} 
          />
        </div>
      </div>

      {/* Fixed System Status Footer */}
      <div className="p-5 border-t bg-slate-50/50 shrink-0">
        <div className="bg-slate-900 rounded-2xl p-4 shadow-lg border border-white/5 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-[0.15em] mb-2">
              <Lock className="w-3 h-3" /> System Integrity
            </div>
            <div className="text-[11px] font-bold text-white leading-tight">AES-256 Enabled</div>
            <div className="text-[9px] text-slate-400 mt-1 font-medium italic">Continuous Audit Active</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500"></div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group",
        active
        ? 'bg-primary text-white shadow-xl shadow-primary/20' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <div className={cn(
        "transition-colors",
        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
      )}>
        {icon}
      </div>
      {label}
    </Link>
  );
}
