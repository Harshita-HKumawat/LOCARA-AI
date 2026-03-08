import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AnimatedSection from "@/components/AnimatedSection";
import { toast } from "sonner";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Request Submitted. Our strategic partnership team will reach out within 24 hours.");
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-28 pb-12 section-padding bg-[radial-gradient(circle_at_bottom_left,_hsl(270,50%,65%,0.05),_transparent)]">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary mb-6">
              <Globe className="h-4 w-4" /> Global Safety Network
            </div>
            <h1 className="font-heading text-5xl font-bold text-foreground md:text-6xl tracking-tight leading-tight">
              Bring LOCARA-AI to <br /><span className="gradient-text">Your Region</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              We partner with police departments, smart city authorities, and NGOs to create
              the world's most advanced safety intelligence platform.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-12 lg:grid-cols-5 items-start">
          <AnimatedSection className="lg:col-span-3">
            <div className="glass-card-strong p-10 bg-white/40 border-white/60 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-2xl bg-primary text-white shadow-lg">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-foreground">Pilot Program Request</h3>
                  <p className="text-sm text-muted-foreground">Strategic partnership application for 2026 pilots.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <Input placeholder="John Doe" required className="rounded-2xl h-14 bg-white/60 border-white focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Official Email</label>
                    <Input placeholder="john@department.gov" type="email" required className="rounded-2xl h-14 bg-white/60 border-white focus:bg-white transition-all shadow-sm" />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Organization</label>
                    <Input placeholder="Metropolitan Police" className="rounded-2xl h-14 bg-white/60 border-white focus:bg-white transition-all shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Region / Country</label>
                    <Input placeholder="London, UK" className="rounded-2xl h-14 bg-white/60 border-white focus:bg-white transition-all shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Safety Objectives</label>
                  <Textarea placeholder="Describe your region's key safety challenges..." rows={5} className="rounded-2xl bg-white/60 border-white focus:bg-white transition-all shadow-sm p-4" />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl h-16 bg-midnight hover:bg-black text-white font-bold uppercase tracking-[0.2em] text-xs shadow-xl transition-all hover:scale-[1.01] active:scale-95"
                >
                  {loading ? "Processing..." : "Submit Strategic Application"} <Send className="ml-3 h-4 w-4" />
                </Button>
                <p className="text-center text-[10px] text-muted-foreground font-medium italic">
                  By submitting, you agree to our <u>Government Data Sovereignty</u> protocols.
                </p>
              </form>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="lg:col-span-2 space-y-6">
            <div className="glass-card p-10 border-white bg-white/30 backdrop-blur-xl">
              <h4 className="font-heading text-xl font-bold mb-8">Direct Channels</h4>
              <div className="space-y-8">
                {[
                  { icon: Mail, label: "Strategic Partnerships", value: "collaborate@locara-ai.com" },
                  { icon: Phone, label: "Emergency Hotline (Gov)", value: "+1 (800) LOCARA-HQ" },
                  { icon: MessageSquare, label: "Live Response Desk", value: "24/7 Intelligence Support" },
                  { icon: MapPin, label: "Global HQ", value: "Innovation District, Silicon Valley" },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-5 group">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-primary group-hover:scale-110 transition-transform">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{c.label}</p>
                      <p className="text-sm font-bold text-foreground leading-relaxed">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-10 bg-gradient-to-br from-primary to-lavender text-white border-none shadow-xl">
              <h4 className="font-heading text-xl font-bold mb-4">Urgent Response?</h4>
              <p className="text-sm opacity-80 leading-relaxed mb-6">
                If you are a city official facing an immediate safety infrastructure crisis, skip the form and call our 24/7 Rapid Deployment Line.
              </p>
              <Button className="w-full rounded-xl bg-white text-primary font-bold hover:bg-white/90">View Deployment Map</Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
