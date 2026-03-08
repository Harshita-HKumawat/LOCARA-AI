import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Incident {
    id: string;
    user_id: string;
    latitude: number;
    longitude: number;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'verified' | 'resolved';
    risk_score: number;
    created_at: string;
}

interface IncidentState {
    incidents: Incident[];
    loading: boolean;
    fetchIncidents: () => Promise<void>;
    reportIncident: (incident: Partial<Incident>) => Promise<void>;
    triggerSOS: (lat: number, lng: number, userId: string) => Promise<void>;
    updateIncidentStatus: (id: string, status: Incident['status']) => Promise<void>;
    subscribeToIncidents: () => () => void;
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
    incidents: [],
    loading: false,

    fetchIncidents: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            set({ incidents: data as Incident[], loading: false });
        } else {
            set({ loading: false });
        }
    },

    reportIncident: async (incident) => {
        const { data, error } = await supabase
            .from('incidents')
            .insert([{
                ...incident,
                status: 'pending',
                risk_score: incident.severity === 'critical' ? 90 :
                    incident.severity === 'high' ? 70 :
                        incident.severity === 'medium' ? 40 : 10
            }])
            .select()
            .single();

        if (!error && data) {
            set((state) => ({ incidents: [data as Incident, ...state.incidents] }));
        }
    },

    triggerSOS: async (lat, lng, userId) => {
        await get().reportIncident({
            user_id: userId,
            latitude: lat,
            longitude: lng,
            description: 'EMERGENCY SOS TRIGGERED',
            severity: 'critical'
        });
    },

    updateIncidentStatus: async (id, status) => {
        const { error } = await supabase
            .from('incidents')
            .update({ status })
            .eq('id', id);

        if (!error) {
            set((state) => ({
                incidents: state.incidents.map(inc => inc.id === id ? { ...inc, status } : inc)
            }));
        }
    },

    subscribeToIncidents: () => {
        const channel = supabase.channel('public:incidents')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, payload => {
                const { eventType, new: newRecord, old: oldRecord } = payload;

                if (eventType === 'INSERT') {
                    set((state) => ({ incidents: [newRecord as Incident, ...state.incidents] }));
                } else if (eventType === 'UPDATE') {
                    set((state) => ({
                        incidents: state.incidents.map(inc => inc.id === oldRecord.id ? (newRecord as Incident) : inc)
                    }));
                } else if (eventType === 'DELETE') {
                    set((state) => ({
                        incidents: state.incidents.filter(inc => inc.id !== oldRecord.id)
                    }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
}));
