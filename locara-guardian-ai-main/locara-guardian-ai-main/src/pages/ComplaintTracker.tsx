import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Shield, CheckCircle, Clock, Eye, AlertTriangle,
    FileText, MapPin, Calendar, ChevronDown, XCircle, X,
    ThumbsUp, ThumbsDown, Star, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComplaintStore, Complaint, ComplaintStatus } from "@/store/useComplaintStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useAreaFeedbackStore } from "@/store/useAreaFeedbackStore";
import AnimatedSection from "@/components/AnimatedSection";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STATUS_ORDER: ComplaintStatus[] = [
    "Submitted", "Under Review", "Verified", "Action Taken", "Closed"
];

const STATUS_ICON: Record<ComplaintStatus, any> = {
    "Submitted": Clock,
    "Under Review": Eye,
    "Verified": CheckCircle,
    "Action Taken": Shield,
    "Closed": CheckCircle,
    "False Report": XCircle,
};

const STATUS_COLOR: Record<ComplaintStatus, string> = {
    "Submitted": "text-blue-600 bg-blue-50 border-blue-200",
    "Under Review": "text-amber-600 bg-amber-50 border-amber-200",
    "Verified": "text-primary bg-primary/10 border-primary/20",
    "Action Taken": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "Closed": "text-slate-500 bg-slate-100 border-slate-200",
    "False Report": "text-rose bg-rose/10 border-rose/20",
};

const SEVERITY_COLOR: Record<string, string> = {
    critical: "text-rose bg-rose/10",
    high: "text-orange-600 bg-orange-50",
    medium: "text-amber-600 bg-amber-50",
    low: "text-emerald-600 bg-emerald-50",
};

function formatDate(iso: string | undefined | null) {
    if (!iso) return "Unknown Date";
    try {
        return new Date(iso).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    } catch {
        return "Invalid Date";
    }
}

