import {
  Radio, Eye, Brain, MapPin, Bell, Building2,
  Smartphone, Mic, MapPinned, Wifi, BarChart3, Shield,
  Siren, Phone, Route, Lightbulb, Camera, TrendingDown,
  Navigation, Zap, ShieldCheck, Heart
} from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const modules = [
  {
    title: "User Safety & SOS",
    desc: "Comprehensive tools that empower users to instantly communicate threats and share live safety status.",
    icon: Radio,
    color: "rose",
    features: [
      { icon: Smartphone, label: "One-tap Emergency SOS" },
      { icon: Mic, label: "Voice Trigger Detection" },
      { icon: MapPinned, label: "Live Location Sharing" },
      { icon: Shield, label: "Anonymous Reporting" },
    ],
  },
  {
    title: "Data Intelligence",
    desc: "Multi-source real-time data pipelines feeding our proprietary AI risk prediction engine.",
    icon: Eye,
    color: "lavender",
    features: [
      { icon: MapPin, label: "GPS Tracking" },
      { icon: Wifi, label: "Crowd Density Sensors" },
      { icon: Camera, label: "CCTV Integration" },
      { icon: BarChart3, label: "Historical Data Ingestion" },
    ],
  },
  {
    title: "AI Prediction Engine",
    desc: "Deep learning models that forecast risk levels by location, time, and environmental factors.",
    icon: Brain,
    color: "gold",
    features: [
      { icon: TrendingDown, label: "Pattern Recognition" },
      { icon: BarChart3, label: "Risk Score Computation" },
      { icon: MapPin, label: "Temporal Forecasting" },
      { icon: Eye, label: "Incident Probability" },
    ],
  },
  {
    title: "Safe Route AI",
    desc: "Intelligent navigation that paths users through locations with the highest safety scores.",
    icon: Navigation,
    color: "primary",
    features: [
      { icon: Route, label: "Safety-Weighted Routing" },
      { icon: Lightbulb, label: "Lighting-Aware Paths" },
      { icon: ShieldCheck, label: "Patrol-Safe Zones" },
      { icon: Zap, label: "Real-time Re-routing" },
    ],
  },
  {
    title: "Infrastructure Logic",
    desc: "AI-driven recommendations for long-term urban safety and resource allocation.",
    icon: Building2,
    color: "sky",
    features: [
      { icon: Route, label: "AI Patrol Routing" },
      { icon: Camera, label: "CCTV Placement AI" },
      { icon: Lightbulb, label: "Street Light Optimization" },
      { icon: Building2, label: "Safety Booth Support" },
    ],
  },
  {
    title: "Emergency Response",
    desc: "Automated incident response integrated with police dispatch and city-wide notification systems.",
    icon: Bell,
    color: "rose",
    features: [
      { icon: Siren, label: "Auto-Triggered Alerts" },
      { icon: Phone, label: "Emergency Call Routing" },
      { icon: Bell, label: "SMS & Push Escalation" },
      { icon: Shield, label: "Command Center Logic" },
    ],
  },
];

export default function Features() {
  return (
    <div className="min-h-screen pt-28 pb-12 section-padding bg-gradient-to-b from-background via-white/50 to-background">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="h-4 w-4" /> The Safety Shield
            </div>
            <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
              Intelligent Modules for <span className="gradient-text">Complete Protection</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              LOCARA-AI is built on six interconnected pillars of safety intelligence,
              providing a 360-degree security ecosystem for modern cities.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <AnimatedSection key={m.title} delay={i * 0.1}>
              <div className="glass-card-strong p-8 h-full flex flex-col group hover:shadow-2xl transition-all border-white/60 bg-white/40">
                <div className="flex flex-col gap-6 mb-8 flex-1">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-${m.color}/10 text-${m.color} shadow-lg shadow-${m.color}/10 group-hover:scale-110 transition-transform bg-white`}>
                    <m.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-3">{m.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Key Technolgies</p>
                  {m.features.map((f) => (
                    <div key={f.label} className="flex items-center gap-3 rounded-xl bg-white/50 border border-white px-4 py-3 group-hover:bg-white transition-all">
                      <f.icon className="h-4 w-4 text-primary opacity-60" />
                      <span className="text-xs font-bold text-foreground/80">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Bottom CTA */}
        <AnimatedSection>
          <div className="mt-24 p-12 glass-card-strong text-center relative overflow-hidden bg-white/40 border-white">
            <div className="relative z-10 max-w-2xl mx-auto">
              <Heart className="h-10 w-10 text-rose mx-auto mb-6" />
              <h2 className="font-heading text-3xl font-bold mb-4">Empowering Every Woman to Walk Fearless</h2>
              <p className="text-muted-foreground mb-10">Our features are designed with one goal: making sure you never feel alone. From predictive AI to real-time response, we've got you covered.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="rounded-2xl px-12 py-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl">Get Started Free</Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="rounded-2xl px-12 py-8 border-primary/20 text-primary font-bold">Watch Platform Demo</Button>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
