
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, TreeDeciduous, TrendingUp, Lock, Globe, ArrowRight, Layers, BarChart3, Database, Leaf, CheckCircle2, Zap } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <TreeDeciduous className="text-white w-6 h-6" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Eco Ledger</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Link href="#impact" className="hover:text-primary transition-colors">Impact</Link>
            <Link href="/explorer" className="hover:text-primary transition-colors">Explorer</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-slate-600 text-sm">Access Node</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 rounded-xl px-8 h-12 font-bold shadow-xl shadow-primary/10 text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-20 items-center">
            <div className="z-10 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">Institutional Asset Protocol</span>
              </div>
              <h1 className="font-headline text-6xl lg:text-[5.5rem] font-bold leading-[1.05] text-slate-900">
                The Ledger for <span className="text-primary italic">Ecological</span> Assets
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                A high-security network for tokenizing real-world land assets and scaling global carbon credit trading through verifiable cryptography.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                <Link href="/register">
                  <Button size="lg" className="bg-primary px-10 text-lg font-bold h-16 rounded-2xl shadow-2xl shadow-primary/20 group">
                    Initialize Registration <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/whitepaper">
                  <Button size="lg" variant="outline" className="px-10 text-lg font-bold h-16 rounded-2xl border-slate-200 text-slate-600">
                    View Whitepaper
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-10 border-t border-slate-100 opacity-60">
                <TrustBadge icon={<Lock className="w-4 h-4" />} text="RSA-4096 SIGNED" />
                <TrustBadge icon={<ShieldCheck className="w-4 h-4" />} text="SHA-256 VERIFIED" />
                <TrustBadge icon={<Database className="w-4 h-4" />} text="IMMUTABLE LEDGER" />
              </div>
            </div>
            <div className="relative h-[500px] lg:h-[700px] rounded-[3rem] overflow-hidden shadow-[0_48px_100px_rgba(0,0,0,0.12)] border-[12px] border-white">
              {heroImage?.imageUrl && (
                <Image 
                  src={heroImage.imageUrl} 
                  alt="Sustainable Infrastructure" 
                  fill 
                  className="object-cover scale-105"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                    <TrendingUp className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Real-time Yield</p>
                    <p className="text-xl font-bold text-white">+14.2% ESG Return</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[72%]"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -mr-96 -mt-96"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl -ml-64 -mb-64"></div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-32 bg-slate-900 text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Global Impact Protocol</span>
                </div>
                <h2 className="text-5xl lg:text-6xl font-headline font-bold leading-tight">
                  Proof of <span className="text-primary italic">Ecological</span> Contribution.
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                  Our network doesn't just track investments; it mathematically proves the environmental impact of every transaction through multi-signature validation and real-time AI biometrics.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold font-headline text-white">420K+</div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Metric Tonnes Hashed</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold font-headline text-primary">12.4M</div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acres Digitized</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 space-y-8 relative z-10">
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <span className="font-bold text-lg">Verified Sequestration</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold">100% AUDITED</Badge>
                  </div>
                  <div className="space-y-6">
                    <ImpactMetricUI label="Amazonia Reserve #42" value="1,240 MT" progress={85} />
                    <ImpactMetricUI label="Highland Forest ECO-204" value="840 MT" progress={62} />
                    <ImpactMetricUI label="Coastal Mangrove Alpha" value="2,100 MT" progress={94} />
                  </div>
                  <div className="pt-6">
                    <Link href="/explorer">
                      <Button className="w-full h-14 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 group">
                        View Global Ledger <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Ecosystem */}
        <section id="features" className="py-32 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-20">
            <div className="space-y-4">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1 font-bold uppercase tracking-widest text-[10px]">Stakeholder Terminals</Badge>
              <h2 className="font-headline text-4xl lg:text-5xl font-bold text-slate-900">Unified Ecological Network</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                Dedicated interfaces for every network participant, protected by multi-signature protocols and automated compliance checking.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              <EcosystemCard 
                icon={<Layers className="w-8 h-8" />}
                role="Asset Owners"
                desc="Register physical land parcels and digitize carbon sequestration potential into verified ledger assets."
                color="bg-primary"
              />
              <EcosystemCard 
                icon={<BarChart3 className="w-8 h-8" />}
                role="Institutional Investors"
                desc="Access secondary market liquidity for ecological tokens with real-time quantitative performance tracking."
                color="bg-blue-600"
              />
              <EcosystemCard 
                icon={<Globe className="w-8 h-8" />}
                role="Industrial Compliance"
                desc="Automate ESG reporting and offset acquisition through cryptographically signed compliance dossiers."
                color="bg-slate-900"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <TreeDeciduous className="text-primary w-8 h-8" />
              <span className="font-headline text-2xl font-bold tracking-tight">Eco Ledger</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The institutional standard for real-world asset tokenization and carbon neutrality.
            </p>
          </div>
          <FooterColumn title="Network" links={["Marketplace", "Audit Node", "Ledger Explorer"]} />
          <FooterColumn title="Identity" links={["Registration", "Corporate Login", "Key Protocol"]} />
          <FooterColumn title="Legal" links={["Compliance", "Privacy", "Trade Standards"]} />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">© 2026 ECO LEDGER NETWORK v4.2</p>
          <div className="flex items-center gap-6">
            <ShieldCheck className="text-primary w-5 h-5" />
            <Lock className="text-slate-700 w-5 h-5" />
            <Globe className="text-slate-700 w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-slate-400">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{text}</span>
    </div>
  );
}

function EcosystemCard({ icon, role, desc, color }: { icon: React.ReactNode, role: string, desc: string, color: string }) {
  return (
    <div className="text-left p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:shadow-2xl transition-all duration-500 group">
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl", color)}>
        {icon}
      </div>
      <h3 className="font-headline text-2xl font-bold mb-4 text-slate-900">{role}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
      <div className="mt-8 pt-8 border-t border-slate-200/50 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Enter Terminal <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">{title}</h4>
      <ul className="space-y-4">
        {links.map(link => (
          <li key={link}><Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">{link}</Link></li>
        ))}
      </ul>
    </div>
  );
}

function ImpactMetricUI({ label, value, progress }: { label: string, value: string, progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-300">{label}</span>
        <span className="text-primary">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
