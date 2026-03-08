
import { motion } from "framer-motion";
import { ShieldAlert, Home, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center section-padding bg-slate-50">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card-strong p-10 border-rose/20 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-rose animate-pulse" />

                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-rose/10 text-rose mb-8">
                        <ShieldAlert className="h-10 w-10" />
                    </div>

                    <h1 className="font-heading text-4xl font-bold text-foreground mb-4 tracking-tight">
                        Access <span className="text-rose">Denied</span>
                    </h1>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-10">
                        You don't have the required administrative clearance to access the Authority Command Center. Please verify your credentials or contact a system administrator.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full rounded-2xl h-12 bg-midnight text-white hover:bg-black font-bold uppercase tracking-widest text-[10px]"
                            onClick={() => navigate("/")}
                        >
                            <Home className="h-4 w-4 mr-2" /> Return to Secure Home
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full rounded-2xl h-12 border-slate-200 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px]"
                            onClick={() => navigate(-1)}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Go Back
                        </Button>
                    </div>

                    <div className="mt-8 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                        Security Protocol Alpha-9
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
