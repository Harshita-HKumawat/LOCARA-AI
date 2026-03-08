import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/store/useAuthStore";
import { useLanguageStore, Language } from "@/store/useLanguageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { LogOut, User as UserIcon } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t } = useTranslation();
  const { language: currentLang, setLanguage } = useLanguageStore();
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();

  const getNavItems = (role?: string) => {
    const base = [
      { label: t('home'), path: "/" },
      { label: t('safeRoute'), path: "/navigate" },
      { label: t('howItWorks'), path: "/how-it-works" },
      { label: t('heatmap'), path: "/heatmap" },
    ];

    if (!role) return [
      ...base,
      { label: t('transparency'), path: "/impact" },
      { label: t('awareness'), path: "/awareness" }
    ];

    if (role === 'citizen') return [
      ...base,
      { label: t('trustedContacts'), path: "/trusted-contacts" },
      { label: "My Complaints", path: "/my-complaints" },
      { label: t('dashboard'), path: "/dashboard" },
    ];

    if (role === 'police') return [...base, { label: "Command Center", path: "/police-dashboard" }];
    if (role === 'city_authority') return [...base, { label: "Authority Center", path: "/authority-dashboard" }];
    if (role === 'admin') return [...base, { label: "Admin Panel", path: "/admin-dashboard" }];

    return base;
  };

  const navItems = getNavItems(profile?.role);

  const languages = [
    { code: "EN", label: "English" },
    { code: "HI", label: "हिन्दी" },
    { code: "BN", label: "বাংলা" },
    { code: "MR", label: "मराठी" },
    { code: "TE", label: "తెలుగు" },
    { code: "TA", label: "தமிழ்" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100]">
      <div className="glass-card-strong mx-4 mt-4 rounded-2xl border-white/60 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold gradient-text">LOCARA-AI</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex ml-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${location.pathname === item.path
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              {profile?.role === 'citizen' && <NotificationBell />}

              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/40 border border-white text-[10px] font-bold text-muted-foreground hover:bg-white transition-all shadow-sm"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {currentLang}
                  <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-32 glass-card p-2 shadow-2xl border-white"
                    >
                      {languages.map(l => (
                        <button
                          key={l.code}
                          onClick={() => { setLanguage(l.code as Language); setLangOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest transition-colors ${currentLang === l.code ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-50'}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-midnight text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 shadow-xl">
                  <UserIcon className="h-3.5 w-3.5" />
                  {profile?.name || 'Authorized'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="rounded-xl text-rose hover:bg-rose/10 hover:text-rose font-bold text-xs"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('exit')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-xl bg-primary text-white hover:bg-black transition-all px-8 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button className="lg:hidden text-foreground p-2 rounded-xl hover:bg-white/50 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>


        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <nav className="flex flex-col gap-1 px-6 pb-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                  {languages.slice(0, 2).map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code as Language); setMobileOpen(false); }}
                      className="p-3 rounded-xl bg-slate-50 text-[10px] font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="mt-4 w-full rounded-xl text-rose border-rose/20 hover:bg-rose/10 font-bold h-12"
                  >
                    {t('exit')}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        {t('login')}
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="w-full h-12 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                        {t('register')}
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
