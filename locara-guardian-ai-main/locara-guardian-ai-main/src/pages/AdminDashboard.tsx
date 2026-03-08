import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useIncidentStore, Incident } from "@/store/useIncidentStore";
import AnimatedSection from "@/components/AnimatedSection";
import {
    Users, AlertTriangle, Activity, Settings, Search,
    Filter, MapPin, Clock, Shield, CheckCircle, XCircle,
    MoreVertical, LayoutGrid, List, FileText, TrendingUp, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAreaFeedbackStore } from "@/store/useAreaFeedbackStore";

export default function AdminDashboard() {
    const { profile } = useAuthStore();
    const { incidents, fetchIncidents, updateIncidentStatus, subscribeToIncidents, loading } = useIncidentStore();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const { feedbacks, fetchFeedbacks } = useAreaFeedbackStore();

    useEffect(() => {
        fetchIncidents();
        fetchFeedbacks();
        const unsub = subscribeToIncidents();
        return () => unsub();
    }, [fetchIncidents, fetchFeedbacks, subscribeToIncidents]);

    const filteredIncidents = incidents.filter(incident => {
        const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
        const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
        const matchesSearch = (incident.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (incident.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleStatusUpdate = async (id: string, status: Incident['status']) => {
        await updateIncidentStatus(id, status);
        toast.success(`Incident status updated to ${status}`);
    };

    const totalUsers = "1,245"; // Mocked user count as there is no central user store
    const pendingReports = incidents.filter(i => i.status === 'pending').length;
    const resolvedReports = incidents.filter(i => i.status === 'resolved').length;

    // Process Areas for Improvement Tracker
    const areaStatsMap = new Map<string, { complaints: number, resolved: number, totalRating: number, ratingCount: number }>();

    // 1. Group incidents by location
    incidents.forEach(inc => {
        // Simple mock clustering by rough lat/long for demo purposes
        const areaName = `Sector ${Math.floor(inc.latitude * 10) % 10}`;
        if (!areaStatsMap.has(areaName)) {
            areaStatsMap.set(areaName, { complaints: 0, resolved: 0, totalRating: 0, ratingCount: 0 });
        }
        const stats = areaStatsMap.get(areaName)!;
        stats.complaints++;
        if (inc.status === 'resolved') stats.resolved++;
    });

    // 2. Add feedback 
    feedbacks.forEach(fb => {
        const areaName = `Sector ${Math.floor(fb.area_lat * 10) % 10}`;
        if (areaStatsMap.has(areaName)) {
            const stats = areaStatsMap.get(areaName)!;
            stats.totalRating += fb.rating;
            stats.ratingCount++;
        }
    });

    const areaImprovementData = Array.from(areaStatsMap.entries()).map(([name, stats]) => {
        const score = stats.ratingCount > 0 ? Number((stats.totalRating / stats.ratingCount).toFixed(1)) : 0;
        let trend = "Critical"; // < 2.5
        if (score >= 4.0) trend = "Secured";
        else if (score >= 2.5) trend = "Improving";

        // if no feedback yet, base it on resolved ratio
        if (stats.ratingCount === 0) {
            const ratio = stats.resolved / (stats.complaints || 1);
            if (ratio > 0.8) trend = "Secured";
            else if (ratio > 0.4) trend = "Improving";
            else trend = "Critical";
            return { name, complaints: stats.complaints, resolved: stats.resolved, score: "N/A", trend };
        }

        return { name, complaints: stats.complaints, resolved: stats.resolved, score, trend };
    });

    const stats = [
        { label: "Total Users", value: totalUsers, icon: Users, color: "text-primary" },
        { label: "Pending Reports", value: pendingReports.toString(), icon: AlertTriangle, color: "text-rose" },
        { label: "Resolved Today", value: resolvedReports.toString(), icon: CheckCircle, color: "text-emerald-500" },
        { label: "System Health", value: "99.8%", icon: Activity, color: "text-blue-500" },
    ];

    return (
        <div className="min-h-screen pt-28 pb-12 section-padding bg-slate-50/30">
            <div className="mx-auto max-w-7xl">
                <AnimatedSection>
                    <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h1 className="font-heading text-4xl font-bold text-foreground">
                                Governance <span className="gradient-text">Command Center</span>
                            </h1>
                            <p className="text-muted-foreground mt-2">Welcome, {profile?.name}. Full platform oversight active.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="rounded-xl border-white shadow-sm bg-white/50">
                                <FileText className="h-4 w-4 mr-2" /> Export JSON
                            </Button>
                            <Button className="rounded-xl bg-midnight text-white hover:bg-black shadow-lg">
                                Platform Status
                            </Button>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Map Visualization */}
                <AnimatedSection>
                    <div className="glass-card-strong h-[400px] mb-10 overflow-hidden relative border-white shadow-2xl">
                        <div className="absolute top-4 left-4 z-10 glass-card p-3 border-white">
                            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" /> Live Threat Map
                            </h3>
                        </div>
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0060%2C40.7128%2C-73.9060%2C40.8128&amp;layer=mapnik"
                            className="grayscale contrast-125 opacity-70"
                        ></iframe>
                        <div className="absolute bottom-4 right-4 z-10 glass-card p-4 border-white min-w-[200px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Live Density</p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span>Sector 4</span>
                                    <span className="text-rose">High Risk</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-rose w-[85%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Tactical Stats & AI Integrity */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6 h-fit">
                        {stats.map((stat, i) => (
                            <AnimatedSection key={stat.label} delay={i * 0.05}>
                                <div className="glass-card-strong p-6 relative overflow-hidden bg-white/60">
                                    <stat.icon className={`absolute -right-2 -top-2 h-16 w-16 opacity-5 ${stat.color}`} />
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{stat.label}</div>
                                    <div className="text-3xl font-bold font-heading">{stat.value}</div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>

                    <AnimatedSection delay={0.3} className="lg:col-span-4 h-full">
                        <div className="glass-card-strong p-6 border-rose/10 bg-rose/[0.02] h-full relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-rose flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> AI Integrity Shield
                                </h3>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-white/60 rounded-xl border border-rose/10 flex justify-between items-center group cursor-pointer hover:border-rose/30 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold">Suspicious Account Activity</p>
                                        <p className="text-[8px] text-muted-foreground">Multiple reports from IP: 192.168.1.XX</p>
                                    </div>
                                    <span className="text-[10px] font-black text-rose">FLAGGED</span>
                                </div>
                                <div className="p-3 bg-white/60 rounded-xl border border-white flex justify-between items-center opacity-60">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold">Spam Pattern Detection</p>
                                        <p className="text-[8px] text-muted-foreground">99% description similarity in 4 reports</p>
                                    </div>
                                    <span className="text-[10px] font-black text-gold">REVIEW</span>
                                </div>
                            </div>
                            <Button variant="ghost" className="w-full mt-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose hover:bg-rose/5">
                                View Full Audit Log
                            </Button>
                        </div>
                    </AnimatedSection>
                </div>

                {/* Transparency Panel: Area Improvement Tracker */}
                <AnimatedSection delay={0.4}>
                    <div className="mb-10 glass-card-strong p-6 border-blue-500/20 bg-blue-50/50">
                        <div className="flex items-center justify-between mb-6 border-b border-blue-100 pb-4">
                            <div>
                                <h2 className="text-xl font-bold font-heading text-blue-900 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" /> Area Improvement Tracker
                                </h2>
                                <p className="text-xs text-blue-700/70 mt-1">Community safety validation and area recovery tracking</p>
                            </div>
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 bg-white">
                                Download Transparency Report
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {areaImprovementData.slice(0, 3).map((area, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
                                    {area.trend === "Secured" && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-[100px] z-0" />}
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-slate-800">{area.name}</h3>
                                            <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full ${area.trend === 'Improving' ? 'bg-blue-100 text-blue-700' :
                                                area.trend === 'Secured' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-rose/10 text-rose'
                                                }`}>
                                                {area.trend}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Complaints Filed</span>
                                                <span className="font-bold">{area.complaints}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Actions Taken</span>
                                                <span className="font-bold text-emerald-600">{area.resolved}</span>
                                            </div>
                                            <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                                                <span className="text-[10px] font-bold uppercase text-slate-400">Community Score</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold text-slate-700">{area.score}</span>
                                                    <span className="text-slate-400 text-xs">{area.score !== 'N/A' ? '/ 5' : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                <div className="space-y-6">
                    {/* Filters Bar */}
                    <AnimatedSection>
                        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-white shadow-sm">
                            <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Incident ID or Description..."
                                        className="pl-10 h-11 rounded-xl bg-white/50 border-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="h-11 rounded-xl bg-white/50 border-white px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 ring-primary/20"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                    <select
                                        className="h-11 rounded-xl bg-white/50 border-white px-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 ring-primary/20"
                                        value={filterSeverity}
                                        onChange={(e) => setFilterSeverity(e.target.value)}
                                    >
                                        <option value="all">All Severity</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Incidents List */}
                    <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
                        <AnimatePresence mode="popLayout">
                            {filteredIncidents.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground opacity-50"
                                >
                                    <Shield className="h-16 w-16 mb-4" />
                                    <p className="font-bold uppercase tracking-widest text-xs">No reports match your filters</p>
                                </motion.div>
                            ) : (
                                filteredIncidents.map((incident, idx) => (
                                    <motion.div
                                        layout
                                        key={incident.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`glass-card-strong overflow-hidden border-white/60 hover:shadow-xl transition-all ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-6 p-6' : 'p-6 flex flex-col h-full'}`}
                                    >
                                        {/* Severity Stripe */}
                                        <div className={`w-1 shrink-0 rounded-full ${incident.severity === 'critical' ? 'bg-rose' :
                                            incident.severity === 'high' ? 'bg-gold' :
                                                incident.severity === 'medium' ? 'bg-primary' : 'bg-emerald-500'
                                            }`} />

                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${incident.severity === 'critical' ? 'bg-rose/10 text-rose' :
                                                            incident.severity === 'high' ? 'bg-gold/10 text-gold' :
                                                                'bg-primary/10 text-primary'
                                                            }`}>
                                                            {incident.severity}
                                                        </span>
                                                        <span className="text-[10px] font-mono font-bold text-muted-foreground">ID: {incident.id.slice(0, 8)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(incident.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className={`h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest ${incident.status === 'pending' ? 'bg-gold/10 text-gold' :
                                                            incident.status === 'verified' ? 'bg-primary/10 text-primary' :
                                                                'bg-emerald-500/10 text-emerald-500'
                                                            }`}
                                                    >
                                                        {incident.status}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-foreground leading-relaxed line-clamp-3">
                                                    {incident.description}
                                                </p>
                                                <div className="flex flex-wrap gap-4 text-[10px] font-bold text-muted-foreground">
                                                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> GPS: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
                                                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> User: {incident.user_id === 'anonymous' ? 'ANONYMOUS' : incident.user_id.slice(0, 8)}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-9 px-4 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest"
                                                        onClick={() => handleStatusUpdate(incident.id, 'verified')}
                                                        disabled={incident.status === 'verified'}
                                                    >
                                                        Verify Report
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-9 px-4 rounded-xl border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-widest"
                                                        onClick={() => handleStatusUpdate(incident.id, 'resolved')}
                                                        disabled={incident.status === 'resolved'}
                                                    >
                                                        Mark Action Taken
                                                    </Button>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-xl text-rose hover:bg-rose/10">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
