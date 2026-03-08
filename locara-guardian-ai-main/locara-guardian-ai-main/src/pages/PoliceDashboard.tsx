import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, MapPin, TrendingUp, Activity,
  Bell, Radio, Eye, Clock, CheckCircle, Zap, Navigation, Send,
  Maximize2
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import AnimatedSection from "@/components/AnimatedSection";
import { useIncidentStore } from "@/store/useIncidentStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

const riskData = [
  { time: "00:00", risk: 25 }, { time: "04:00", risk: 40 },
  { time: "08:00", risk: 15 }, { time: "12:00", risk: 20 },
  { time: "16:00", risk: 35 }, { time: "20:00", risk: 65 },
  { time: "23:00", risk: 80 },
];

const zoneData = [
  { name: "Central Park", risk: 82, trend: 'up' },
  { name: "Downtown Ave", risk: 45, trend: 'down' },
  { name: "University Rd", risk: 67, trend: 'stable' },
  { name: "Station Area", risk: 73, trend: 'up' },
];

const categoryPieData = [
  { name: "Harassment", value: 35 }, { name: "Stalking", value: 25 },
  { name: "Assault", value: 15 }, { name: "Theft", value: 20 },
  { name: "Other", value: 5 },
];

const pieColors = ["#E11D48", "#8B5CF6", "#F59E0B", "#0EA5E9", "#94A3B8"];

const COMPLAINT_CATEGORIES = [
  {
    label: "Harassment",
    desc: "Verbal, physical or online intimidation",
    color: "bg-rose/10 text-rose border-rose/20",
    badge: "Women's Cell",
    icon: "🚨",
  },
  {
    label: "Theft",
    desc: "Snatching, pick-pocketing, burglary",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    badge: "Crime Branch",
    icon: "🔒",
  },
  {
    label: "Corruption",
    desc: "Bribery or misconduct by officials",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badge: "Vigilance Dept.",
    icon: "⚖️",
  },
  {
    label: "Traffic Violation",
    desc: "Reckless driving, signal jumping",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "Traffic Police",
    icon: "🚦",
  },
  {
    label: "Public Nuisance",
    desc: "Loud noise, illegal gatherings",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "Local Station",
    icon: "📢",
  },
];

