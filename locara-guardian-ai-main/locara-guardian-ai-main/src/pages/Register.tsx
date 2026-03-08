
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Lock, Mail, User, ShieldCheck, Building2, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'citizen' | 'police' | 'city_authority'>('citizen');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { loginAsDemo } = useAuthStore();

    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes("YOUR_SUPABASE");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!isSupabaseConfigured) {
                // FALLBACK: If user hasn't set up Supabase yet, let them in anyway as a Demo
                console.warn("Supabase not configured, using Demo mode fallback for Registration.");
                loginAsDemo(role);
                toast.success('Registration successful (Demo Mode)');
                if (role === 'police') navigate('/police-dashboard');
                else if (role === 'city_authority') navigate('/authority-dashboard');
                else navigate('/dashboard');
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name, role }
                }
            });

            if (error) throw error;

            if (data.user) {
                const { error: dbError } = await supabase.from('users').insert([{
                    id: data.user.id,
                    name,
                    email,
                    role,
                    is_verified: role === 'citizen' ? true : false,
                }]);
                if (dbError) throw dbError;

                toast.success('Registration successful. Please log in.');
                navigate('/login');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Error registering');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl glass-card-strong p-10 relative overflow-hidden bg-white/40 border-white/60 shadow-2xl"
            >
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-rose/10 blur-3xl animate-pulse" />

                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg mb-6 text-primary scale-110">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h2 className="text-4xl font-bold text-foreground font-heading tracking-tight">
                            {t('register')} <span className="gradient-text">LOCARA-AI</span>
                        </h2>
                        <p className="text-sm text-muted-foreground mt-3 font-medium">{t('secureAccess')}</p>
                    </div>

                    {!isSupabaseConfigured && (
                        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-500/90 italic">
                                Backend connection not configured. You can still register with any credentials to enter Demo Mode.
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { id: 'citizen', label: t('citizen'), icon: Users },
                                { id: 'police', label: t('police'), icon: ShieldCheck },
                                { id: 'city_authority', label: t('authority'), icon: Building2 },
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id as any)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${role === r.id
                                        ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                        : 'bg-white/50 border-white hover:bg-white hover:border-primary/20 text-muted-foreground'
                                        }`}
                                >
                                    <r.icon className={`h-5 w-5 ${role === r.id ? 'text-white' : 'text-primary'}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{r.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('guardian')} Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 h-14 rounded-2xl border border-white bg-white/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm font-medium"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('emailAddress')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 h-14 rounded-2xl border border-white bg-white/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm font-medium"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('password')}</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 h-14 rounded-2xl border border-white bg-white/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl h-16 bg-midnight text-white hover:bg-black font-bold uppercase tracking-[0.2em] text-xs shadow-xl transition-all hover:scale-[1.01] active:scale-95"
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('register')}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <div className="text-xs text-muted-foreground font-medium">
                            Already part of the network? <Link to="/login" className="text-primary font-bold hover:underline">{t('login')}</Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
