import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Filter, Shield, Info, Calendar, Clock, Map as MapIcon, Layers, ThumbsUp, Activity } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { useAreaFeedbackStore } from "@/store/useAreaFeedbackStore";

export default function SafetyHeatmap() {
    const [activeFilter, setActiveFilter] = useState('all');
    const [timeRange, setTimeRange] = useState('24h');

    const { feedbacks, fetchFeedbacks } = useAreaFeedbackStore();

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    // Calculate dynamic scores based on feedback
    const calculateDynamicScore = (baseScore: number, wardName: string) => {
        // Find feedbacks roughly matching this ward for demo purposes
        // In reality this would use geo-bounds
        // Just demonstrating the formula: (Base × 0.6) + (Pos% × 0.3) + (Neg × 0.1)

        // Let's create some dummy stats if no real feedback exists
        let positiveCount = 0;
        let negativeCount = 0;
        let totalFeedback = 0;

        feedbacks.forEach(f => {
            // For demo, distribute feedbacks randomly or by some logic
            totalFeedback++;
            if (f.sentiment === 'positive') positiveCount++;
            else negativeCount++;
        });

        if (totalFeedback === 0) return { score: baseScore, isImproved: false };

        const posPercentage = (positiveCount / totalFeedback) * 100;
        const negFactor = (negativeCount / totalFeedback) * 100;

        let newScore = (baseScore * 0.6) + (posPercentage * 0.3) + (negFactor * 0.1);

        // Just for demo, let's say Downhill East had positive feedback
        if (wardName === "Downhill East" && feedbacks.length > 0) {
            newScore = Math.max(80, newScore); // simulate improvement
            return { score: Math.round(newScore), isImproved: true };
        }

        return { score: Math.round(newScore), isImproved: posPercentage > 70 };
    };

    const baseWards = [
        { id: 1, name: "Sector 4-A", risk: "High", baseScore: 25, color: "bg-rose" },
        { id: 2, name: "Downhill East", risk: "Low", baseScore: 88, color: "bg-emerald-500" },
        { id: 3, name: "Central Hub", risk: "Medium", baseScore: 55, color: "bg-gold" },
        { id: 4, name: "West Gate", risk: "Low", baseScore: 82, color: "bg-emerald-500" },
    ];

    const wards = baseWards.map(w => {
        const { score, isImproved } = calculateDynamicScore(w.baseScore, w.name);
        let risk = "Low";
        let color = "bg-emerald-500";
        if (score < 40) { risk = "High"; color = "bg-rose"; }
        else if (score < 70) { risk = "Medium"; color = "bg-gold"; }

        return { ...w, score, risk, color, isImproved };
    });

    return (
        <div className="min-h-screen pt-28 pb-12 bg-slate-50/30">
            <div className="mx-auto max-w-7xl px-4">
                <AnimatedSection>
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="font-heading text-4xl font-bold text-foreground">
                                Intelligence <span className="gradient-text">Heatmap</span>
                            </h1>
                            <p className="text-muted-foreground mt-2">Real-time incident density and ward-level safety index.</p>
                        </div>
                        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white shadow-sm">
                            {['24h', '7d', '30d'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeRange(t)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === t ? 'bg-midnight text-white shadow-lg' : 'text-muted-foreground hover:bg-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Controls Sidebar */}
                    <AnimatedSection delay={0.1} className="lg:col-span-1">
                        <div className="glass-card-strong p-6 space-y-8 border-white shadow-xl">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </h3>
                                <div className="space-y-2">
                                    {['All Incidents', 'Theft', 'Harassment', 'Infrastructure', 'Medical'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setActiveFilter(f.toLowerCase())}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${activeFilter === f.toLowerCase() ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-white/50 border-white text-muted-foreground hover:border-primary/20'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Layer Density
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold mb-2">
                                            <span>Heat Intensity</span>
                                            <span>70%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose w-[70%]" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                        <div className="h-3 w-3 rounded-full bg-rose" /> High Risk Zone
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                        <div className="h-3 w-3 rounded-full bg-gold" /> Cautionary Area
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                        <div className="h-3 w-3 rounded-full bg-emerald-500" /> Safe Zone
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" /> Recently Improved / Secured
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <Info className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">AI Projection</span>
                                </div>
                                <p className="text-[10px] text-primary/80 leading-relaxed font-medium">
                                    Next 6 hours show a potential 12% increase in Central Hub density due to local events.
                                </p>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Main Map View */}
                    <AnimatedSection delay={0.2} className="lg:col-span-3">
                        <div className="space-y-6">
                            <div className="glass-card-strong h-[600px] relative overflow-hidden rounded-3xl border-white shadow-2xl">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0060%2C40.7128%2C-73.9060%2C40.8128&amp;layer=mapnik"
                                    className="grayscale contrast-125 opacity-80"
                                ></iframe>

                                {/* Floating Legends */}
                                <div className="absolute top-6 left-6 space-y-2">
                                    <div className="glass-card p-3 flex items-center gap-3 border-white shadow-lg animate-fade-in">
                                        <div className="h-2 w-2 rounded-full bg-rose animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Incidents Acitve</span>
                                    </div>
                                </div>

                                {/* Map Overlay Controls */}
                                <div className="absolute bottom-6 left-6 glass-card p-2 flex flex-col gap-2 border-white shadow-xl">
                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl">
                                        <MapIcon className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-primary hover:bg-primary/10 rounded-xl">
                                        <Shield className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Ward Safety List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {wards.map((ward, i) => (
                                    <motion.div
                                        key={ward.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="glass-card p-5 border-white hover:shadow-xl transition-all cursor-pointer group bg-white/40"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${ward.risk === 'High' ? 'bg-rose/10 text-rose' :
                                                ward.risk === 'Medium' ? 'bg-gold/10 text-gold' : 'bg-emerald-500/10 text-emerald-500'
                                                }`}>
                                                {ward.risk} Risk
                                            </span>
                                            {ward.isImproved && (
                                                <span className="text-[9px] font-bold uppercase flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">
                                                    <ThumbsUp className="h-3 w-3" /> Improved
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-heading font-bold text-sm mb-1">{ward.name}</h4>
                                        <div className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
                                            <Activity className="h-3 w-3" /> Area Safety Score
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${ward.isImproved ? 'bg-blue-500' : ward.color} transition-all duration-1000`} style={{ width: `${ward.score}%` }} />
                                            </div>
                                            <span className={`text-[10px] font-mono font-bold ${ward.isImproved ? 'text-blue-600' : 'text-muted-foreground'}`}>{ward.score}/100</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </div>
    );
}
