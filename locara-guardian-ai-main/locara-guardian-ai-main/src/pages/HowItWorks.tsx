import { motion } from "framer-motion";
import {
  FileText, Shield, Users, Bell, CheckCircle, Lock,
  EyeOff, Database, ArrowRight, ShieldCheck
} from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Smart Reporting",
      desc: "Submit a structured report with GPS, description, and evidence. Choose to remain anonymous with one click.",
      color: "text-rose",
      bgColor: "bg-rose/10"
    },
    {
      icon: Shield,
      title: "Identity Masking",
      desc: "Our neural network encrypts your PII (Personally Identifiable Information) before it reaches the server.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Users,
      title: "Authority Verification",
      desc: "Regional command centers review the report. Fake report detection AI flags suspicious patterns.",
      color: "text-midnight",
      bgColor: "bg-midnight/10"
    },
    {
      icon: Bell,
      title: "Transparent Action",
      desc: "Track real-time status as authorities move from 'Under Review' to 'Action Taken'. Receive secure updates.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  const techFeatures = [
    { icon: EyeOff, title: "Anonymity Engine", content: "Zero-knowledge proofs ensure your data can't be traced back to you if you report anonymously." },
    { icon: Database, title: "Immutable Audit Log", content: "Every action taken by authorities is logged on a secure ledger for public transparency." },
    { icon: Lock, title: "Military-Grade AES", content: "All media evidence (images/videos) is encrypted at rest using AES-256 standards." }
  ];

  return (
    <div className="min-h-screen pt-28 pb-12 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <AnimatedSection>
          <div className="text-center mb-20">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Process Architecture</span>
            <h1 className="mt-6 font-heading text-5xl font-bold text-foreground md:text-7xl tracking-tight">
              How <span className="gradient-text">SafeCity AI</span> Works
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              A seamless, secure, and transparent bridge between citizens and public safety authorities.
            </p>
          </div>
        </AnimatedSection>

        {/* Stepper */}
        <div className="relative mb-32">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2 hidden md:block" />
          <div className="space-y-24 relative">
            {steps.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 0.1}>
                <div className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1 text-center md:text-left">
                    <div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl ${step.bgColor} ${step.color} mb-6 shadow-xl`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-heading text-3xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg italic">
                      "{step.desc}"
                    </p>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-48 w-48 rounded-full border-8 border-slate-50 flex items-center justify-center bg-white shadow-2xl relative">
                      <span className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg">0{i + 1}</span>
                      <div className="p-8 rounded-3xl bg-slate-50">
                        <ShieldCheck className="h-16 w-16 text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Tech Deep Dive */}
        <AnimatedSection>
          <div className="glass-card-strong p-12 mb-20 border-white shadow-2xl bg-white/40 overflow-hidden relative">
            <div className="absolute -top-20 -right-20 h-64 w-64 bg-primary/5 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl font-bold mb-10 text-center">Technical <span className="text-primary">Safeguards</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {techFeatures.map(f => (
                  <div key={f.title} className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-lg border border-primary/10">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-sm tracking-tight">{f.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Final Call */}
        <AnimatedSection>
          <div className="text-center py-20 bg-midnight rounded-[40px] text-white shadow-2xl">
            <h2 className="font-heading text-4xl font-bold mb-6">Ready to make your city safer?</h2>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <Link to="/register">
                <Button size="lg" className="rounded-2xl h-16 px-12 bg-primary hover:bg-white hover:text-primary transition-all font-bold uppercase tracking-widest text-xs">
                  Join the Network
                </Button>
              </Link>
              <Link to="/impact">
                <Button size="lg" variant="outline" className="rounded-2xl h-16 px-12 border-white/20 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs">
                  Current Impact <ArrowRight className="ml-3 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
