import { motion } from "framer-motion";
import { TrendingDown, Users, Building2, ShieldCheck, MapPin, BarChart3, PieChart, Navigation } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Crime Reduction", value: "34%", icon: TrendingDown, color: "text-rose", desc: "Average reduction in predicted high-risk zones over 12 months." },
  { label: "Patrol Efficiency", value: "+42%", icon: ShieldCheck, color: "text-emerald-600", desc: "Improvement in police resource allocation using AI routing." },
  { label: "Safe Routes Served", value: "2.4M", icon: Navigation, desc: "Successful navigation sessions through safely lit and monitored paths." },
  { label: "Lives Protected", value: "150K+", icon: Users, color: "text-primary", desc: "Active users relying on SafeCity AI for daily transit safety." },
];

const caseStudies = [
  {
    city: "Mumbai Metropolitan",
    impact: "Redesigned 50+ street lighting grids and added 120 AI-enabled CCTV nodes based on risk heatmaps.",
    result: "28% decrease in evening harassment reports."
  },
  {
    city: "Delhi North",
    impact: "Integrated SafeCity AI into the police dispatch system for real-time predictive patrol.",
    result: "Response time dropped from 12 mins to 4.5 mins."
  }
];

const transparencyMetrics = [
  { label: "Cases Submitted", value: "12,402", color: "text-primary" },
  { label: "Action Taken", value: "11,580", color: "text-emerald-600" },
  { label: "Resolution Rate", value: "93.4%", color: "text-blue-600" },
  { label: "Total Infrastructure Updates", value: "450+", color: "text-gold" },
];

export default function Impact() {
  return (
    <div className="min-h-screen pt-28 pb-12 section-padding bg-slate-50/20">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Transparency & Impact</span>
            <h1 className="mt-4 font-heading text-4xl font-bold text-foreground md:text-6xl tracking-tight">
              Governance <span className="gradient-text">Beyond</span> Data
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              We provide the intelligence needed to prevent incidents and the transparency needed to build trust
              between citizens and public safety departments.
            </p>
          </div>
        </AnimatedSection>

        {/* Real-time Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <div className="glass-card-strong p-8 h-full flex flex-col items-center text-center group hover:bg-white transition-all border-white/60 shadow-xl">
                <div className={`p-4 rounded-2xl bg-white/50 ${stat.color || 'text-primary'} mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl font-bold font-heading mb-2">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{stat.label}</div>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{stat.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Transparency Panel */}
        <AnimatedSection>
          <div className="glass-card-strong p-10 mb-20 border-white shadow-2xl bg-white/60">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
              <div>
                <h2 className="font-heading text-3xl font-bold">Public Oversight</h2>
                <p className="text-sm text-muted-foreground mt-1">Live aggregated performance from regional safety command centers.</p>
              </div>
              <Button variant="outline" className="rounded-xl border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest h-10 px-6">
                Download Transparency Report
              </Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {transparencyMetrics.map(m => (
                <div key={m.label} className="space-y-1">
                  <div className={`text-3xl font-bold font-heading ${m.color}`}>{m.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <div className="grid gap-12 lg:grid-cols-2 mb-20">
          <AnimatedSection>
            <div className="glass-card-strong p-10 h-full relative overflow-hidden bg-white/80">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <PieChart size={200} />
              </div>
              <h2 className="font-heading text-3xl font-bold mb-6">Predictive Accuracy</h2>
              <p className="text-muted-foreground mb-8 text-sm italic">
                Our AI models (Shield-v4) have achieved a <span className="text-primary font-bold">92.4% accuracy</span> in predicting
                location-based risk spikes before they occur.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Temporal Prediction", pct: 94 },
                  { label: "Spatial Risk Detection", pct: 89 },
                  { label: "Identity Masking Reliability", pct: 99 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span>{item.label}</span>
                      <span>{item.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              <h2 className="font-heading text-3xl font-bold mb-4">Regional Case Studies</h2>
              {caseStudies.map((cs) => (
                <div key={cs.city} className="glass-card p-8 border-l-4 border-l-gold bg-white/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-5 w-5 text-gold" />
                    <h3 className="font-heading text-xl font-bold">{cs.city}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{cs.impact}"</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <TrendingDown className="h-4 w-4" />
                    {cs.result}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Call to Action */}
        <AnimatedSection>
          <div className="glass-card-strong p-16 text-center bg-midnight text-white shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-rose/10 opacity-30" />
            <div className="relative z-10">
              <h2 className="font-heading text-4xl font-bold mb-6">Deploy SafeCity AI in Your Region</h2>
              <p className="text-slate-300 max-w-xl mx-auto mb-10 text-lg">
                We are currently onboarding 10 new smart city pilots for 2026.
                Apply to bring our safety intelligence to your region.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-primary text-white h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all">
                  Request Pilot Access
                </button>
                <button className="border border-white/20 text-white h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                  Technical Specs
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
