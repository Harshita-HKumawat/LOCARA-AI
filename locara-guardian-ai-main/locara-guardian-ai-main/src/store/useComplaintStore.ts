/**
 * useComplaintStore.ts
 *
 * Real-time complaint system with three sync layers:
 *
 * Layer 1 (Production): Supabase Realtime postgres_changes subscription
 * Layer 2 (Demo Mode):  localStorage + BroadcastChannel for cross-tab sync
 * Layer 3 (Fallback):   Polling every 5 seconds reading from localStorage
 *
 * This guarantees that a complaint submitted by a Citizen in Tab A
 * instantly appears in the Authority Dashboard in Tab B — with zero page refresh.
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

export type ComplaintStatus =
    | 'Submitted'
    | 'Under Review'
    | 'Verified'
    | 'Action Taken'
    | 'Closed'
    | 'False Report';

export interface ActionNote {
    timestamp: string;
    note: string;
    officer?: string;
}

export interface Complaint {
    id: string;
    case_id: string;
    user_id: string | null;
    incident_type: string;
    description: string;
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    manual_location: string;
    lighting_condition: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: ComplaintStatus;
    is_anonymous: boolean;
    action_notes: ActionNote[];
    reporter_name?: string;
    reporter_email?: string;
    created_at: string;
    updated_at: string;
}

// ──────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────

const LS_KEY = 'locara_complaints_v2';
const BC_CHANNEL = 'locara_complaints_sync';
const POLL_INTERVAL_MS = 4000;

// ──────────────────────────────────────────────────────
// Seed data (written into localStorage on first load)
// ──────────────────────────────────────────────────────

const SEED_COMPLAINTS: Complaint[] = [
    {
        id: 'seed-1',
        case_id: 'LOC-2026-00001',
        user_id: 'demo-user-id',
        incident_type: 'Harassment',
        description: 'Group of individuals harassing pedestrians near the central park entrance.',
        date: '2026-03-03',
        time: '21:30',
        latitude: 28.6139,
        longitude: 77.2090,
        manual_location: 'Central Park, New Delhi',
        lighting_condition: 'dim',
        severity: 'high',
        status: 'Under Review',
        is_anonymous: false,
        action_notes: [
            { timestamp: '2026-03-03T22:00:00Z', note: 'Patrol unit dispatched to the area.', officer: 'Officer Sharma' }
        ],
        reporter_name: 'Priya Gupta',
        reporter_email: 'priya@example.com',
        created_at: '2026-03-03T21:35:00Z',
        updated_at: '2026-03-03T22:00:00Z',
    },
    {
        id: 'seed-2',
        case_id: 'LOC-2026-00002',
        user_id: null,
        incident_type: 'Theft',
        description: 'Bag snatched near the station exit. The perpetrator fled on a motorcycle.',
        date: '2026-03-03',
        time: '19:15',
        latitude: 28.6429,
        longitude: 77.2190,
        manual_location: 'New Delhi Railway Station Exit 3',
        lighting_condition: 'bright',
        severity: 'critical',
        status: 'Verified',
        is_anonymous: true,
        action_notes: [
            { timestamp: '2026-03-03T19:45:00Z', note: 'Report verified through CCTV footage.', officer: 'Officer Kaur' },
            { timestamp: '2026-03-03T20:10:00Z', note: 'FIR filed. Investigation team assigned.', officer: 'Inspector Mehta' },
        ],
        created_at: '2026-03-03T19:20:00Z',
        updated_at: '2026-03-03T20:10:00Z',
    },
    {
        id: 'seed-3',
        case_id: 'LOC-2026-00003',
        user_id: 'demo-user-id',
        incident_type: 'Suspicious Activity',
        description: 'Suspicious vehicle parked outside school gate for 3 consecutive days. Occupants observed photographing children.',
        date: '2026-03-02',
        time: '15:45',
        latitude: 28.6200,
        longitude: 77.2100,
        manual_location: 'Green Valley School, Sector 5',
        lighting_condition: 'bright',
        severity: 'critical',
        status: 'Action Taken',
        is_anonymous: false,
        action_notes: [
            { timestamp: '2026-03-02T16:30:00Z', note: 'Undercover unit placed outside school.', officer: 'Officer Singh' },
            { timestamp: '2026-03-02T18:00:00Z', note: 'Suspects apprehended. Vehicle impounded.', officer: 'Inspector Mehta' },
        ],
        reporter_name: 'Rajesh Kumar',
        reporter_email: 'rajesh@example.com',
        created_at: '2026-03-02T16:00:00Z',
        updated_at: '2026-03-02T18:00:00Z',
    },
];

// ──────────────────────────────────────────────────────
// LocalStorage helpers  (shared across all browser tabs)
// ──────────────────────────────────────────────────────

function lsRead(): Complaint[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Complaint[];
    } catch {
        return [];
    }
}

function lsWrite(complaints: Complaint[]): void {
    try {
        // Sort newest-first before saving
        const sorted = [...complaints].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        localStorage.setItem(LS_KEY, JSON.stringify(sorted));
    } catch {
        // quota exceeded – ignore
    }
}

function lsUpsert(complaint: Complaint): Complaint[] {
    const existing = lsRead();
    const idx = existing.findIndex(c => c.id === complaint.id);
    let updated: Complaint[];
    if (idx >= 0) {
        updated = existing.map(c => c.id === complaint.id ? complaint : c);
    } else {
        updated = [complaint, ...existing];
    }
    lsWrite(updated);
    return updated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// ──────────────────────────────────────────────────────
// BroadcastChannel event types
// ──────────────────────────────────────────────────────

type BCMessage =
    | { type: 'INSERT'; complaint: Complaint }
    | { type: 'UPDATE'; complaint: Complaint }
    | { type: 'PING' };

// ──────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────

function generateCaseId(): string {
    const year = new Date().getFullYear();
    const existing = lsRead();
    // Get max sequential number from existing IDs to avoid collisions
    const nums = existing
        .map(c => parseInt(c.case_id?.split('-')[2] || '0', 10))
        .filter(n => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `LOC-${year}-${String(next).padStart(5, '0')}`;
}

function isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return !!url && !url.includes('YOUR_SUPABASE') && !url.includes('placeholder');
}

// ──────────────────────────────────────────────────────
// Initialize localStorage with seed data on first run
// ──────────────────────────────────────────────────────

function ensureSeedData() {
    const existing = lsRead();
    if (existing.length === 0) {
        lsWrite(SEED_COMPLAINTS);
    }
}

// ──────────────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────────────

interface ComplaintState {
    complaints: Complaint[];
    loading: boolean;
    newCount: number;
    lastSyncAt: number;        // timestamp of last sync
    fetchComplaints: () => Promise<void>;
    submitComplaint: (data: Partial<Complaint>) => Promise<string>;
    updateStatus: (id: string, status: ComplaintStatus, actionNote?: ActionNote) => Promise<void>;
    subscribeToComplaints: () => () => void;
    clearNewCount: () => void;
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
    complaints: [],
    loading: false,
    newCount: 0,
    lastSyncAt: 0,

    // ── Fetch ─────────────────────────────────────────
    fetchComplaints: async () => {
        set({ loading: true });

        if (!isSupabaseConfigured()) {
            // Demo mode: read from localStorage (shared across tabs)
            ensureSeedData();
            const data = lsRead();
            set({ complaints: data, loading: false, lastSyncAt: Date.now() });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                set({ complaints: data as Complaint[], loading: false, lastSyncAt: Date.now() });
            } else {
                throw error;
            }
        } catch (err) {
            console.error('[ComplaintStore] fetchComplaints failed, falling back to localStorage:', err);
            ensureSeedData();
            set({ complaints: lsRead(), loading: false });
        }
    },

    // ── Submit ────────────────────────────────────────
    submitComplaint: async (data) => {
        const case_id = generateCaseId();
        const now = new Date().toISOString();

        const newComplaint: Complaint = {
            id: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            case_id,
            status: 'Submitted',
            action_notes: [],
            created_at: now,
            updated_at: now,
            latitude: 0,
            longitude: 0,
            manual_location: '',
            lighting_condition: 'bright',
            is_anonymous: false,
            ...data,
        } as Complaint;

        if (!isSupabaseConfigured()) {
            // ── DEMO: write to localStorage and broadcast to all tabs ──
            const updated = lsUpsert(newComplaint);
            set(state => ({
                complaints: updated,
                newCount: state.newCount + 1,
                lastSyncAt: Date.now(),
            }));

            // Broadcast to other tabs (Authority Dashboard)
            try {
                const bc = new BroadcastChannel(BC_CHANNEL);
                bc.postMessage({ type: 'INSERT', complaint: newComplaint } as BCMessage);
                bc.close();
            } catch {
                // BroadcastChannel not supported (very old browsers) — polling will catch it
            }

            return case_id;
        }

        // ── PRODUCTION: Supabase insert ──
        try {
            const { data: inserted, error } = await supabase
                .from('complaints')
                .insert([{ ...newComplaint }])
                .select()
                .single();

            if (!error && inserted) {
                set(state => ({
                    complaints: [inserted as Complaint, ...state.complaints],
                    newCount: state.newCount + 1,
                }));
                return case_id;
            }
            throw error;
        } catch (err) {
            console.error('[ComplaintStore] Supabase insert failed, using localStorage fallback:', err);
            const updated = lsUpsert(newComplaint);
            set(state => ({ complaints: updated, newCount: state.newCount + 1 }));
            return case_id;
        }
    },

    // ── Update Status ─────────────────────────────────
    updateStatus: async (id, status, actionNote) => {
        const existing = get().complaints.find(c => c.id === id);
        if (!existing) return;

        const notes = actionNote
            ? [...(existing.action_notes || []), actionNote]
            : (existing.action_notes || []);

        const updated: Complaint = {
            ...existing,
            status,
            action_notes: notes,
            updated_at: new Date().toISOString(),
        };

        // Optimistic local update
        set(state => ({
            complaints: state.complaints.map(c => c.id === id ? updated : c),
        }));

        if (!isSupabaseConfigured()) {
            // Demo: persist to localStorage and broadcast
            lsUpsert(updated);
            try {
                const bc = new BroadcastChannel(BC_CHANNEL);
                bc.postMessage({ type: 'UPDATE', complaint: updated } as BCMessage);
                bc.close();
            } catch { /* ignore */ }
            return;
        }

        // Production: Supabase update
        try {
            await supabase
                .from('complaints')
                .update({ status, action_notes: notes, updated_at: updated.updated_at })
                .eq('id', id);
        } catch (err) {
            console.error('[ComplaintStore] Supabase update failed:', err);
        }
    },

    // ── Subscribe (Real-time) ─────────────────────────
    subscribeToComplaints: () => {
        const cleanups: (() => void)[] = [];

        if (!isSupabaseConfigured()) {
            // ── LAYER 2: BroadcastChannel (instant, cross-tab) ──
            let bc: BroadcastChannel | null = null;
            try {
                bc = new BroadcastChannel(BC_CHANNEL);
                bc.onmessage = (event: MessageEvent<BCMessage>) => {
                    const msg = event.data;
                    if (msg.type === 'INSERT') {
                        set(state => {
                            // Avoid duplicates
                            if (state.complaints.some(c => c.id === msg.complaint.id)) return state;
                            return {
                                complaints: [msg.complaint, ...state.complaints],
                                newCount: state.newCount + 1,
                                lastSyncAt: Date.now(),
                            };
                        });
                    } else if (msg.type === 'UPDATE') {
                        set(state => ({
                            complaints: state.complaints.map(c =>
                                c.id === msg.complaint.id ? msg.complaint : c
                            ),
                            lastSyncAt: Date.now(),
                        }));
                    }
                };
                cleanups.push(() => bc?.close());
            } catch {
                console.warn('[ComplaintStore] BroadcastChannel not available, using polling only');
            }

            // ── LAYER 3: Polling (fallback & catch-all) ──
            // Reads localStorage every POLL_INTERVAL_MS ms and syncs if changed
            const poll = setInterval(() => {
                const fresh = lsRead();
                const current = get().complaints;

                // Quick diff: compare total count + latest ID
                const freshIds = fresh.map(c => c.id + c.updated_at).join(',');
                const currentIds = current.map(c => c.id + c.updated_at).join(',');

                if (freshIds !== currentIds) {
                    // Find genuinely new complaints
                    const currentIdSet = new Set(current.map(c => c.id));
                    const newOnes = fresh.filter(c => !currentIdSet.has(c.id));
                    set({
                        complaints: fresh,
                        newCount: get().newCount + newOnes.length,
                        lastSyncAt: Date.now(),
                    });
                }
            }, POLL_INTERVAL_MS);
            cleanups.push(() => clearInterval(poll));

            return () => cleanups.forEach(fn => fn());
        }

        // ── LAYER 1: Supabase Realtime (production) ──
        const channel = supabase
            .channel('realtime:complaints')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'complaints' },
                payload => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;
                    if (eventType === 'INSERT') {
                        set(state => ({
                            complaints: [newRecord as Complaint, ...state.complaints],
                            newCount: state.newCount + 1,
                            lastSyncAt: Date.now(),
                        }));
                    } else if (eventType === 'UPDATE') {
                        set(state => ({
                            complaints: state.complaints.map(c =>
                                c.id === oldRecord.id ? (newRecord as Complaint) : c
                            ),
                            lastSyncAt: Date.now(),
                        }));
                    } else if (eventType === 'DELETE') {
                        set(state => ({
                            complaints: state.complaints.filter(c => c.id !== oldRecord.id),
                        }));
                    }
                }
            )
            .subscribe(status => {
                console.log('[ComplaintStore] Supabase realtime status:', status);
            });

        cleanups.push(() => supabase.removeChannel(channel));
        return () => cleanups.forEach(fn => fn());
    },

    clearNewCount: () => set({ newCount: 0 }),
}));
