
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    Navigation, Search, Shield, ShieldCheck, MapPin,
    Clock, Ruler, AlertTriangle, Share2, PhoneCall,
    ChevronRight, Info, Zap, Compass, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import { useAreaFeedbackStore } from "@/store/useAreaFeedbackStore";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

// Mock Risk Areas for the "AI Logic"
const RISK_ZONES = [
    { coords: [28.615, 77.215] as [number, number], radius: 400, risk: 0.8, type: 'crime' },
    { coords: [28.625, 77.205] as [number, number], radius: 600, risk: 0.6, type: 'dark' },
    { coords: [28.605, 77.220] as [number, number], radius: 300, risk: 0.9, type: 'isolated' },
];

type RouteType = 'safest' | 'balanced' | 'fastest';

interface RouteStats {
    time: string;
    distance: string;
    safetyScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    reasoning: string;
    path: [number, number][];
}

export default function SafeNavigation() {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
    const [destination, setDestination] = useState<[number, number] | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<RouteType>('safest');
    const [isCalculating, setIsCalculating] = useState(false);

    // Quick Feedback State over Navigation
    const [promptFeedback, setPromptFeedback] = useState(false);
    const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null);
    const [rating, setRating] = useState(0);

    // UI Markers/Layers
    const routePolyline = useRef<L.Polyline | null>(null);
    const destMarker = useRef<L.Marker | null>(null);
    const userMarker = useRef<L.CircleMarker | null>(null);
    const riskLayers = useRef<L.LayerGroup | null>(null);

    const [stats, setStats] = useState<Record<RouteType, RouteStats>>({
        safest: {
            time: "18 min",
            distance: "4.2 km",
            safetyScore: 98,
            riskLevel: "Low",
            reasoning: "Avoids Sector 4 high-crime zone and uses well-lit main corridors.",
            path: []
        },
        balanced: {
            time: "12 min",
            distance: "3.5 km",
            safetyScore: 82,
            riskLevel: "Moderate",
            reasoning: "Standard route with 2 minutes of traversal through a moderate-risk zone.",
            path: []
        },
        fastest: {
            time: "9 min",
            distance: "2.8 km",
            safetyScore: 45,
            riskLevel: "High",
            reasoning: "Passes through multiple isolated/poorly lit alleys for speed.",
            path: []
        }
    });

    const { feedbacks, fetchFeedbacks } = useAreaFeedbackStore();

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    useEffect(() => {
        if (!mapRef.current) return;

        leafletMap.current = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([28.6139, 77.2090], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO'
        }).addTo(leafletMap.current);

        riskLayers.current = L.layerGroup().addTo(leafletMap.current);

        // Render Risk Zones visually
        RISK_ZONES.forEach(zone => {
            L.circle(zone.coords, {
                radius: zone.radius,
                color: zone.risk > 0.7 ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.1,
                weight: 1
            }).addTo(riskLayers.current!);
        });

        // GPS Tracking
        leafletMap.current.locate({ watch: true, enableHighAccuracy: true });

        leafletMap.current.on('locationfound', (e) => {
            const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setCurrentPos(pos);

            if (userMarker.current) {
                userMarker.current.setLatLng(e.latlng);
            } else {
                userMarker.current = L.circleMarker(e.latlng, {
                    radius: 8,
                    fillColor: '#8b5cf6',
                    fillOpacity: 1,
                    color: 'white',
                    weight: 3
                }).addTo(leafletMap.current!);
            }
        });

        // Map Click to set destination
        leafletMap.current.on('click', (e) => {
            const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setDestination(pos);
            const currentSearch = `${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}`;
            setSearchQuery(currentSearch);
            updateDestinationMarker(pos);
            generateRoutes(currentPos || [28.6139, 77.2090], pos);
            toast.success("Destination locked on map.");
        });

        return () => {
            leafletMap.current?.remove();
        };
    }, []);

    const updateDestinationMarker = (pos: [number, number]) => {
        if (!leafletMap.current) return;
        if (destMarker.current) destMarker.current.remove();

        const icon = L.divIcon({
            className: 'dest-marker',
            html: `<div class="p-2 bg-midnight text-white rounded-full shadow-2xl border-4 border-white animate-bounce"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        destMarker.current = L.marker(pos, { icon }).addTo(leafletMap.current);
    };

    const drawRoute = (type: RouteType, path: [number, number][]) => {
        if (!leafletMap.current || path.length === 0) return;
        if (routePolyline.current) routePolyline.current.remove();

        const colors = { safest: '#10b981', balanced: '#f59e0b', fastest: '#3b82f6' };

        routePolyline.current = L.polyline(path, {
            color: colors[type],
            weight: 8,
            opacity: 0.8,
            lineJoin: 'round',
            dashArray: type === 'safest' ? '' : '10, 10'
        }).addTo(leafletMap.current);

        leafletMap.current.fitBounds(routePolyline.current.getBounds(), { padding: [100, 100] });
    };

    const generateRoutes = (start: [number, number], end: [number, number]) => {
        const paths: Record<RouteType, [number, number][]> = {
            fastest: [start, end],
            balanced: [start, [start[0] + (end[0] - start[0]) * 0.5 + 0.005, start[1] + (end[1] - start[1]) * 0.5 - 0.005], end],
            safest: [start, [start[0] + (end[0] - start[0]) * 0.3 - 0.01, start[1] + (end[1] - start[1]) * 0.3 + 0.005], [start[0] + (end[0] - start[0]) * 0.7 - 0.005, start[1] + (end[1] - start[1]) * 0.7 + 0.015], end]
        };

        // Determine dynamic reasoning based on feedback
        let safestReasoning = "Avoids Sector 4 high-crime zone and uses well-lit main corridors.";
        let safestScore = 98;

        const hasNegativeFeedback = feedbacks.some(f => f.sentiment === 'negative');
        const hasPositiveFeedback = feedbacks.some(f => f.sentiment === 'positive');

        if (hasNegativeFeedback) {
            safestReasoning += " This route strictly avoids area with ongoing negative reports.";
        }
        if (hasPositiveFeedback) {
            safestReasoning += " Route prefers recently improved community-validated safe zones.";
            safestScore = 100;
        }

        setStats(prev => ({
            ...prev,
            safest: {
                ...prev.safest,
                path: paths.safest,
                reasoning: safestReasoning,
                safetyScore: safestScore
            },
            balanced: { ...prev.balanced, path: paths.balanced },
            fastest: { ...prev.fastest, path: paths.fastest }
        }));

        drawRoute(selectedRoute, paths[selectedRoute]);

        // Fake trigger a survey if the user "enters" a mapped safe zone
        if (Math.random() > 0.5) { // 50% chance for demo to show prompt
            setTimeout(() => {
                setPromptFeedback(true);
            }, 3000); // 3 seconds after path calculations
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        setIsCalculating(true);
        try {
            const hash = searchQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const fakeDest: [number, number] = [28.6139 + (hash % 100) / 2000, 77.2090 + (hash % 80) / 2000];
            setDestination(fakeDest);
            updateDestinationMarker(fakeDest);
            generateRoutes(currentPos || [28.6139, 77.2090], fakeDest);
        } catch (e) {
            toast.error("Destination discovery failed.");
        } finally {
            setIsCalculating(false);
        }
    };

    const switchRoute = (type: RouteType) => {
        setSelectedRoute(type);
        if (stats[type].path.length > 0) {
            drawRoute(type, stats[type].path);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <main className="flex-1 pt-20 relative flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-64px)]">
                <div className="w-full lg:w-[450px] bg-white border-r z-20 flex flex-col shadow-2xl overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <AnimatedSection>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-heading font-black tracking-tight flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><Zap className="h-6 w-6" /></div>
                                    Safe Route AI
                                </h1>
                                <p className="text-sm text-muted-foreground">Neural routing optimized for physical security and visibility.</p>
                            </div>
                        </AnimatedSection>

                        <div className="space-y-4">
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                <Input readOnly className="pl-12 h-14 bg-slate-50/50 border-emerald-100 rounded-2xl text-xs font-bold" value="Current Location (GPS Active)" />
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                <Input placeholder="Enter destination..." className="pl-12 h-14 rounded-2xl border-white shadow-xl bg-white focus-visible:ring-primary/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                                <Button onClick={handleSearch} className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-midnight hover:bg-black text-white"><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                            {(['safest', 'balanced', 'fastest'] as const).map((type) => (
                                <button key={type} onClick={() => switchRoute(type)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRoute === type ? 'bg-white text-midnight shadow-md' : 'text-muted-foreground hover:bg-white/50'}`}>{type}</button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={selectedRoute} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                <div className={`p-6 rounded-3xl border transition-all ${selectedRoute === 'safest' ? 'bg-emerald-50/30 border-emerald-500/20' : selectedRoute === 'balanced' ? 'bg-amber-50/30 border-amber-500/20' : 'bg-blue-50/30 border-blue-500/20'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${selectedRoute === 'safest' ? 'bg-emerald-500' : selectedRoute === 'balanced' ? 'bg-amber-500' : 'bg-blue-500'} text-white shadow-lg`}><Shield className="h-5 w-5" /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Safety Matrix</p>
                                                <p className="text-xl font-bold">{stats[selectedRoute].safetyScore}% Secure</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${stats[selectedRoute].riskLevel === 'Low' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : stats[selectedRoute].riskLevel === 'Moderate' ? 'border-amber-500 text-amber-600 bg-amber-50' : 'border-rose-500 text-rose-600 bg-rose-50'}`}>{stats[selectedRoute].riskLevel} Risk</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="glass-card p-3 bg-white/80 border-white">
                                            <div className="flex items-center gap-2 mb-1"><Clock className="h-3 w-3 text-primary" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Time</span></div>
                                            <p className="text-sm font-black">{stats[selectedRoute].time}</p>
                                        </div>
                                        <div className="glass-card p-3 bg-white/80 border-white">
                                            <div className="flex items-center gap-2 mb-1"><Ruler className="h-3 w-3 text-primary" /><span className="text-[10px] font-bold text-muted-foreground uppercase">Distance</span></div>
                                            <p className="text-sm font-black">{stats[selectedRoute].distance}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start p-4 bg-white/60 rounded-2xl border border-white"><Info className="h-4 w-4 text-primary shrink-0 mt-0.5" /><p className="text-xs font-medium leading-relaxed italic text-slate-600">"{stats[selectedRoute].reasoning}"</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button onClick={() => toast.success("Route Link Shared")} variant="outline" className="h-14 rounded-2xl border-white bg-white shadow-sm flex items-center gap-2 font-bold text-xs"><Share2 className="h-4 w-4" /> Share Route</Button>
                                    <Button onClick={() => window.open('tel:911')} variant="outline" className="h-14 rounded-2xl border-white bg-white shadow-sm flex items-center gap-2 font-bold text-xs text-rose-500"><PhoneCall className="h-4 w-4" /> Emergency</Button>
                                </div>
                                <Button onClick={() => toast.success("Safe Navigation Active")} className="w-full h-18 rounded-3xl bg-midnight hover:bg-black text-white shadow-2xl shadow-midnight/20 font-black uppercase tracking-[0.2em] text-xs">Launch Safe Navigation <Compass className="ml-3 h-5 w-5" /></Button>
                            </motion.div>
                        </AnimatePresence>

                        {/* Mid-Navigation Area Query Popup Overlay */}
                        <AnimatePresence>
                            {promptFeedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-2xl relative"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-xl bg-blue-500 text-white animate-pulse">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900 leading-tight">Area Check-In</h4>
                                            <p className="text-[10px] text-blue-700/80">You're passing a recently secured zone. Feels safe?</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-3">
                                        <button onClick={() => setSentiment('positive')} className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${sentiment === 'positive' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'}`}>
                                            <ThumbsUp className="h-4 w-4" /> Safer Now
                                        </button>
                                        <button onClick={() => setSentiment('negative')} className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${sentiment === 'negative' ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'}`}>
                                            <ThumbsDown className="h-4 w-4" /> Unsafe
                                        </button>
                                    </div>
                                    {sentiment && (
                                        <div className="space-y-3">
                                            <div className="flex justify-center gap-2 py-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star onClick={() => setRating(star)} key={star} className={`h-6 w-6 cursor-pointer hover:scale-110 transition-transform ${rating >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => setPromptFeedback(false)} variant="ghost" className="flex-1 text-slate-500 text-xs">Skip</Button>
                                                <Button disabled={rating === 0} onClick={() => {
                                                    toast.success("Feedback recorded! Thanks for keeping the network secure.");
                                                    setPromptFeedback(false);
                                                }} className="flex-1 bg-blue-600 text-white text-xs">Submit</Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <div ref={mapRef} className="absolute inset-0 z-10" />
                    <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                        <div className="glass-card-strong p-2 flex flex-col gap-1">
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-lg"><Zap className="h-5 w-5 text-primary" /></Button>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-lg"><ShieldCheck className="h-5 w-5 text-emerald-500" /></Button>
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-midnight/90 backdrop-blur-xl px-8 py-4 rounded-full border border-white/20 shadow-2xl flex items-center gap-6 min-w-[300px]">
                        <div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-black text-white uppercase tracking-widest">System Armed</span></div>
                        <div className="h-4 w-[1px] bg-white/20" /><span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">Real-time location sharing active with 3 contacts</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
