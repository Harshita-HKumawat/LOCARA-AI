import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuthStore } from "@/store/useAuthStore";
import { useIncidentStore } from "@/store/useIncidentStore";
import { Shield, MapPin, AlertTriangle, Radio, PhoneCall, Zap, Navigation, TrendingDown, Eye, ShieldCheck, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection";
import MultiStepIncidentForm from "@/components/MultiStepIncidentForm";
import { useTranslation } from "@/hooks/useTranslation";
import { useSafetyStore } from "@/store/useSafetyStore";
import ComplaintNotificationsPanel from "@/components/ComplaintNotificationsPanel";

export default function CitizenDashboard() {
    const { profile } = useAuthStore();
    const { reportIncident, triggerSOS, incidents, fetchIncidents, subscribeToIncidents } = useIncidentStore();
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [sosActive, setSosActive] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [activeTab, setActiveTab] = useState<'report' | 'route'>('report');
    const { t } = useTranslation();

    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const userMarker = useRef<L.CircleMarker | null>(null);

    const {
        userLocation,
        searchedLocation,
        locationName,
        safetyScore,
        safetyLevel,
        safetyColor,
        isTracking,
        mode,
        setMode,
        startTracking,
        setUserLocation,
        setSearchedLocation,
        searchLocation,
        nearbyIncidents
    } = useSafetyStore();

    const [searchQuery, setSearchQuery] = useState("");
    const searchedMarker = useRef<L.Marker | null>(null);

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        const result = await searchLocation(query);
        if (result) {
            setSearchedLocation(result.lat, result.lng, result.name);
            toast.success(`Showing results for: ${query}`);
        } else {
            toast.error("Location not found. Try a more specific address.");
        }
    };

    useEffect(() => {
        fetchIncidents();
        const unsub = subscribeToIncidents();

        // Start live location tracking
        startTracking();

        return () => {
            unsub();
        };
    }, [fetchIncidents, subscribeToIncidents, startTracking]);

    useEffect(() => {
        if (mode === 'live' && userLocation && leafletMap.current) {
            if (userMarker.current) {
                userMarker.current.setLatLng([userLocation.lat, userLocation.lng]);
            } else {
                userMarker.current = L.circleMarker([userLocation.lat, userLocation.lng], {
                    radius: 10,
                    fillColor: '#8b5cf6',
                    fillOpacity: 1,
                    color: 'white',
                    weight: 3
                }).addTo(leafletMap.current);
            }
            leafletMap.current.setView([userLocation.lat, userLocation.lng], 15);
        }
    }, [userLocation, mode]);

    useEffect(() => {
        if (mode === 'search' && searchedLocation && leafletMap.current) {
            if (searchedMarker.current) {
                searchedMarker.current.setLatLng([searchedLocation.lat, searchedLocation.lng]);
            } else {
                const searchIcon = L.divIcon({
                    className: 'relative',
                    html: `<div class="h-6 w-6 bg-orange-500 border-4 border-white rounded-full shadow-2xl"></div>`,
                    iconSize: [24, 24]
                });
                searchedMarker.current = L.marker([searchedLocation.lat, searchedLocation.lng], { icon: searchIcon }).addTo(leafletMap.current);
            }
            leafletMap.current.setView([searchedLocation.lat, searchedLocation.lng], 15);
        } else if (mode === 'live' && searchedMarker.current) {
            searchedMarker.current.remove();
            searchedMarker.current = null;
        }
    }, [searchedLocation, mode]);

    const [selectedPath, setSelectedPath] = useState<'safest' | 'fastest'>('safest');
    const [isNavigating, setIsNavigating] = useState(false);
    const polylineRef = useRef<L.Polyline | null>(null);
    const safeZonesRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (mapRef.current && !leafletMap.current) {
            leafletMap.current = L.map(mapRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([28.6139, 77.2090], 13);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO'
            }).addTo(leafletMap.current);

            safeZonesRef.current = L.layerGroup().addTo(leafletMap.current);

            // Add some mock safe zones
            const safeIcon = (type: 'police' | 'hospital') => L.divIcon({
                className: 'custom-safe-icon',
                html: `<div class="p-2 rounded-full border-2 border-white shadow-lg ${type === 'police' ? 'bg-primary' : 'bg-emerald-500'} text-white">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            ${type === 'police' ? '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' : '<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/>'}
                        </svg>
                      </div>`,
                iconSize: [24, 24]
            });

            // Demo safe zones near New Delhi area
            L.marker([28.615, 77.210], { icon: safeIcon('police') }).addTo(safeZonesRef.current).bindPopup("<b>Safe Booth Sector 1</b><br/>Active Patrol Point");
            L.marker([28.620, 77.205], { icon: safeIcon('hospital') }).addTo(safeZonesRef.current).bindPopup("<b>City Care Center</b><br/>24/7 Medical Assistance");

            leafletMap.current.locate({ setView: true, maxZoom: 15 });

            leafletMap.current.on('locationfound', (e) => {
                const icon = L.divIcon({
                    className: 'relative',
                    html: `<div class="h-5 w-5 bg-primary border-4 border-white rounded-full shadow-2xl animate-pulse"></div>`,
                    iconSize: [20, 20]
                });
                L.marker(e.latlng, { icon }).addTo(leafletMap.current!);
                setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            });

            leafletMap.current.on('click', (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng;
                setLocation({ lat, lng });

                if (markerRef.current) {
                    markerRef.current.setLatLng(e.latlng);
                } else if (leafletMap.current) {
                    const customIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color: hsl(280, 40%, 55%); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.5);"></div>`,
                        iconSize: [14, 14],
                        iconAnchor: [7, 7]
                    });
                    markerRef.current = L.marker(e.latlng, { icon: customIcon }).addTo(leafletMap.current);
                }
                toast.info("Incident Location Set.");
            });
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (sosActive && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (sosActive && countdown === 0) {
            handleFinalSOS();
            setSosActive(false);
            setCountdown(5);
        }
        return () => clearTimeout(timer);
    }, [sosActive, countdown]);

    const handleSOSClick = () => {
        setSosActive(true);
        toast.warning("SOS Countdown Started!", { description: "Tap again to cancel." });
    };

    const cancelSOS = () => {
        setSosActive(false);
        setCountdown(5);
        toast.info("SOS Cancelled");
    };

    const handleFinalSOS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    triggerSOS(pos.coords.latitude, pos.coords.longitude, profile?.id || 'anonymous');
                    toast.error("SOS Dispatched! Police notified.");
                },
                err => {
                    toast.error("Location error. Could not dispatch SOS automatically.", { description: err.message });
                },
                { enableHighAccuracy: true }
            );
        } else {
            toast.error("Geolocation is not supported by this browser.");
        }
    };


    const handleStartNavigation = () => {
        if (!location) {
            toast.error("Set a destination on the map first.");
            return;
        }

        setIsNavigating(true);
        if (polylineRef.current) {
            polylineRef.current.remove();
        }

        if (leafletMap.current) {
            const start: [number, number] = [28.6139, 77.2090]; // Fake start
            const end: [number, number] = [location.lat, location.lng];

            // Create a fake curved/safe path
            const mid: [number, number] = [(start[0] + end[0]) / 2 + 0.002, (start[1] + end[1]) / 2 - 0.002];

            polylineRef.current = L.polyline([start, mid, end], {
                color: selectedPath === 'safest' ? '#8b5cf6' : '#f59e0b',
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round',
                dashArray: isNavigating ? '10, 10' : undefined
            }).addTo(leafletMap.current);

            leafletMap.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
        }

        toast.success("Safe Navigation Active!", {
            description: `Guided route via ${selectedPath === 'safest' ? 'High Visibility' : 'Express'} corridor lock-on.`
        });
    };

    const mockDirections = [
        { text: "Head North toward High-Lit Police Post", icon: Navigation },
        { text: "Turn Right at Sector 4 Junction (Patrol Active)", icon: ShieldCheck },
        { text: "Straight for 400m through CCTV corridor", icon: Eye },
        { text: "Destination reached (Safe Haven)", icon: MapPin },
    ];

    return (
        <div className="min-h-screen pt-28 pb-12 section-padding bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <div className="mx-auto max-w-7xl">
                <AnimatedSection>
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Active Protection</span>
                            </div>
                            <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                                {t('welcome')}, <span className="gradient-text">{profile?.name || t('guardian')}</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">{t('safetyDashboardActive')}</p>
                        </div>

                        <div className="flex gap-4">
                            <div className={`glass-card px-6 py-4 flex items-center gap-4 transition-all ${safetyScore < 40 ? 'border-rose-500/50 bg-rose-50/50' : 'border-emerald-500/20'}`}>
                                <div className={`p-3 rounded-full ${safetyScore < 40 ? 'bg-rose text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className={`text-2xl font-bold ${safetyScore < 40 ? 'text-rose' : 'text-emerald-600'}`}>{safetyScore}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{safetyLevel}</div>
                                </div>
                            </div>
                            <div className="glass-card px-6 py-4 flex items-center gap-4 border-primary/20">
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <Eye className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-primary">{nearbyIncidents.length}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nearby Alerts</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Panel: Primary Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Safety Alert (Threshold < 40) */}
                        <AnimatePresence>
                            {safetyScore < 40 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                    className="p-4 rounded-2xl bg-rose/10 border border-rose/30 flex items-center gap-4 text-rose shadow-xl"
                                >
                                    <div className="p-3 rounded-full bg-rose text-white animate-pulse">
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase tracking-widest text-xs">High Risk Detection</h3>
                                        <p className="text-sm font-semibold">Warning: This area currently has a low safety score ({safetyScore}). Consider choosing a safer route.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Map & Toggle */}
                        <AnimatedSection>
                            <div className="glass-card-strong overflow-hidden flex flex-col h-[850px]">
                                <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/40">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={activeTab === 'report' ? 'default' : 'ghost'}
                                            onClick={() => setActiveTab('report')}
                                            className="rounded-full px-6"
                                        >
                                            <AlertTriangle className="h-4 w-4 mr-2" /> {t('reportIncident')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={activeTab === 'route' ? 'default' : 'ghost'}
                                            onClick={() => setActiveTab('route')}
                                            className="rounded-full px-6"
                                        >
                                            <Navigation className="h-4 w-4 mr-2" /> {t('safeRoute')}
                                        </Button>
                                    </div>
                                    <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Safe</span>
                                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> Moderate</span>
                                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose" /> High Risk</span>
                                    </div>
                                </div>

                                <div className="flex-1 relative">
                                    <div ref={mapRef} className="absolute inset-0 z-0" />

                                    {/* Location Search Bar Overlay */}
                                    <div className="absolute top-4 right-4 z-[1000] flex flex-col md:flex-row gap-2">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Search any location..."
                                                className="w-full md:w-80 h-12 pl-12 pr-4 rounded-2xl border-none shadow-2xl glass-card-strong focus:ring-2 ring-primary/30 transition-all font-bold text-xs bg-white/95 backdrop-blur-3xl"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSearch(searchQuery);
                                                }}
                                            />
                                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        {mode === 'search' && (
                                            <Button
                                                onClick={() => setMode('live')}
                                                className="h-12 rounded-2xl bg-midnight text-white shadow-2xl font-black uppercase tracking-widest text-[9px] px-6"
                                            >
                                                <Radio className="h-4 w-4 mr-2 animate-pulse" /> Resume Live GPS
                                            </Button>
                                        )}
                                    </div>

                                    {/* Action Overlays */}
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'report' ? (
                                            <motion.div
                                                key="report"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="absolute top-4 left-4 z-10 w-80 md:w-[400px] pointer-events-auto shadow-2xl"
                                            >
                                                <MultiStepIncidentForm
                                                    initialLocation={location}
                                                    onComplete={() => {
                                                        setActiveTab('report');
                                                        setLocation(null);
                                                        fetchIncidents();
                                                    }}
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="route"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="absolute top-4 left-4 z-10 w-72 glass-card p-8 border-white shadow-2xl bg-white/60"
                                            >
                                                <h3 className="font-heading font-bold text-2xl mb-6 tracking-tight">Safe Route AI</h3>
                                                <div className="space-y-6">
                                                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 border-dashed">
                                                        <p className="text-[10px] text-primary font-black uppercase mb-3 flex items-center gap-2">
                                                            <Zap className="h-4 w-4" /> Predictive Analysis
                                                        </p>
                                                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                                            AI is calculating routes based on 10M+ data points including street lighting, crowd flow, and patrol density.
                                                        </p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div
                                                            onClick={() => setSelectedPath('safest')}
                                                            className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all cursor-pointer ${selectedPath === 'safest' ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-white/40 border-transparent grayscale'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-2 w-2 rounded-full ${selectedPath === 'safest' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                                <span className="text-sm font-bold">Safest Path</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono font-bold opacity-60">12 MIN</span>
                                                        </div>
                                                        <div
                                                            onClick={() => setSelectedPath('fastest')}
                                                            className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm transition-all cursor-pointer ${selectedPath === 'fastest' ? 'bg-white border-gold ring-2 ring-gold/20' : 'bg-white/40 border-transparent grayscale'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-2 w-2 rounded-full ${selectedPath === 'fastest' ? 'bg-gold' : 'bg-slate-300'}`} />
                                                                <span className="text-sm font-bold">Fastest Path</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono font-bold opacity-60">8 MIN</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={handleStartNavigation}
                                                        className="w-full h-16 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl bg-midnight hover:bg-black text-white"
                                                    >
                                                        {isNavigating ? 'Recalculating...' : 'Activate Navigation'} <Navigation className="ml-2 h-4 w-4" />
                                                    </Button>

                                                    {isNavigating && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mt-6 space-y-3 border-t border-slate-100 pt-6"
                                                        >
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Step-by-Step Guidance</p>
                                                            {mockDirections.map((step, i) => (
                                                                <div key={i} className="flex gap-4 items-start">
                                                                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                                                                        <step.icon className="h-4 w-4" />
                                                                    </div>
                                                                    <p className="text-xs font-bold leading-relaxed">{step.text}</p>
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setIsNavigating(false);
                                                                    if (polylineRef.current) polylineRef.current.remove();
                                                                }}
                                                                className="w-full mt-4 text-[10px] uppercase font-black text-rose hover:bg-rose/5"
                                                            >
                                                                End Navigation
                                                            </Button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Map Legend/Status Overlay */}
                                    <div className="absolute bottom-4 right-4 z-10 glass-card p-4 min-w-[200px]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-2 w-2 rounded-full bg-rose animate-ping" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-rose">Live Alert Area</span>
                                        </div>
                                        <p className="text-xs font-medium text-foreground">Downtown Sector 4</p>
                                        <p className="text-[10px] text-muted-foreground">High predicted risk (78%) in 1.5h</p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Emergency Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Radio, label: t('emergencySOS'), color: "bg-rose", action: handleSOSClick },
                                { icon: PhoneCall, label: t('emergency'), color: "bg-primary", action: () => window.open('tel:911') },
                                { icon: Shield, label: t('reportIncident'), color: "bg-lavender", action: () => setActiveTab('report') },
                                { icon: Navigation, label: t('safeRoute'), color: "bg-emerald-600", action: () => setActiveTab('route') },
                            ].map((item, i) => (
                                <AnimatedSection key={item.label} delay={i * 0.1}>
                                    <button
                                        onClick={item.action}
                                        className="w-full group glass-card p-6 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <div className={`p-4 rounded-2xl ${item.color} text-white shadow-lg group-hover:shadow-xl transition-all`}>
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <span className="font-heading font-bold text-sm">{item.label}</span>
                                    </button>
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Analytics & Feed */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Safety Score Card */}
                        <AnimatedSection>
                            <div className={`glass-card-strong p-8 bg-gradient-to-br border-primary/20 transition-all duration-1000 ${safetyScore < 40 ? 'from-rose/10 to-transparent border-rose/30' : 'from-primary/10 to-transparent'}`}>
                                <h3 className="font-heading font-bold text-xl mb-1">Location Safety Score</h3>
                                <div className="text-[10px] text-muted-foreground mb-6 uppercase tracking-widest font-bold flex items-center gap-1.5 opacity-70">
                                    <MapPin className="h-3 w-3 text-primary" /> {locationName}
                                </div>
                                <div className="relative h-48 w-full flex items-center justify-center">
                                    <svg className="h-full w-full transform -rotate-90">
                                        <circle cx="50%" cy="50%" r="70" className="stroke-muted fill-none" strokeWidth="12" />
                                        <motion.circle
                                            initial={{ strokeDashoffset: 440 }}
                                            animate={{ strokeDashoffset: 440 - (440 * safetyScore / 100) }}
                                            cx="50%" cy="50%" r="70"
                                            className={`fill-none transition-all duration-1000 ${safetyScore > 70 ? 'stroke-emerald-500' : safetyScore > 40 ? 'stroke-gold' : 'stroke-rose'}`}
                                            strokeWidth="12"
                                            strokeDasharray="440"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold font-heading">{safetyScore}</span>
                                        <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${safetyScore < 40 ? 'text-rose animate-bounce' : 'text-emerald-600'}`}>{safetyLevel}</span>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between items-start text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1 shrink-0"><MapPin className="h-3 w-3" /> Area Status</span>
                                        <span className="font-bold text-right pl-4">{locationName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Proximity Alerts</span>
                                        <span className="font-bold">{nearbyIncidents.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Updated</span>
                                        <span className="font-bold text-emerald-600 text-[9px] uppercase">Real-Time</span>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Recent Incidents Feed */}
                        <AnimatedSection>
                            <div className="glass-card p-6 h-full flex flex-col max-h-[500px]">
                                <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-gold" />
                                    {t('yourAlertHistory')}
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                    {incidents.filter(i => i.user_id === profile?.id).length === 0 ? (
                                        <div className="text-center py-12 opacity-40">
                                            <p className="text-sm font-medium">No recent alerts found.</p>
                                        </div>
                                    ) : (
                                        incidents.filter(i => i.user_id === profile?.id).map((incident) => {
                                            const statuses = ['submitted', 'under review', 'verified', 'officer assigned', 'action taken', 'closed'];
                                            const currentIdx = statuses.indexOf(incident.status.toLowerCase());

                                            return (
                                                <motion.div
                                                    layout
                                                    key={incident.id}
                                                    className="group p-5 rounded-3xl bg-white/50 border border-white hover:bg-white hover:shadow-xl transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-xl uppercase ${incident.severity === 'critical' ? 'bg-rose text-white' :
                                                            incident.severity === 'high' ? 'bg-gold text-white' : 'bg-primary text-white'
                                                            }`}>
                                                            {incident.severity}
                                                        </span>
                                                        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-slate-100 px-2 py-1 rounded-lg">
                                                            ID: {incident.id.slice(0, 8)}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs font-bold text-foreground leading-relaxed mb-6">
                                                        {incident.description.split('.')[0]}...
                                                    </p>

                                                    {/* Status Tracker */}
                                                    <div className="space-y-4 mb-6">
                                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                            <span>Status Tracking</span>
                                                            <span className="text-primary">{incident.status.replace('_', ' ').toUpperCase()}</span>
                                                        </div>
                                                        <div className="flex gap-1.5 h-1.5">
                                                            {statuses.map((s, idx) => (
                                                                <div
                                                                    key={s}
                                                                    className={`flex-1 rounded-full transition-all duration-500 ${idx <= currentIdx ? 'bg-primary' : 'bg-slate-100'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground opacity-60">
                                                            <span>Submitted</span>
                                                            <span>Resolved</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                                                            View Logs
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Complaint Notifications Panel */}
                        <AnimatedSection delay={0.2}>
                            <ComplaintNotificationsPanel />
                        </AnimatedSection>
                    </div>
                </div>
            </div>

            {/* Global Overlay for SOS */}
            <AnimatePresence>
                {sosActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-rose/20 backdrop-blur-md flex items-center justify-center p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-md w-full glass-card-strong p-12 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-rose/5 animate-pulse" />
                            <div className="relative z-10">
                                <div className="h-24 w-24 rounded-full bg-rose mx-auto flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 rounded-full bg-rose animate-ping opacity-20" />
                                    <Radio className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="font-heading text-4xl font-bold text-rose mb-4">EMERGENCY SOS</h2>
                                <p className="text-muted-foreground mb-12 leading-relaxed">
                                    We are sharing your live GPS coordinates with the Command Center. Dispatched patrol in <span className="text-rose font-bold">{countdown}s</span>.
                                </p>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full rounded-2xl py-8 border-rose/30 text-rose hover:bg-rose/10 font-bold"
                                    onClick={cancelSOS}
                                >
                                    CANCEL ALERT
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
