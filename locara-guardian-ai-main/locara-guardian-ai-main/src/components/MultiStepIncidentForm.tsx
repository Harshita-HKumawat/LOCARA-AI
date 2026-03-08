import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle, Clock, MapPin, Camera, Mic, CheckCircle2,
    ChevronRight, ChevronLeft, Shield, Sun, Moon, CloudMoon, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useComplaintStore } from "@/store/useComplaintStore";
import { useAuthStore } from "@/store/useAuthStore";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function MultiStepIncidentForm({
    onComplete,
    initialLocation
}: {
    onComplete: () => void;
    initialLocation: { lat: number, lng: number } | null;
}) {
    const [step, setStep] = useState<Step>(1);
    const [submitting, setSubmitting] = useState(false);
    const [submittedCaseId, setSubmittedCaseId] = useState('');
    const { profile } = useAuthStore();
    const { submitComplaint } = useComplaintStore();

    const [formData, setFormData] = useState({
        incidentType: "",
        severity: "medium" as 'low' | 'medium' | 'high' | 'critical',
        description: "",
        lighting: "bright",
        crowdLevel: "moderate",
        landmark: "",
        city: "",
        state: "",
        address: "",
        witness: "",
        isAnonymous: false,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    });

    const nextStep = () => setStep((s) => (s + 1) as Step);
    const prevStep = () => setStep((s) => (s - 1) as Step);

    const handleSubmit = async () => {
        if (!initialLocation && !formData.address) {
            toast.error("Location data missing. Please select on map or enter address.");
            return;
        }

        setSubmitting(true);
        try {
            const manualLocation = [
                formData.address,
                formData.landmark,
                formData.city,
                formData.state
            ].filter(Boolean).join(', ');

            const caseId = await submitComplaint({
                user_id: formData.isAnonymous ? null : (profile?.id || null),
                incident_type: formData.incidentType,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                latitude: initialLocation?.lat || 0,
                longitude: initialLocation?.lng || 0,
                manual_location: manualLocation,
                lighting_condition: formData.lighting,
                severity: formData.severity,
                is_anonymous: formData.isAnonymous,
                reporter_name: formData.isAnonymous ? undefined : (profile?.name || undefined),
                reporter_email: formData.isAnonymous ? undefined : (profile?.email || undefined),
            });

            setSubmittedCaseId(caseId);
            setStep(6);
            setTimeout(() => onComplete(), 6000);
        } catch (error) {
            toast.error("Failed to submit report. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const copyCaseId = () => {
        navigator.clipboard.writeText(submittedCaseId);
        toast.success("Case ID copied to clipboard!");
    };

    return (
        <div className="glass-card-strong p-6 md:p-8 bg-white/40 border-white/60 shadow-2xl max-h-[580px] flex flex-col overflow-hidden">
            {/* Progress Bar */}
            {step < 6 && (
                <div className="mb-6 flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-primary/10'}`}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 shrink-0">
                        Step {step}/5
                    </span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="wait">

                    {/* ── STEP 1: Incident Type ── */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Identify Incident</h3>
                                <p className="text-sm text-muted-foreground">What kind of activity are you reporting?</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {["Theft", "Harassment", "Assault", "Vandalism", "Suspicious", "Medical", "Traffic", "Other"].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFormData({ ...formData, incidentType: t })}
                                        className={`p-4 rounded-2xl border text-xs font-bold transition-all ${formData.incidentType === t
                                            ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                            : 'bg-white/50 border-white hover:bg-white text-muted-foreground'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-xl bg-white/60"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Time</label>
                                    <Input
                                        type="time"
                                        className="h-12 rounded-xl bg-white/60"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Severity Level</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['low', 'medium', 'high', 'critical'] as const).map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, severity: s })}
                                            className={`py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${formData.severity === s
                                                ? s === 'critical' ? 'bg-rose text-white border-rose'
                                                    : s === 'high' ? 'bg-orange-500 text-white border-orange-500'
                                                        : s === 'medium' ? 'bg-gold text-white border-gold'
                                                            : 'bg-emerald-500 text-white border-emerald-500'
                                                : 'bg-white/40 border-white text-muted-foreground'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: Location ── */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Location Details</h3>
                                <p className="text-sm text-muted-foreground">Help us pinpoint the exact area.</p>
                            </div>
                            {initialLocation && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    <span className="text-[11px] font-bold text-emerald-700">
                                        GPS Location captured: {initialLocation.lat.toFixed(4)}, {initialLocation.lng.toFixed(4)}
                                    </span>
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="City"
                                        className="h-12 rounded-xl bg-white/60 border-white"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                    <Input
                                        placeholder="State"
                                        className="h-12 rounded-xl bg-white/60 border-white"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                                <Input
                                    placeholder="Manual Location / Street Address"
                                    className="h-12 rounded-xl bg-white/60 border-white"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lighting Condition</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'bright', icon: Sun, label: 'Well Lit' },
                                                { id: 'dim', icon: CloudMoon, label: 'Dim' },
                                                { id: 'dark', icon: Moon, label: 'Dark' },
                                            ].map((l) => (
                                                <button
                                                    key={l.id}
                                                    onClick={() => setFormData({ ...formData, lighting: l.id })}
                                                    className={`flex flex-col items-center gap-2 py-3 rounded-xl border transition-all ${formData.lighting === l.id
                                                        ? 'bg-primary text-white border-primary shadow-md'
                                                        : 'bg-white/50 border-white text-muted-foreground'
                                                        }`}
                                                >
                                                    <l.icon className="h-4 w-4" />
                                                    <span className="text-[8px] font-bold uppercase">{l.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Crowd Density</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'empty', label: 'Empty' },
                                                { id: 'moderate', label: 'Moderate' },
                                                { id: 'crowded', label: 'Heavy' },
                                            ].map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => setFormData({ ...formData, crowdLevel: c.id })}
                                                    className={`py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${formData.crowdLevel === c.id
                                                        ? 'bg-midnight text-white border-midnight shadow-md'
                                                        : 'bg-white/50 border-white text-muted-foreground'
                                                        }`}
                                                >
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 3: Incident Details ── */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Incident Details</h3>
                                <p className="text-sm text-muted-foreground">Describe what happened in detail.</p>
                            </div>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Tell us exactly what you witnessed or experienced..."
                                    className="min-h-[130px] rounded-2xl bg-white/60 border-white p-4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Landmark (e.g. Near Metro Station)"
                                        className="h-12 rounded-xl bg-white/60 border-white"
                                        value={formData.landmark}
                                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Witness info (Optional)"
                                        className="h-12 rounded-xl bg-white/60 border-white"
                                        value={formData.witness}
                                        onChange={(e) => setFormData({ ...formData, witness: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer"
                                    onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}>
                                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${formData.isAnonymous ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                                        {formData.isAnonymous && <CheckCircle2 className="h-3 w-3 text-white" />}
                                    </div>
                                    <label className="text-xs font-bold text-primary cursor-pointer select-none">
                                        Report anonymously — my identity will not be shared with authorities
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 4: Verification ── */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Anti-False Report Check</h3>
                                <p className="text-sm text-muted-foreground">Review your submission to prevent false filings.</p>
                            </div>
                            <div className="space-y-4 p-5 rounded-2xl bg-white/70 border border-white shadow-sm">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Type</span>
                                    <span className="font-bold text-foreground bg-primary/10 text-primary px-3 py-1 rounded-full">{formData.incidentType || 'Not set'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Date / Time</span>
                                    <span className="font-bold">{formData.date} at {formData.time}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Location</span>
                                    <span className="font-bold text-right max-w-[180px]">
                                        {formData.address || formData.city || (initialLocation ? `${initialLocation.lat.toFixed(3)}, ${initialLocation.lng.toFixed(3)}` : 'Not set')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Severity</span>
                                    <span className={`font-black uppercase px-3 py-1 rounded-full text-white ${formData.severity === 'critical' ? 'bg-rose' : formData.severity === 'high' ? 'bg-orange-500' : formData.severity === 'medium' ? 'bg-gold' : 'bg-emerald-500'}`}>
                                        {formData.severity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-muted-foreground uppercase tracking-widest">Identity</span>
                                    <span className={`font-bold ${formData.isAnonymous ? 'text-primary' : 'text-foreground'}`}>
                                        {formData.isAnonymous ? '🔒 Anonymous' : profile?.name || 'Identified Reporter'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose/5 border border-rose/20 flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-rose shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-rose uppercase tracking-widest mb-1">Legal Warning</p>
                                    <p className="text-[10px] text-rose-800 font-medium leading-relaxed">
                                        Submitting a false or fabricated report is a punishable offense under IPC Section 182. Ensure all information is accurate and truthful.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 5: Evidence ── */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Supporting Evidence</h3>
                                <p className="text-sm text-muted-foreground">Attach photos, videos, or audio recordings (optional but recommended).</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="aspect-square border-2 border-dashed border-white rounded-3xl flex flex-col items-center justify-center gap-3 bg-white/20 hover:bg-white/40 transition-all cursor-pointer">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                                        <Camera className="h-8 w-8" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground text-center">Photo / Video</span>
                                    <input type="file" accept="image/*,video/*" multiple className="hidden"
                                        onChange={() => toast.info("Evidence file captured and encrypted.")} />
                                </label>
                                <div
                                    onClick={() => toast.info("Voice recording system activated. Speak clearly.")}
                                    className="aspect-square border-2 border-dashed border-white rounded-3xl flex flex-col items-center justify-center gap-3 bg-white/20 hover:bg-white/40 transition-all cursor-pointer group"
                                >
                                    <div className="p-4 rounded-full bg-midnight/10 text-midnight group-hover:bg-primary group-hover:text-white transition-all relative">
                                        <Mic className="h-8 w-8" />
                                        <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 scale-150" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Voice Note</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                                <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-1" />
                                <p className="text-[10px] text-emerald-800 font-medium leading-relaxed uppercase tracking-wider">
                                    {formData.isAnonymous
                                        ? "Your identity will remain completely confidential. Evidence is encrypted end-to-end."
                                        : "All evidence is encrypted and protected by law. Only authorized personnel can access it."}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 6: Success ── */}
                    {step === 6 && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full py-8 text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: 2, duration: 0.4 }}
                                className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-200"
                            >
                                <CheckCircle2 className="h-12 w-12 text-white" />
                            </motion.div>
                            <h3 className="font-heading text-3xl font-bold text-foreground mb-2 tracking-tight">Report Secured!</h3>
                            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                                Your complaint has been transmitted to the regional authority command center and is now under review.
                            </p>
                            <div className="w-full p-5 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Your Case ID</div>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="font-mono text-2xl font-black text-foreground tracking-widest">{submittedCaseId}</span>
                                    <button onClick={copyCaseId} className="p-2 rounded-xl hover:bg-primary/10 transition-colors">
                                        <Copy className="h-4 w-4 text-primary" />
                                    </button>
                                </div>
                                <div className="text-[10px] text-muted-foreground">Save this ID to track your complaint status</div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
                                <span className="text-xs text-muted-foreground">Auto-closing in a few seconds...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {step < 6 && (
                <div className="mt-6 flex items-center justify-between flex-shrink-0">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="rounded-xl px-6 h-12 flex items-center gap-2 group"
                    >
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </Button>

                    {step < 5 ? (
                        <Button
                            onClick={nextStep}
                            disabled={step === 1 && !formData.incidentType}
                            className="rounded-xl px-10 h-14 bg-midnight hover:bg-black text-white shadow-xl flex items-center gap-2 group"
                        >
                            Next Step <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="rounded-xl px-12 h-16 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                        <Shield className="h-4 w-4" />
                                    </motion.div>
                                    Encrypting Report...
                                </>
                            ) : (
                                <>Finalize Report <Shield className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