function ComplaintCard({ complaint }: { complaint: Complaint }) {
    const [expanded, setExpanded] = useState(false);
    const { profile } = useAuthStore();
    const { feedbacks, submitFeedback } = useAreaFeedbackStore();

    // Feedback Form State
    const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [category, setCategory] = useState<'Better lighting' | 'Increased patrol' | 'Cleaner environment' | 'Still risky' | 'Suspicious activity continues' | undefined>(undefined);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    const positiveCategories = ['Better lighting', 'Increased patrol', 'Cleaner environment'] as const;
    const negativeCategories = ['Still risky', 'Suspicious activity continues'] as const;

    const Icon = STATUS_ICON[complaint.status] || AlertTriangle;
    const stepIndex = Math.max(0, STATUS_ORDER.indexOf(complaint.status));

    const existingFeedback = (feedbacks || []).find(f => f.complaint_id === complaint.id && f.user_id === profile?.id);
    const canLeaveFeedback = ["Action Taken", "Closed"].includes(complaint.status) && !existingFeedback;

    // Haversine distance helper
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    const handleFeedbackSubmit = async () => {
        if (!profile || profile.id === 'anonymous') {
            toast.error("Authentication required to submit validation.");
            return;
        }

        if (!sentiment || rating === 0) {
            toast.error("Please provide both sentiment and a rating.");
            return;
        }

        setSubmittingFeedback(true);

        try {
            // Get user location to verify 2km radius
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
            });

            const dist = getDistanceFromLatLonInKm(
                pos.coords.latitude, pos.coords.longitude,
                complaint.latitude || 28.6139, complaint.longitude || 77.2090
            );

            if (dist > 2) {
                toast.warning("You are outside the 2km radius, but we'll accept this for the demo.", { duration: 3000 });
            }

            // Fake mass-review detection demo
            const recentFeedbacksByUser = feedbacks.filter(f => f.user_id === profile.id && new Date(f.created_at).getTime() > Date.now() - 3600000);
            if (recentFeedbacksByUser.length > 3) {
                toast.warning("Suspicious mass validation detected, but allowing for demo.");
            }
        } catch (e) {
            toast.warning("Could not verify your location. Allowing for demo.");
        }

        await submitFeedback({
            complaint_id: complaint.id,
            area_lat: complaint.latitude || 28.6139,
            area_lng: complaint.longitude || 77.2090,
            user_id: profile.id,
            rating,
            sentiment,
            review_text: reviewText,
            category
        });
        setSubmittingFeedback(false);
        toast.success("Feedback submitted successfully. Thank you for making your community safer!");
    };

    return (
        <motion.div
            layout
            className="glass-card-strong border-white/60 overflow-hidden"
        >
            <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl border shrink-0 ${STATUS_COLOR[complaint.status] || 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                        {Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                {complaint.case_id || 'UNKNOWN-ID'}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${SEVERITY_COLOR[complaint.severity || 'low']}`}>
                                {complaint.severity || 'low'}
                            </span>
                            {complaint.is_anonymous && (
                                <span className="text-[9px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/20">
                                    🔒 Anonymous
                                </span>
                            )}
                        </div>
                        <div className="font-bold text-foreground">{complaint.incident_type} Incident</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{complaint.manual_location || 'GPS Location'}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{complaint.date} at {complaint.time}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                    {canLeaveFeedback && !expanded && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-blue-500 text-blue-600 bg-blue-50 animate-pulse">
                            <MessageSquare className="h-3 w-3" /> Needs Validation
                        </span>
                    )}
                    <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${STATUS_COLOR[complaint.status] || 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                        {Icon && <Icon className="h-3 w-3" />}{complaint.status || 'Unknown Status'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 border-t border-slate-100/50 space-y-6 pt-6">
                            {/* Progress Timeline */}
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Investigation Progress</div>
                                <div className="flex items-center">
                                    {STATUS_ORDER.map((step, i) => {
                                        const done = complaint.status === 'False Report'
                                            ? false
                                            : i <= stepIndex;
                                        const current = STATUS_ORDER[i] === complaint.status;
                                        return (
                                            <div key={step} className="flex items-center flex-1 last:flex-none">
                                                <div className="flex flex-col items-center">
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all ${done
                                                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                        : 'bg-white border-slate-200 text-slate-300'
                                                        } ${current && !done ? 'ring-4 ring-primary/20' : ''}`}>
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                    <span className={`text-[8px] font-bold mt-1.5 text-center leading-tight max-w-[60px] ${done ? 'text-primary' : 'text-slate-400'}`}>
                                                        {step}
                                                    </span>
                                                </div>
                                                {i < STATUS_ORDER.length - 1 && (
                                                    <div className={`h-0.5 flex-1 mx-1 mb-5 ${STATUS_ORDER[i + 1] && i < stepIndex ? 'bg-primary' : 'bg-slate-200'}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-4 rounded-2xl bg-slate-50">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Your Report</div>
                                <p className="text-sm text-foreground leading-relaxed">{complaint.description || 'No description provided.'}</p>
                            </div>

                            {/* Action Notes from Authority */}
                            {complaint.action_notes && complaint.action_notes.length > 0 && (
                                <div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Authority Updates</div>
                                    <div className="space-y-2">
                                        {complaint.action_notes.map((note, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                                                <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[9px] font-bold text-emerald-700 uppercase">{note.officer || 'Authority'}</span>
                                                        <span className="text-[9px] text-muted-foreground">{formatDate(note.timestamp)}</span>
                                                    </div>
                                                    <p className="text-xs text-foreground">{note.note}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Community Safety Feedback Section */}
                            {canLeaveFeedback && (
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 mt-6 shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Shield className="w-24 h-24 text-blue-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex gap-3 items-center mb-4">
                                            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-900 leading-tight">Area Safety Validation</h4>
                                                <p className="text-xs text-blue-700/80">Authorities have taken action. Does this area feel safer now?</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setSentiment('positive')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${sentiment === 'positive'
                                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-100'
                                                        : 'bg-white border-blue-100/50 text-slate-500 hover:bg-emerald-50/50'
                                                        }`}
                                                >
                                                    <ThumbsUp className={`h-4 w-4 ${sentiment === 'positive' ? 'fill-emerald-600/20' : ''}`} />
                                                    <span className="font-semibold text-sm">Yes, Feels Safer</span>
                                                </button>
                                                <button
                                                    onClick={() => setSentiment('negative')}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${sentiment === 'negative'
                                                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-md shadow-rose-100'
                                                        : 'bg-white border-blue-100/50 text-slate-500 hover:bg-rose-50/50'
                                                        }`}
                                                >
                                                    <ThumbsDown className={`h-4 w-4 ${sentiment === 'negative' ? 'fill-rose-600/20' : ''}`} />
                                                    <span className="font-semibold text-sm">Still Unsafe</span>
                                                </button>
                                            </div>

                                            {sentiment && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-4"
                                                >
                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-blue-800/60 mb-2 block">Safety Rating</label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setRating(star)}
                                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                                >
                                                                    <Star className={`h-8 w-8 ${rating >= star
                                                                        ? sentiment === 'positive' ? 'text-emerald-500 fill-emerald-500' : 'text-amber-500 fill-amber-500'
                                                                        : 'text-slate-200'
                                                                        }`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-blue-800/60 mb-2 block">Optional Category Tag</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(sentiment === 'positive' ? positiveCategories : negativeCategories).map(cat => (
                                                                <button
                                                                    key={cat}
                                                                    onClick={() => setCategory(cat)}
                                                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors ${category === cat
                                                                        ? sentiment === 'positive' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600'
                                                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-wider font-bold text-blue-800/60 mb-2 block">Optional Review</label>
                                                        <textarea
                                                            value={reviewText}
                                                            onChange={e => setReviewText(e.target.value)}
                                                            placeholder="Share specific details about the current safety condition..."
                                                            className="w-full text-sm rounded-xl border-blue-100 bg-white/80 p-3 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[80px]"
                                                        />
                                                    </div>

                                                    <Button
                                                        onClick={handleFeedbackSubmit}
                                                        disabled={submittingFeedback || rating === 0}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                                                    >
                                                        {submittingFeedback ? 'Submitting...' : 'Submit Validation'}
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {existingFeedback && (
                                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-4">
                                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                                            Safety Validated
                                            {existingFeedback.category && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">{existingFeedback.category}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-emerald-700/80 mt-0.5">
                                            You marked this area as {existingFeedback.sentiment === 'positive' ? 'safer' : 'still unsafe'} with a {existingFeedback.rating}-star rating.
                                        </p>
                                        {existingFeedback.review_text && (
                                            <p className="text-xs text-emerald-800 mt-2 italic">"{existingFeedback.review_text}"</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Filed at */}
                            <div className="text-[10px] text-muted-foreground text-right">
                                Filed: {formatDate(complaint.created_at)}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function ComplaintTracker() {
    const { profile } = useAuthStore();
    const { complaints, loading, fetchComplaints } = useComplaintStore();
    const [caseIdSearch, setCaseIdSearch] = useState('');

    const { fetchFeedbacks } = useAreaFeedbackStore();

    useEffect(() => {
        fetchComplaints();
        fetchFeedbacks();
    }, [fetchComplaints, fetchFeedbacks]);

    // Show complaints belonging to this user (or all for demo)
    const myComplaints = complaints.filter(c =>
        !c.user_id || c.user_id === 'anonymous' || c.user_id === profile?.id || c.user_id === 'demo-user-id'
    );

    const searched = caseIdSearch.trim()
        ? myComplaints.filter(c =>
            (c.case_id || '').toLowerCase().includes(caseIdSearch.toLowerCase()) ||
            (c.incident_type || '').toLowerCase().includes(caseIdSearch.toLowerCase())
        )
        : myComplaints;

    return (
        <div className="min-h-screen pt-28 pb-12 section-padding">
            <div className="mx-auto max-w-4xl">
                <AnimatedSection>
                    <div className="text-center mb-12">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
                            <FileText className="h-8 w-8" />
                        </div>
                        <h1 className="font-heading text-4xl font-bold mb-3">
                            Complaint <span className="gradient-text">Tracker</span>
                        </h1>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Track the real-time status of your submitted complaints and view authority action updates.
                        </p>
                    </div>
                </AnimatedSection>

                {/* Search */}
                <AnimatedSection delay={0.1}>
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            className="pl-12 h-14 rounded-2xl border-white bg-white/60 focus:bg-white focus:border-primary shadow-sm"
                            placeholder="Search by Case ID or incident type..."
                            value={caseIdSearch}
                            onChange={e => setCaseIdSearch(e.target.value)}
                        />
                        {caseIdSearch && (
                            <button onClick={() => setCaseIdSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                            </button>
                        )}
                    </div>
                </AnimatedSection>

                {/* Complaints */}
                <div className="space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 rounded-3xl bg-white/40 animate-pulse" />
                        ))
                    ) : searched.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Shield className="h-16 w-16 mx-auto opacity-20 mb-4" />
                            <p className="font-bold">No complaints found</p>
                            <p className="text-sm mt-1">Submit a complaint from your dashboard to see it here.</p>
                        </div>
                    ) : (
                        searched.map((complaint, i) => (
                            <AnimatedSection key={complaint.id} delay={i * 0.05}>
                                <ComplaintCard complaint={complaint} />
                            </AnimatedSection>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
