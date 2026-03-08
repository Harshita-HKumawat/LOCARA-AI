import { create } from 'zustand';
import { useIncidentStore, Incident } from './useIncidentStore';
import { useComplaintStore, Complaint } from './useComplaintStore';
import { useAreaFeedbackStore, AreaFeedback } from './useAreaFeedbackStore';

export type SafetyLevel = 'Very Safe' | 'Moderately Safe' | 'Caution Area' | 'Unsafe' | 'High Risk';

interface SafetyState {
    userLocation: { lat: number; lng: number } | null;
    searchedLocation: { lat: number; lng: number } | null;
    locationName: string;
    safetyScore: number;
    safetyLevel: SafetyLevel;
    safetyColor: string;
    nearbyIncidents: (Incident | Complaint)[];
    nearbyFeedback: AreaFeedback[];
    isTracking: boolean;
    mode: 'live' | 'search';
    setUserLocation: (lat: number, lng: number) => void;
    setSearchedLocation: (lat: number, lng: number, name?: string) => void;
    setMode: (mode: 'live' | 'search') => void;
    calculateSafetyScore: () => void;
    fetchLocationName: (lat: number, lng: number) => Promise<void>;
    searchLocation: (query: string) => Promise<{ lat: number, lng: number, name: string } | null>;
    startTracking: () => void;
    stopTracking: () => void;
}

const getSafetyLevel = (score: number): { level: SafetyLevel; color: string } => {
    if (score >= 80) return { level: 'Very Safe', color: 'text-emerald-500 bg-emerald-500/10' };
    if (score >= 60) return { level: 'Moderately Safe', color: 'text-emerald-400 bg-emerald-400/10' };
    if (score >= 40) return { level: 'Caution Area', color: 'text-gold bg-gold/10' };
    if (score >= 20) return { level: 'Unsafe', color: 'text-orange-500 bg-orange-500/10' };
    return { level: 'High Risk', color: 'text-rose bg-rose/10' };
};

// Haversine distance helper
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

let lastFetchTime = 0;
const FETCH_THROTTLE = 15000; // 15 seconds

export const useSafetyStore = create<SafetyState>((set, get) => ({
    userLocation: null,
    searchedLocation: null,
    locationName: "Detecting location...",
    safetyScore: 100,
    safetyLevel: 'Very Safe',
    safetyColor: 'text-emerald-500 bg-emerald-500/10',
    nearbyIncidents: [],
    nearbyFeedback: [],
    isTracking: false,
    mode: 'live',

    setUserLocation: (lat, lng) => {
        const prevLocation = get().userLocation;
        set({ userLocation: { lat, lng } });

        // If in live mode, calculate for live location
        if (get().mode === 'live') {
            get().calculateSafetyScore();
            // Only fetch name if moved significantly (> 50m) or if first time
            if (!prevLocation || getDistance(lat, lng, prevLocation.lat, prevLocation.lng) > 0.05) {
                get().fetchLocationName(lat, lng);
            }
        }
    },

    setSearchedLocation: (lat, lng, name) => {
        set({
            searchedLocation: { lat, lng },
            mode: 'search'
        });

        if (name) {
            set({ locationName: name });
        } else {
            get().fetchLocationName(lat, lng);
        }

        get().calculateSafetyScore();
    },

    setMode: (mode) => {
        set({ mode });
        get().calculateSafetyScore();
        const activeLoc = mode === 'live' ? get().userLocation : get().searchedLocation;
        if (activeLoc) {
            get().fetchLocationName(activeLoc.lat, activeLoc.lng);
        }
    },

    fetchLocationName: async (lat, lng) => {
        const now = Date.now();
        if (now - lastFetchTime < FETCH_THROTTLE) return;
        lastFetchTime = now;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();

            const address = data.address;
            const road = address.road || address.pedestrian || address.suburb || "Unnamed Area";
            const neighborhood = address.neighbourhood || address.suburb || "";
            const city = address.city || address.town || address.village || "";

            let name = road;
            if (neighborhood && neighborhood !== road) name = `${road}, ${neighborhood}`;
            if (city) name = `${name}, ${city}`;

            set({ locationName: name });
        } catch (error) {
            console.error("Reverse Geocode Error:", error);
            set({ locationName: `Area near ${lat.toFixed(3)}, ${lng.toFixed(3)}` });
        }
    },

    searchLocation: async (query) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                return {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    name: result.display_name
                };
            }
            return null;
        } catch (error) {
            console.error("Search API Error:", error);
            return null;
        }
    },

    calculateSafetyScore: () => {
        const { mode, userLocation, searchedLocation } = get();
        const activeLoc = mode === 'live' ? userLocation : searchedLocation;

        if (!activeLoc) return;

        const incidents = useIncidentStore.getState().incidents;
        const complaints = useComplaintStore.getState().complaints;
        const feedbacks = useAreaFeedbackStore.getState().feedbacks;

        const radius = 1.0;
        const nearbyInc = incidents.filter(i => getDistance(activeLoc.lat, activeLoc.lng, i.latitude, i.longitude) <= radius);
        const nearbyCmp = complaints.filter(c => getDistance(activeLoc.lat, activeLoc.lng, c.latitude, c.longitude) <= radius);
        const nearbyFdbbk = feedbacks.filter(f => getDistance(activeLoc.lat, activeLoc.lng, f.area_lat, f.area_lng) <= radius);

        const hour = new Date().getHours();
        let baseScore = 100;
        if (hour >= 22 || hour <= 4) baseScore -= 15;
        else if (hour >= 18 || hour <= 6) baseScore -= 5;

        let penalty = 0;
        nearbyInc.forEach(i => {
            const severityWeight = i.severity === 'critical' ? 30 : i.severity === 'high' ? 20 : i.severity === 'medium' ? 10 : 5;
            penalty += severityWeight;
        });

        nearbyCmp.forEach(c => {
            const isResolved = c.status === 'Closed' || c.status === 'Action Taken';
            const statusWeight = isResolved ? 0.3 : 1.0;
            const severityWeight = c.severity === 'critical' ? 25 : c.severity === 'high' ? 15 : c.severity === 'medium' ? 8 : 4;
            penalty += severityWeight * statusWeight;
        });

        let feedbackBonus = 0;
        nearbyFdbbk.forEach(f => {
            if (f.sentiment === 'positive') feedbackBonus += 5;
            else feedbackBonus -= 10;
        });

        const finalScore = Math.max(0, Math.min(100, baseScore - penalty + feedbackBonus));
        const { level, color } = getSafetyLevel(finalScore);

        set({
            safetyScore: Math.round(finalScore),
            safetyLevel: level,
            safetyColor: color,
            nearbyIncidents: [...nearbyInc, ...nearbyCmp],
            nearbyFeedback: nearbyFdbbk
        });
    },

    startTracking: () => {
        if (get().isTracking) return;
        set({ isTracking: true });

        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    get().setUserLocation(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    console.error("Tracking error:", err);
                    if (!get().userLocation) {
                        get().setUserLocation(28.6139, 77.2090);
                    }
                },
                { enableHighAccuracy: true }
            );

            const intervalId = setInterval(() => {
                get().calculateSafetyScore();
            }, 30000);

            (window as any)._safetyWatchId = watchId;
            (window as any)._safetyIntervalId = intervalId;
        }
    },

    stopTracking: () => {
        set({ isTracking: false });
        if ((window as any)._safetyWatchId) navigator.geolocation.clearWatch((window as any)._safetyWatchId);
        if ((window as any)._safetyIntervalId) clearInterval((window as any)._safetyIntervalId);
    }
}));