function RiskBadge({ status }: { status: string }) {
  const classes =
    status === "High" || status === "critical"
      ? "bg-rose/15 text-rose border-rose/20"
      : status === "Medium" || status === "high"
        ? "bg-gold/15 text-gold border-gold/20"
        : "bg-emerald-500/15 text-emerald-500 border-emerald-500/20";
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${classes}`}>{status}</span>;
}

export default function PoliceDashboard() {
  const { incidents, fetchIncidents, updateIncidentStatus, subscribeToIncidents } = useIncidentStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchIncidents();
    const unsub = subscribeToIncidents();
    return () => unsub();
  }, [fetchIncidents, subscribeToIncidents]);

  const handleStatusUpdate = async (id: string, status: 'verified' | 'resolved') => {
    await updateIncidentStatus(id, status);
    toast.success(`Incident marked as ${status}`);
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="min-h-screen pt-28 pb-12 section-padding bg-slate-50/30">
      <div className="mx-auto max-w-7xl">
        <AnimatedSection>
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose/10 text-rose">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t('commandCenter')} Alpha</span>
                </div>
              </div>
              <h1 className="font-heading text-4xl font-bold text-foreground">
                Dispatch <span className="gradient-text">{t('dispatchIntelligence')}</span>
              </h1>
            </div>
            <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-slate-200">
              <Button variant="ghost" className="rounded-xl text-xs font-bold">Live Grid</Button>
              <Button variant="ghost" className="rounded-xl text-xs font-bold text-muted-foreground">Analytics</Button>
              <Button className="rounded-xl text-xs font-bold bg-midnight text-white hover:bg-black">{t('broadcastAlert')}</Button>
            </div>
          </div>
        </AnimatedSection>

        {/* Tactical KPIs */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-10">
          {[
            { label: t('alertsPending'), value: activeIncidents.length.toString(), icon: Bell, trend: "+2", color: "text-rose", bg: "bg-rose/5" },
            { label: t('activeEnforcers'), value: "48", icon: Shield, trend: "+5%", color: "text-primary", bg: "bg-primary/5" },
            { label: t('responseLatency'), value: "2.8m", icon: Clock, trend: "-14%", color: "text-emerald-500", bg: "bg-emerald-500/5" },
            { label: t('zoneNeutralization'), value: "94%", icon: Zap, trend: "+2%", color: "text-gold", bg: "bg-gold/5" },
          ].map((kpi, i) => (
            <AnimatedSection key={kpi.label} delay={i * 0.05}>
              <div className="glass-card-strong p-6 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 p-4 opacity-10 ${kpi.color} group-hover:scale-125 transition-transform`}>
                  <kpi.icon className="h-12 w-12" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{kpi.label}</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold font-heading">{kpi.value}</div>
                  <span className={`text-[10px] font-bold ${kpi.trend.startsWith("-") ? 'text-emerald-500' : 'text-rose'}`}>{kpi.trend}</span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Feed Panel */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatedSection>
              <div className="glass-card-strong p-8 bg-white/60">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-heading text-xl font-bold flex items-center gap-3">
                    <Radio className="h-5 w-5 text-rose animate-pulse" />
                    Tactical Incident Stream
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold uppercase h-8 px-4">All Zones</Button>
                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold uppercase h-8 px-4">Urgent Only</Button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4 scrollbar-hide">
                  <AnimatePresence mode="popLayout">
                    {activeIncidents.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed">
                        <CheckCircle className="h-16 w-16 mb-4 opacity-10" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Frequency Clear • No Active Threats</p>
                      </motion.div>
                    ) : (
                      activeIncidents.map((incident) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={incident.id}
                          className={`group p-6 rounded-2xl border transition-all hover:shadow-xl ${incident.severity === 'critical'
                            ? 'bg-rose/5 border-rose/20 active-glow-rose'
                            : 'bg-white border-slate-100'
                            }`}
                        >
                          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <RiskBadge status={incident.severity} />
                                <span className="text-[10px] font-mono font-bold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                                  UUID: {incident.id.slice(0, 8)}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {new Date(incident.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-lg font-bold text-foreground leading-tight">{incident.description}</p>
                              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" /> Sector 4G • {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="uppercase tracking-widest text-[9px] px-2 py-0.5 rounded bg-slate-100">AI Verified Origin</span>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" variant="outline" className="rounded-xl h-12 w-12 border-slate-200 group-hover:border-primary/50 transition-colors">
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="rounded-xl h-12 px-6 bg-midnight text-white hover:bg-black font-bold text-[10px] uppercase tracking-widest"
                                onClick={() => handleStatusUpdate(incident.id, 'verified')}
                              >
                                Dispatch Unit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl h-12 px-6 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] uppercase tracking-widest"
                                onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Side Intelligence Panel */}
          <div className="lg:col-span-4 space-y-8">
            {/* Risk Projection */}
            <AnimatedSection>
              <div className="glass-card-strong p-8 bg-midnight text-white border-midnight shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Navigation size={180} /></div>
                <div className="relative z-10">
                  <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gold" />
                    Risk Projection
                  </h3>
                  <div className="h-[200px] mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={riskData}>
                        <defs>
                          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FB7185" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FB7185" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="risk" stroke="#FB7185" strokeWidth={3} fill="url(#riskGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-lilac opacity-50 mb-2">High Risk Sectors</p>
                    {zoneData.map(zone => (
                      <div key={zone.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-xs font-bold">{zone.name}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold ${zone.risk > 70 ? 'text-rose' : 'text-gold'}`}>{zone.risk}%</span>
                          <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full ${zone.risk > 70 ? 'bg-rose' : 'bg-gold'}`} style={{ width: `${zone.risk}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Smart Patrol + Threat Classification */}
            <AnimatedSection>
              <div className="glass-card-strong p-8 bg-white/60 mb-6">
                <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-3">
                  <Activity className="h-5 w-5 text-emerald-500" /> Smart Patrol Planning
                </h3>
                <div className="p-4 rounded-2xl bg-midnight text-white border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-full w-1/2 bg-primary/20 blur-[60px] group-hover:bg-primary/30 transition-all" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Automation Active</p>
                      <h4 className="font-bold text-lg mb-1">Route Syncing Unit 402</h4>
                      <p className="text-xs text-white/60">Optimized for Sector 4 High-Risk Prediction</p>
                    </div>
                    <Button className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">
                      <Send className="h-4 w-4 mr-2" /> Sync Data
                    </Button>
                  </div>
                </div>
              </div>

              <div className="glass-card-strong p-8 bg-white/60">
                <h3 className="font-heading text-xl font-bold mb-6">Threat Classification</h3>
                <div className="h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {categoryPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="block text-2xl font-bold">142</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Total 24h</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* ── Complaint Categories ───────────────────────── */}
            <AnimatedSection delay={0.1}>
              <div className="glass-card-strong p-8 bg-white/60">
                <h3 className="font-heading text-xl font-bold mb-1 flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" /> Complaint Categories
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">
                  Quick routing guide for incoming complaints
                </p>
                <ul className="space-y-3">
                  {COMPLAINT_CATEGORIES.map((cat, i) => (
                    <motion.li
                      key={cat.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all hover:shadow-md cursor-default ${cat.color}`}
                    >
                      <span className="text-xl mt-0.5 select-none">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-black text-sm">{cat.label}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/70 border ${cat.color}`}>
                            {cat.badge}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium opacity-75 mt-0.5 leading-snug">{cat.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </div>
    </div>
  );
}
