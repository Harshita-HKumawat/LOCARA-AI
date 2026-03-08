import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, MapPin, ShieldAlert, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useIncidentStore } from '@/store/useIncidentStore';

export default function GlobalSOS() {
    const [isCounting, setIsCounting] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const { profile } = useAuthStore();
    const { triggerSOS } = useIncidentStore();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isCounting && countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        } else if (isCounting && countdown === 0) {
            handleFinalSOS();
            setIsCounting(false);
            setCountdown(5);
        }
        return () => clearTimeout(timer);
    }, [isCounting, countdown]);

    const handleButtonClick = () => {
        if (!isCounting) {
            setIsCounting(true);
            toast.warning("Emergency countdown triggered!", {
                description: "Police and emergency services will be notified in 5 seconds."
            });
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCounting(false);
        setCountdown(5);
        toast.info("SOS cancelled.");
    };

    const handleFinalSOS = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    triggerSOS(pos.coords.latitude, pos.coords.longitude, profile?.id || 'anonymous');
                    toast.error("SOS Dispatched!", {
                        description: "Your live location is being shared with nearby police patrols."
                    });
                },
                err => {
                    toast.error("Location error. SOS triggered without coordinates.");
                    triggerSOS(0, 0, profile?.id || 'anonymous');
                }
            );
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            <AnimatePresence>
                {isCounting && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-24 right-0 w-64 glass-card p-6 border-rose/30 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-rose/5 animate-pulse" />
                        <div className="relative z-10 text-center">
                            <ShieldAlert className="h-10 w-10 text-rose mx-auto mb-3" />
                            <h3 className="font-heading font-bold text-lg text-rose">Emergency SOS</h3>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">
                                Alerting authorities in <span className="font-bold text-rose text-base">{countdown}s</span>
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full rounded-full border-rose/30 text-rose hover:bg-rose/10"
                                onClick={handleCancel}
                            >
                                <X className="h-4 w-4 mr-2" /> Cancel Alert
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleButtonClick}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isCounting ? 'bg-rose animate-ping' : 'bg-gradient-to-tr from-rose to-red-600 hover:shadow-rose/40'}`}
            >
                <Radio className="h-8 w-8" />
            </motion.button>
        </div>
    );
}
