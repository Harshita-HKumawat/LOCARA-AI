import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type Role = 'citizen' | 'police' | 'city_authority' | 'admin';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: Role;
    is_verified: boolean;
    created_at: string;
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setProfile: (profile: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    signOut: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<UserProfile | null>;
    loginAsDemo: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    profile: null,
    loading: true,
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
    },
    fetchProfile: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            const profile = data as UserProfile;
            set({ profile });
            return profile;
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback for demo if no DB yet
            if (import.meta.env.DEV) {
                const demoProfile: UserProfile = { id: userId, name: 'Demo User', email: 'demo@example.com', role: 'citizen', is_verified: true, created_at: new Date().toISOString() };
                set({ profile: demoProfile });
                return demoProfile;
            }
            return null;
        }
    },
    loginAsDemo: (role) => {
        const id = 'demo-user-id';
        const demoUser = {
            id,
            email: 'demo@locara.ai',
            role: 'authenticated',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
        } as any;

        const demoProfile: UserProfile = {
            id,
            name: 'Demo ' + role.charAt(0).toUpperCase() + role.slice(1),
            email: 'demo@locara.ai',
            role,
            is_verified: true,
            created_at: new Date().toISOString(),
        };

        set({ user: demoUser, profile: demoProfile, loading: false });
    },
}));
