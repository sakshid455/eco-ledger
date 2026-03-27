
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  ArrowLeft, 
  Fingerprint, 
  Zap,
  ShieldAlert,
  Database,
  Key
} from "lucide-react";
import Link from "next/link";

/**
 * @fileOverview Eco Ledger Whitepaper
 * Provides an institutional overview of the project's technical architecture, 
 * tokenomics, and verification methodologies.
 */
export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-primary-foreground">
      {/* Abstract Header */}
      <div className="bg-slate-900 text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-white/5 mb-12 -ml-4 font-bold uppercase tracking-widest text-[10px]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Network
            </Button>
          </Link>
          <div className="space-y-6">
            <Badge className="bg-primary/20 text-primary border-none font-bold uppercase tracking-[0.2em] text-[10px] px-4 py-1.5">
              Protocol v4.2 Institutional Release
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold leading-tight">
              The Eco Ledger <span className="text-primary italic">Manifesto</span>.
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl font-medium">
              A comprehensive technical blueprint for real-world land asset tokenization and the creation of a trustless global carbon marketplace.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">
        {/* Abstract */}
        <section className="space-y-8">
          <SectionHeader number="01" title="Abstract" />
          <p className="text-lg text-slate-600 leading-relaxed">
            The global carbon market currently suffers from a "Trust Gap"—a lack of verifiable evidence linking financial credits to physical ecological impact. Eco Ledger solves this by creating an immutable bridge between high-resolution satellite imagery, AI-driven biomass analysis, and an institutional-grade cryptographic ledger.
          </p>
        </section>

        {/* Verification Engine */}
        <section className="space-y-12">
          <SectionHeader number="02" title="Verification Engine" />
          <div className="grid md:grid-cols-2 gap-8">
            <TechCard 
              icon={<Globe className="w-6 h-6 text-primary" />}
              title="Satellite Biometrics"
              desc="Real-time multi-spectral analysis from European Space Agency nodes provides continuous proof-of-state for all registered land parcels."
            />
            <TechCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="AI Sequestration Modeling"
              desc="Machine learning algorithms calculate biomass expansion and CO2 absorption with high accuracy, adjusted for regional soil profiles."
            />
          </div>
        </section>

        {/* Cryptographic Proofs */}
        <section className="space-y-8">
          <SectionHeader number="03" title="Cryptographic Blueprint" />
          <div className="grid gap-6">
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl shadow-sm w-fit">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-headline font-bold text-slate-900">Confidentiality: AES-256</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Financial data is secured using AES-256-GCM. This ensures that while the registry is public, specific commercial details like transaction prices remain encrypted and accessible only to authorized nodes.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl shadow-sm w-fit">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-headline font-bold text-slate-900">Integrity: SHA-256</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Every data entry is fingerprint-verified via SHA-256 hashing. Any modification to a record results in a hash mismatch, triggering an immediate network integrity alert.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl shadow-sm w-fit">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-headline font-bold text-slate-900">Authenticity: RSA-4096</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Non-repudiation is enforced through RSA-4096 digital signatures. All approvals and token transfers must be signed with a node's private key, mathematically proving the actor's identity.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-xl shadow-sm w-fit">
                  <Fingerprint className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-headline font-bold text-slate-900">Consensus: Merkle Trees</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Historical logs are organized into Merkle Trees. The root hash serves as a tamper-proof anchor for the global state, allowing for efficient verification of large datasets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tokenomics */}
        <section className="space-y-8">
          <SectionHeader number="04" title="Network Tokenomics" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l-4 border-primary pl-8 py-4 space-y-2">
              <h5 className="font-bold text-slate-900">Investment Tokens (INV)</h5>
              <p className="text-sm text-slate-500 italic">Equity-based asset representing physical property rights and fractional land ownership.</p>
            </div>
            <div className="border-l-4 border-secondary pl-8 py-4 space-y-2">
              <h5 className="font-bold text-slate-900">Carbon Tokens (CC)</h5>
              <p className="text-sm text-slate-500 italic">Utility-based asset representing 1 Metric Tonne of verified sequestered CO2e.</p>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="space-y-12">
          <SectionHeader number="05" title="Regulatory Standing" />
          <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden group">
            <div className="relative z-10 grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-none">AUDIT READY</Badge>
                <h4 className="text-3xl font-headline font-bold">Standardized for IFRS S2</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The Eco Ledger protocol is engineered to meet the stringent requirements of the International Sustainability Standards Board (ISSB). All reports are exportable as cryptographically signed artifacts for corporate disclosures.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <ShieldCheck className="w-32 h-32 text-primary opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" />
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
          </div>
        </section>

        {/* Call to action */}
        <footer className="pt-20 border-t border-slate-100 flex flex-col items-center gap-8 text-center pb-32">
          <div className="p-4 bg-slate-50 rounded-full">
            <ShieldAlert className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-bold text-slate-900">Secure the Network.</h3>
            <p className="text-slate-500 max-w-md">Initialize your node today and start your ecological contribution.</p>
          </div>
          <Link href="/register">
            <Button size="lg" className="rounded-2xl px-12 h-16 font-bold text-lg shadow-2xl shadow-primary/20">
              Enroll Node Now
            </Button>
          </Link>
        </footer>
      </div>
    </div>
  );
}

function SectionHeader({ number, title }: { number: string, title: string }) {
  return (
    <div className="flex items-center gap-6 mb-10">
      <div className="text-[10px] font-bold text-primary font-mono tracking-widest border border-primary/20 px-3 py-1 rounded-md bg-primary/5">
        {number}
      </div>
      <h2 className="text-3xl lg:text-4xl font-headline font-bold text-slate-900 tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-slate-100"></div>
    </div>
  );
}

function TechCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h4 className="text-lg font-headline font-bold text-slate-900 mb-3">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
