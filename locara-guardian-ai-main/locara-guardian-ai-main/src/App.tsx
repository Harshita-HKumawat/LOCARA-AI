import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import PoliceDashboard from "./pages/PoliceDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Impact from "./pages/Impact";
import Contact from "./pages/Contact";
import TrustedContacts from "./pages/TrustedContacts";
import ComplaintTracker from "./pages/ComplaintTracker";
import SafetyAwareness from "./pages/SafetyAwareness";
import SafetyHeatmap from "./pages/SafetyHeatmap";
import SafeNavigation from "./pages/SafeNavigation";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import GlobalSOS from "./components/GlobalSOS";
import SafetyChatbot from "./components/SafetyChatbot";
import NotificationListener from "./components/NotificationListener";

const queryClient = new QueryClient();

const App = () => {
  const { setUser, fetchProfile, setLoading } = useAuthStore();

  useEffect(() => {
    console.log("App: Initializing auth state...");

    // Check active session safely
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("App: Session check complete", session ? "User found" : "No session");
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => {
            console.log("App: Profile fetch complete");
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }).catch(err => {
        console.error("App: Auth session error", err);
        setLoading(false);
      });

      // Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      });

      return () => {
        if (data?.subscription) data.subscription.unsubscribe();
      };
    } catch (e) {
      console.error("App: Auth initialization crashed", e);
      setLoading(false);
    }
  }, [setUser, fetchProfile, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NotificationListener />
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/awareness" element={<SafetyAwareness />} />
            <Route path="/heatmap" element={<SafetyHeatmap />} />
            <Route path="/navigate" element={<SafeNavigation />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } />

            <Route path="/trusted-contacts" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <TrustedContacts />
              </ProtectedRoute>
            } />

            <Route path="/my-complaints" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ComplaintTracker />
              </ProtectedRoute>
            } />

            <Route path="/police-dashboard" element={
              <ProtectedRoute allowedRoles={['police', 'admin']}>
                <PoliceDashboard />
              </ProtectedRoute>
            } />

            <Route path="/authority-dashboard" element={
              <ProtectedRoute allowedRoles={['city_authority', 'admin']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GlobalSOS />
          <SafetyChatbot />
          <Footer />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
