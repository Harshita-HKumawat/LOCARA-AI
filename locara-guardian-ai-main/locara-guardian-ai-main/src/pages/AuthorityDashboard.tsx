import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Bell, Eye, CheckCircle, XCircle, Clock,
    AlertTriangle, Shield, User, MapPin, Calendar, FileText,
    ChevronDown, X, Send, RefreshCw, Zap, Filter, Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComplaintStore, Complaint, ComplaintStatus, ActionNote } from "@/store/useComplaintStore";
import { useAuthStore } from "@/store/useAuthStore";
import AnimatedSection from "@/components/AnimatedSection";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ComplaintStatus, { color: string; bg: string; border: string; icon: any }> = {
    "Submitted": { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Clock },
    "Under Review": { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Eye },
    "Verified": { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: CheckCircle },
    "Action Taken": { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: Shield },
    "Closed": { color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200", icon: CheckCircle },
    "False Report": { color: "text-rose", bg: "bg-rose/10", border: "border-rose/20", icon: XCircle },
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
    critical: { color: "text-rose", bg: "bg-rose/10" },
    high: { color: "text-orange-600", bg: "bg-orange-50" },
    medium: { color: "text-gold", bg: "bg-gold/10" },
    low: { color: "text-emerald-600", bg: "bg-emerald-50" },
};

const STATUSES: ComplaintStatus[] = [
    "Submitted", "Under Review", "Verified", "Action Taken", "Closed", "False Report"
];

function StatusBadge({ status }: { status: ComplaintStatus }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Submitted"];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <Icon className="h-3 w-3" />{status}
        </span>
    );
}

