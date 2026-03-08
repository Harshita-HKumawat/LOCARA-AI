
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore, Role } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Lock, Mail, Smartphone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchProfile, loginAsDemo } = useAuthStore();
    const { t } = useTranslation();

    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes("YOUR_SUPABASE");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!isSupabaseConfigured) {
                console.warn("Supabase not configured, using Demo mode fallback.");
                loginAsDemo('citizen');
                toast.success('Login successful (Demo Mode)');
                navigate('/dashboard');
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                const profile = await fetchProfile(data.user.id);
                toast.success('Login successful');

                // Redirect based on role
                const userRole = profile?.role || 'citizen';
                if (userRole === 'police') navigate('/police-dashboard');
                else if (userRole === 'city_authority') navigate('/authority-dashboard');
                else if (userRole === 'admin') navigate('/admin-dashboard');
                else navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const msg = error.message === "Failed to fetch"
                ? "Unable to reach database. This usually means the project keys are invalid or not configured."
                : error.message || 'Error signing in';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (role: Role) => {
        loginAsDemo(role);
        toast.info(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
        if (role === 'police') navigate('/police-dashboard');
        else if (role === 'city_authority') navigate('/authority-dashboard');
        else if (role === 'admin') navigate('/admin-dashboard');
        else navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 section-padding">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 glass-card p-8 relative overflow-hidden"
            >
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="relative z-10">
                    <div className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-primary" />
                        <h2 className="mt-6 text-3xl font-extrabold text-foreground font-heading">
                            {t('signInToLocara')}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('secureAccess')}
                        </p>
                    </div>

                    {!isSupabaseConfigured && (
                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-500/90 italic">
                                Backend connection not configured. Use Demo Access below to explore the platform without a database.
                            </div>
                        </div>
                    )}

                    <form className="mt-6 space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4 rounded-md shadow-sm">
                            <div className="relative">
                                <Mail className="absolute text-muted-foreground left-3 top-3 h-5 w-5" />
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 relative block w-full rounded-xl border border-border bg-background/50 px-3 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                    placeholder={t('emailAddress')}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute text-muted-foreground left-3 top-3 h-5 w-5" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 relative block w-full rounded-xl border border-border bg-background/50 px-3 py-3 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                    placeholder={t('password')}
                                />
                            </div>
                        </div>

                        <div>
                            <Button type="submit" disabled={loading} className="w-full rounded-xl bg-primary hover:bg-primary/90">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('login')}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 space-y-4">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border"></span>
                            </div>
                            <span className="relative bg-background px-4 text-xs font-medium text-muted-foreground uppercase">
                                {t('demoAccess')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-primary/20 hover:bg-primary/5 h-10"
                                onClick={() => handleDemoLogin('citizen')}
                            >
                                <Smartphone className="h-4 w-4 mr-2 text-rose" /> {t('citizen')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-primary/20 hover:bg-primary/5 h-10"
                                onClick={() => handleDemoLogin('police')}
                            >
                                <Shield className="h-4 w-4 mr-2 text-primary" /> {t('police')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-primary/20 hover:bg-primary/5 h-10 col-span-2"
                                onClick={() => handleDemoLogin('city_authority')}
                            >
                                <Shield className="h-4 w-4 mr-2 text-gold" /> {t('authority')} Center
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-muted-foreground">{t('dontHaveAccount')} </span>
                        <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                            {t('signUp')}
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
