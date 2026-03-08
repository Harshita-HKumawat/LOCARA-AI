import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface AreaFeedback {
    id: string; // feedback_id
    complaint_id: string;
    area_lat: number;
    area_lng: number;
    user_id: string | null;
    rating: number; // 1-5
    sentiment: 'positive' | 'negative';
    review_text?: string;
    category?: 'Better lighting' | 'Increased patrol' | 'Cleaner environment' | 'Still risky' | 'Suspicious activity continues';
    created_at: string;
}

const LS_KEY = 'locara_area_feedback_v1';

function lsRead(): AreaFeedback[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function lsWrite(feedback: AreaFeedback[]) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(feedback));
    } catch {
        // ignore
    }
}

function lsUpsert(feedback: AreaFeedback) {
    const existing = lsRead();
    const updated = [feedback, ...existing];
    lsWrite(updated);
    return updated;
}

interface AreaFeedbackState {
    feedbacks: AreaFeedback[];
    loading: boolean;
    fetchFeedbacks: () => Promise<void>;
    submitFeedback: (feedback: Omit<AreaFeedback, 'id' | 'created_at'>) => Promise<void>;
}

function isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return !!url && !url.includes('YOUR_SUPABASE') && !url.includes('placeholder');
}

export const useAreaFeedbackStore = create<AreaFeedbackState>((set, get) => ({
    feedbacks: [],
    loading: false,

    fetchFeedbacks: async () => {
        set({ loading: true });

        if (!isSupabaseConfigured()) {
            set({ feedbacks: lsRead(), loading: false });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('area_feedback')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                set({ feedbacks: data as AreaFeedback[], loading: false });
            } else {
                throw error;
            }
        } catch (err) {
            console.error('[AreaFeedbackStore] Fetch failed, falling back to localStorage', err);
            set({ feedbacks: lsRead(), loading: false });
        }
    },

    submitFeedback: async (feedback) => {
        const newFeedback: AreaFeedback = {
            id: `fdbk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            created_at: new Date().toISOString(),
            ...feedback,
        };

        if (!isSupabaseConfigured()) {
            const updated = lsUpsert(newFeedback);
            set({ feedbacks: updated });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('area_feedback')
                .insert([{ ...newFeedback }])
                .select()
                .single();

            if (!error && data) {
                set(state => ({ feedbacks: [data as AreaFeedback, ...state.feedbacks] }));
            } else {
                throw error;
            }
        } catch (err) {
            console.error('[AreaFeedbackStore] Insert failed, falling back to localStorage', err);
            const updated = lsUpsert(newFeedback);
            set({ feedbacks: updated });
        }
    }
}));