function SeverityBadge({ severity }: { severity: string }) {
    const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
    return (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${cfg.color} ${cfg.bg}`}>
            {severity}
        </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function ComplaintDetailModal({
    complaint,
    onClose,
    onUpdateStatus,
}: {
    complaint: Complaint;
    onClose: () => void;
    onUpdateStatus: (id: string, status: ComplaintStatus, note?: ActionNote) => void;
}) {
    const { profile } = useAuthStore();
    const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
    const [actionNote, setActionNote] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const note: ActionNote | undefined = actionNote.trim() ? {
            timestamp: new Date().toISOString(),
            note: actionNote.trim(),
            officer: profile?.name || 'Authority Officer',
        } : undefined;

        await new Promise(r => setTimeout(r, 500));
        onUpdateStatus(complaint.id, selectedStatus, note);
        toast.success(`Status updated to "${selectedStatus}"`);
        setActionNote('');
        setSaving(false);
    };

    const timeline: { label: string; done: boolean }[] = [
        { label: "Submitted", done: true },
        { label: "Under Review", done: ["Under Review", "Verified", "Action Taken", "Closed"].includes(complaint.status) },
        { label: "Verified", done: ["Verified", "Action Taken", "Closed"].includes(complaint.status) },
        { label: "Action Taken", done: ["Action Taken", "Closed"].includes(complaint.status) },
        { label: "Closed", done: complaint.status === "Closed" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Case ID</span>
                            <span className="font-mono text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{complaint.case_id}</span>
                        </div>
                        <h2 className="font-heading text-xl font-bold">{complaint.incident_type} Incident</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <StatusBadge status={complaint.status} />
                            <SeverityBadge severity={complaint.severity} />
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" /> Reporter
                            </div>
                            <div className="font-bold text-sm">
                                {complaint.is_anonymous
                                    ? <span className="text-muted-foreground italic">Anonymous Citizen</span>
                                    : (complaint.reporter_name || 'N/A')
                                }
                            </div>
                            {!complaint.is_anonymous && complaint.reporter_email && (
                                <div className="text-xs text-muted-foreground">{complaint.reporter_email}</div>
                            )}
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> When
                            </div>
                            <div className="font-bold text-sm">{complaint.date} at {complaint.time}</div>
                            <div className="text-xs text-muted-foreground">Filed: {formatDate(complaint.created_at)}</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 col-span-2 space-y-1">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Location
                            </div>
                            <div className="font-bold text-sm">{complaint.manual_location || 'GPS coordinates only'}</div>
                            {complaint.latitude !== 0 && (
                                <div className="text-xs text-muted-foreground font-mono">
                                    {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="p-4 rounded-2xl bg-slate-50">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-2">
                            <FileText className="h-3 w-3" /> Complaint Description
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{complaint.description}</p>
                    </div>

                    {/* Timeline */}
                    <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Progress Timeline</div>
                        <div className="flex items-center gap-0">
                            {timeline.map((step, i) => (
                                <div key={step.label} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${step.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        <span className={`text-[8px] font-bold mt-1 text-center leading-tight max-w-[55px] ${step.done ? 'text-emerald-600' : 'text-slate-400'}`}>{step.label}</span>
                                    </div>
                                    {i < timeline.length - 1 && (
                                        <div className={`h-0.5 flex-1 mx-1 mb-5 ${timeline[i + 1].done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Notes History */}
                    {complaint.action_notes && complaint.action_notes.length > 0 && (
                        <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Authority Action Log</div>
                            <div className="space-y-2">
                                {complaint.action_notes.map((note, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-bold text-emerald-700 uppercase">{note.officer || 'Officer'}</span>
                                            <span className="text-[9px] text-muted-foreground">{formatDate(note.timestamp)}</span>
                                        </div>
                                        <p className="text-xs text-foreground">{note.note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Update Status */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Update Status</div>
                        <div className="grid grid-cols-3 gap-2">
                            {STATUSES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSelectedStatus(s)}
                                    className={`py-2 px-3 rounded-xl border text-[10px] font-bold transition-all ${selectedStatus === s
                                        ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} ${STATUS_CONFIG[s].border} shadow-sm`
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <textarea
                            placeholder="Add action note (e.g. Unit dispatched, FIR filed, resolved)..."
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm resize-none h-20 focus:outline-none focus:border-primary transition-colors"
                        />
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-12 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px]"
                        >
                            {saving ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            {saving ? 'Saving...' : 'Save Status Update'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function AuthorityDashboard() {
    const { profile } = useAuthStore();
    const { complaints, loading, fetchComplaints, updateStatus, subscribeToComplaints, newCount, clearNewCount, lastSyncAt } = useComplaintStore();
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'All'>('All');
    const [filterSeverity, setFilterSeverity] = useState<string>('All');
    const [syncPulse, setSyncPulse] = useState(false);

    // Flash the sync indicator whenever data updates
    useEffect(() => {
        if (lastSyncAt > 0) {
            setSyncPulse(true);
            const t = setTimeout(() => setSyncPulse(false), 1500);
            return () => clearTimeout(t);
        }
    }, [lastSyncAt]);

    useEffect(() => {
        fetchComplaints();
        const unsub = subscribeToComplaints();
        return () => unsub();
    }, [fetchComplaints, subscribeToComplaints]);

    const filtered = complaints.filter(c => {
        const statusMatch = filterStatus === 'All' || c.status === filterStatus;
        const severityMatch = filterSeverity === 'All' || c.severity === filterSeverity;
        return statusMatch && severityMatch;
    });

    const kpis = [
        { label: "Total Complaints", value: complaints.length, icon: FileText, color: "text-primary", bg: "bg-primary/5" },
        { label: "Pending Review", value: complaints.filter(c => c.status === 'Submitted').length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Action Taken", value: complaints.filter(c => c.status === 'Action Taken').length, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Critical Cases", value: complaints.filter(c => c.severity === 'critical').length, icon: AlertTriangle, color: "text-rose", bg: "bg-rose/5" },
    ];

    return (
        <div className="min-h-screen pt-28 pb-12 section-padding bg-slate-50/50">
            {/* Complaint Detail Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <ComplaintDetailModal
                        complaint={selectedComplaint}
                        onClose={() => setSelectedComplaint(null)}
                        onUpdateStatus={(id, status, note) => {
                            updateStatus(id, status, note);
                            // Update selected complaint locally too
                            setSelectedComplaint(prev => prev ? {
                                ...prev,
                                status,
                                action_notes: note ? [...(prev.action_notes || []), note] : prev.action_notes,
                            } : null);
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <AnimatedSection>
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Urban Safety Administration</span>
                                {/* Live sync badge */}
                                <motion.div
                                    animate={{ scale: syncPulse ? [1, 1.2, 1] : 1 }}
                                    transition={{ duration: 0.4 }}
                                    className={`flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all ${syncPulse
                                        ? 'bg-emerald-500 text-white border-emerald-500'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        }`}
                                >
                                    <Wifi className="h-2.5 w-2.5" />
                                    {syncPulse ? 'SYNCING...' : 'LIVE'}
                                </motion.div>
                            </div>
                            <h1 className="font-heading text-3xl font-bold text-foreground md:text-5xl">
                                Complaint <span className="gradient-text">Command Center</span>
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Welcome, {profile?.name || 'Authority Officer'}. Real-time complaint monitoring and management.
                            </p>
                            {lastSyncAt > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Last synced: {new Date(lastSyncAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {/* New complaints badge */}
                            {newCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose text-white rounded-2xl shadow-lg cursor-pointer"
                                    onClick={() => { clearNewCount(); toast.info('Notifications cleared'); }}
                                >
                                    <Bell className="h-4 w-4 animate-bounce" />
                                    <span className="text-xs font-black">{newCount} New</span>
                                </motion.div>
                            )}
                            <Button
                                onClick={fetchComplaints}
                                variant="outline"
                                className="rounded-xl border-primary/20 bg-white gap-2"
                            >
                                <RefreshCw className="h-4 w-4" /> Refresh
                            </Button>
                        </div>
                    </div>
                </AnimatedSection>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {kpis.map((kpi, i) => (
                        <AnimatedSection key={kpi.label} delay={i * 0.08}>
                            <div className="glass-card-strong p-6 flex items-center gap-4 border-white">
                                <div className={`p-4 rounded-2xl bg-white shadow-sm ${kpi.color}`}>
                                    <kpi.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">{kpi.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</div>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Complaint Categories */}
                <AnimatedSection delay={0.1}>
                    <div className="glass-card-strong p-8 bg-white/60 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-heading text-xl font-bold flex items-center gap-3">
                                    <ChevronDown className="h-5 w-5 text-primary" />
                                    Complaint Categories
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                                    Standard categories with routing departments
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: "Harassment", icon: "🚨", dept: "Women's Cell", color: "bg-rose/10 text-rose border-rose/20", count: 35 },
                                { label: "Theft", icon: "🔒", dept: "Crime Branch", color: "bg-amber-50 text-amber-700 border-amber-200", count: 28 },
                                { label: "Corruption", icon: "⚖️", dept: "Vigilance Dept.", color: "bg-purple-50 text-purple-700 border-purple-200", count: 12 },
                                { label: "Traffic Violation", icon: "🚦", dept: "Traffic Police", color: "bg-blue-50 text-blue-700 border-blue-200", count: 21 },
                                { label: "Public Nuisance", icon: "📢", dept: "Local Station", color: "bg-emerald-50 text-emerald-700 border-emerald-200", count: 17 },
                            ].map((cat, i) => (
                                <motion.div
                                    key={cat.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all hover:shadow-lg cursor-default group ${cat.color}`}
                                >
                                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform select-none">{cat.icon}</span>
                                    <span className="font-black text-sm mb-1 leading-tight">{cat.label}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-3">{cat.dept}</span>
                                    <div className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-white/70 ${cat.color}`}>
                                        {cat.count}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* Filters & Table */}
                <AnimatedSection>
                    <div className="glass-card-strong p-6 bg-white/60">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                All Complaints
                                <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length} shown)</span>
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                    <select
                                        value={filterStatus}
                                        onChange={e => setFilterStatus(e.target.value as any)}
                                        className="text-[11px] font-bold border border-slate-200 rounded-xl p-2 outline-none bg-white text-foreground"
                                    >
                                        <option value="All">All Statuses</option>
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <select
                                    value={filterSeverity}
                                    onChange={e => setFilterSeverity(e.target.value)}
                                    className="text-[11px] font-bold border border-slate-200 rounded-xl p-2 outline-none bg-white text-foreground"
                                >
                                    <option value="All">All Severity</option>
                                    {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="flex items-center justify-center h-48 gap-3">
                                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-sm font-medium text-muted-foreground">Loading complaints...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                                <Shield className="h-12 w-12 opacity-20" />
                                <p className="font-bold">No complaints found for selected filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-slate-100">
                                        <tr>
                                            <th className="pb-4 pr-4">Case ID</th>
                                            <th className="pb-4 pr-4">Type</th>
                                            <th className="pb-4 pr-4">Reporter</th>
                                            <th className="pb-4 pr-4">Location</th>
                                            <th className="pb-4 pr-4">Date / Time</th>
                                            <th className="pb-4 pr-4">Severity</th>
                                            <th className="pb-4 pr-4">Status</th>
                                            <th className="pb-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs divide-y divide-slate-50">
                                        {filtered.map((complaint) => (
                                            <motion.tr
                                                key={complaint.id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="hover:bg-slate-50 transition-colors group"
                                            >
                                                <td className="py-4 pr-4">
                                                    <span className="font-mono text-[11px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">{complaint.case_id}</span>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <span className="font-bold">{complaint.incident_type}</span>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    {complaint.is_anonymous ? (
                                                        <span className="text-muted-foreground italic flex items-center gap-1">
                                                            <Shield className="h-3 w-3" /> Anonymous
                                                        </span>
                                                    ) : (
                                                        <span className="font-medium">{complaint.reporter_name || 'Citizen'}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-start gap-1 max-w-[140px]">
                                                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground line-clamp-2 text-[11px]">{complaint.manual_location || 'GPS only'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-[11px]">
                                                        <div className="font-bold">{complaint.date}</div>
                                                        <div className="text-muted-foreground">{complaint.time}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <SeverityBadge severity={complaint.severity} />
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <StatusBadge status={complaint.status} />
                                                </td>
                                                <td className="py-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        className="rounded-xl bg-midnight text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => setSelectedComplaint(complaint)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5 mr-1" /> Review
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </AnimatedSection>

                {/* New complaint pulse notification */}
                <AnimatePresence>
                    {newCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 60 }}
                            className="fixed bottom-8 right-8 z-[150] bg-midnight text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
                        >
                            <div className="h-3 w-3 rounded-full bg-rose animate-ping" />
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest">New Complaint</div>
                                <div className="text-[10px] text-white/60">Dashboard updated in real-time</div>
                            </div>
                            <button onClick={clearNewCount} className="ml-2 p-1 rounded-lg hover:bg-white/10">
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
