
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, MapPin, Brain, Bell, Radio, Building2, Users, BarChart3,
  AlertTriangle, Eye, Zap, TrendingUp, ArrowRight, Star, Heart,
  Quote, ShieldCheck, Navigation, MessageCircle, PhoneCall, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import heroBg from "@/assets/hero-bg.jpg";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslation } from "@/hooks/useTranslation";

export default function Index() {
  const { user, profile } = useAuthStore();
  const { t } = useTranslation();

  const stats = [
    { value: "500K+", label: t('safeguardedLives'), icon: Heart },
    { value: "99.9%", label: t('systemUptime'), icon: Zap },
    { value: "10M+", label: t('riskDataPoints'), icon: Brain },
    { value: "24/7", label: t('globalMonitoring'), icon: ShieldCheck },
  ];

  const features = [
    {
      icon: Radio,
      title: t('reportIncident'),
      desc: t('reportIncidentDesc'),
      color: "bg-rose",
      lightColor: "text-rose"
    },
    {
      icon: Navigation,
      title: t('heatmap'),
      desc: t('heatmapDesc'),
      color: "bg-emerald-500",
      lightColor: "text-emerald-500"
    },
    {
      icon: Brain,
      title: t('identityProtection'),
      desc: t('identityProtectionDesc'),
      color: "bg-primary",
      lightColor: "text-primary"
    },
    {
      icon: Users,
      title: t('liaison'),
      desc: t('liaisonDesc'),
      color: "bg-lavender",
      lightColor: "text-lavender"
    },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (profile?.role === 'police') return "/police-dashboard";
    if (profile?.role === 'city_authority') return "/authority-dashboard";
    if (profile?.role === 'admin') return "/admin-dashboard";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/40 backdrop-blur-md border border-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.3em] text-primary mb-10 shadow-xl"
          >
            <ShieldCheck className="h-4 w-4" />
            {t('activeProtection')}
          </motion.div>

          <h1 className="font-heading text-6xl font-bold leading-[1.1] tracking-tight text-foreground md:text-8xl">
            {t('heroTitle').split(' Platform')[0]} <br />
            <span className="gradient-text">{t('heroTitle').includes('Platform') ? 'Platform' : ''}</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <Link to="/register">
              <Button size="lg" className="rounded-2xl h-16 px-10 bg-midnight hover:bg-black text-white font-bold uppercase tracking-widest text-xs shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all hover:scale-105 active:scale-95">
                {t('register')} <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="rounded-2xl h-16 px-10 border-rose bg-rose/10 backdrop-blur-md hover:bg-rose text-rose hover:text-white font-bold uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 group">
                <Radio className="mr-3 h-5 w-5 animate-pulse group-hover:scale-125 transition-transform" /> {t('emergencySOS')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute -bottom-40 left-0 right-0 h-96 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Quick Access Grid */}
      <section className="relative -mt-32 z-20 mx-auto max-w-6xl px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('reportIncident'), icon: AlertTriangle, path: "/dashboard", color: "bg-rose" },
            { label: t('citizenLogin'), icon: Users, path: "/login", color: "bg-primary" },
            { label: t('emergencyHelp'), icon: PhoneCall, path: "/contact", color: "bg-midnight" },
            { label: t('safetyTips'), icon: Lightbulb, path: "/awareness", color: "bg-gold" },
          ].map((item, i) => (
            <AnimatedSection key={item.label} delay={i * 0.1}>
              <Link to={item.path}>
                <div className="glass-card-strong p-6 flex flex-col items-center text-center group hover:shadow-2xl transition-all cursor-pointer bg-white/60">
                  <div className={`p-4 rounded-2xl ${item.color} text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <div className="glass-card p-8 flex flex-col items-center text-center group hover:bg-white/40 transition-all">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="font-heading text-4xl font-bold text-foreground mb-1 tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <AnimatedSection>
            <div className="text-center mb-20">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-rose">{t('coreArsenal')}</span>
              <h2 className="mt-4 font-heading text-4xl font-bold text-foreground md:text-6xl tracking-tight">
                {t('builtForTrust').split(' Absolute')[0]} <span className="gradient-text">Absolute</span> {t('builtForTrust').split('Absolute ')[1]}
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <div className="glass-card-strong p-10 group hover:bg-white transition-all shadow-xl bg-white/40 border-white/60">
                  <div className={`h-16 w-16 rounded-2xl ${f.color} text-white flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {f.desc}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-slate-50/50">
        <div className="mx-auto max-w-6xl px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t('storiesTitle')}</span>
                <h2 className="mt-4 font-heading text-4xl font-bold text-foreground md:text-5xl tracking-tight">
                  {t('storiesSubtitle').split('. ')[0]}. <br /><span className="gradient-text">{t('storiesSubtitle').split('. ')[1]}</span>
                </h2>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-5 w-5 fill-gold text-gold" />)}
                <span className="ml-2 font-bold text-sm">4.9/5 {t('avgRating')}</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Testimonials logic remains the same (names and content might need context-aware translation if critical, but keeping current for UI consistency) */}
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Sarah Jenkins",
                role: "Graduate Student",
                content: t('heroSubtitle'), // Reusing some concepts for now
                avatar: "SJ"
              },
              {
                name: "Officer Mark Ross",
                role: "Metropolitan Police",
                content: t('heatmapDesc'),
                avatar: "MR"
              },
              {
                name: "Linda Chen",
                role: "City Planner",
                content: t('liaisonDesc'),
                avatar: "LC"
              }
            ].map((t_item, i) => (
              <AnimatedSection key={t_item.name} delay={i * 0.1}>
                <div className="glass-card p-8 h-full flex flex-col justify-between border-white shadow-lg bg-white/60">
                  <div>
                    <Quote className="h-8 w-8 text-primary/20 mb-6" />
                    <p className="text-sm italic text-foreground leading-relaxed font-medium mb-8">
                      "{t_item.content}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                      {t_item.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{t_item.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{t_item.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="mx-auto max-w-5xl px-4">
          <AnimatedSection>
            <div className="glass-card-strong p-16 text-center relative overflow-hidden bg-white/40 border-white shadow-2xl">
              <div className="absolute top-0 right-0 h-full w-1/3 bg-lavender/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 h-full w-1/3 bg-rose/5 blur-[100px]" />

              <div className="relative z-10">
                <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto mb-10 shadow-xl shadow-primary/20">
                  <Shield className="h-10 w-10" />
                </div>
                <h2 className="font-heading text-4xl font-bold text-foreground md:text-6xl mb-6 tracking-tight">
                  {t('safetyNonNegotiable').split(' Non-')[0]} <br /><span className="gradient-text">{t('safetyNonNegotiable').includes('Non-') ? 'Non-Negotiable.' : ''}</span>
                </h2>
                <p className="mx-auto max-w-xl text-muted-foreground text-lg mb-12">
                  {t('joinPioneers')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <Link to="/register">
                    <Button size="lg" className="rounded-2xl h-16 px-12 bg-primary hover:bg-black text-white font-bold uppercase tracking-widest text-xs shadow-xl">
                      {t('registerAccount')}
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="ghost" className="rounded-2xl h-16 px-10 text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary/5">
                      {t('governmentInquiry')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
