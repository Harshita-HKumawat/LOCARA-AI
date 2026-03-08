import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, UserPlus, Trash2, ShieldCheck, Phone,
    Settings, Share2, Globe, MapPin, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedSection from "@/components/AnimatedSection";
import { toast } from "sonner";

interface Contact {
    id: string;
    name: string;
    phone: string;
    relationship: string;
}

export default function TrustedContacts() {
    const [contacts, setContacts] = useState<Contact[]>([
        { id: '1', name: 'Emma Watson', phone: '+1 415-555-0123', relationship: 'Sister' },
        { id: '2', name: 'James Wilson', phone: '+1 415-555-0199', relationship: 'Partner' },
    ]);

    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newRel, setNewRel] = useState("");
    const [sharingActive, setSharingActive] = useState(false);

    const addContact = () => {
        if (!newName || !newPhone) return;
        const newContact: Contact = {
            id: Math.random().toString(),
            name: newName,
            phone: newPhone,
            relationship: newRel,
        };
        setContacts([...contacts, newContact]);
        setNewName("");
        setNewPhone("");
        setNewRel("");
        toast.success("Trusted contact added.");
    };

    const removeContact = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id));
        toast.info("Contact removed.");
    };

    const toggleSharing = () => {
        setSharingActive(!sharingActive);
        if (!sharingActive) {
            toast.success("Live Location Sharing Activated", {
                description: "Your trusted contacts are now receiving real-time coordinates."
            });
        } else {
            toast.info("Location Sharing Deactivated");
        }
    };

    return (
        <div className="min-h-screen pt-28 pb-12 bg-[radial-gradient(circle_at_top_right,_hsl(280,40%,90%,0.2),_transparent)]">
            <div className="mx-auto max-w-6xl px-4">
                <AnimatedSection>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary mb-4">
                                <Users className="h-4 w-4" /> Safety Network
                            </div>
                            <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl tracking-tight">
                                Trusted <span className="gradient-text">Guardians</span>
                            </h1>
                            <p className="text-muted-foreground mt-4 text-lg">Manage the people who look out for you.</p>
                        </div>

                        <Button
                            onClick={toggleSharing}
                            className={`rounded-2xl h-16 px-8 font-bold uppercase tracking-[0.2em] text-xs shadow-xl transition-all ${sharingActive
                                    ? 'bg-rose text-white hover:bg-rose/90 animate-pulse'
                                    : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {sharingActive ? <Radio className="mr-3 h-4 w-4 animate-ping" /> : <Share2 className="mr-3 h-4 w-4" />}
                            {sharingActive ? "Stop Live Sharing" : "Start Live Sharing"}
                        </Button>
                    </div>
                </AnimatedSection>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Add Contact Card */}
                    <AnimatedSection className="lg:col-span-1">
                        <div className="glass-card-strong p-8 bg-white/40 border-white/60 shadow-2xl sticky top-28">
                            <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-primary" />
                                Add Emergency Contact
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <Input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="E.g. Sophia Miller"
                                        className="h-12 rounded-xl bg-white/60 border-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                    <Input
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="h-12 rounded-xl bg-white/60 border-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Relationship</label>
                                    <Input
                                        value={newRel}
                                        onChange={(e) => setNewRel(e.target.value)}
                                        placeholder="Sister, Parent, Friend..."
                                        className="h-12 rounded-xl bg-white/60 border-white"
                                    />
                                </div>
                                <Button
                                    onClick={addContact}
                                    className="w-full h-14 rounded-xl mt-4 font-bold tracking-widest uppercase text-xs"
                                >
                                    Register Contact
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Contact List */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="popLayout">
                            {contacts.map((contact, i) => (
                                <motion.div
                                    key={contact.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/30 transition-all shadow-lg"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-lavender/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                                                {contact.name}
                                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                            </h4>
                                            <div className="flex flex-wrap gap-4 mt-1">
                                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <Phone className="h-3 w-3" /> {contact.phone}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                    {contact.relationship}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeContact(contact.id)}
                                            className="h-12 w-12 rounded-xl text-muted-foreground hover:text-rose hover:bg-rose/10"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                        <div className="h-12 w-1 bg-slate-100 mx-1 hidden md:block" />
                                        <Button className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-200">
                                            Test Alert
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {sharingActive && (
                            <AnimatedSection>
                                <div className="glass-card p-10 bg-slate-900 text-white border-none relative overflow-hidden">
                                    <div className="absolute top-0 right-0 h-full w-1/3 bg-primary/20 blur-[100px]" />
                                    <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-3 w-3 rounded-full bg-rose animate-ping" />
                                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Live Transmission</span>
                                            </div>
                                            <h3 className="font-heading text-2xl font-bold mb-4">Map View Active</h3>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                                Your location is being encrypted and synchronized with your 2 trusted guardians.
                                                Battery optimized: 40s intervals.
                                            </p>
                                            <div className="flex gap-4">
                                                <div className="p-3 bg-white/10 rounded-xl flex flex-col gap-1">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black uppercase">Latitude</span>
                                                    <span className="text-xs font-mono font-bold tracking-widest text-emerald-400">37.7749° N</span>
                                                </div>
                                                <div className="p-3 bg-white/10 rounded-xl flex flex-col gap-1">
                                                    <span className="text-[10px] text-slate-500 uppercase font-black">Longitude</span>
                                                    <span className="text-xs font-mono font-bold tracking-widest text-emerald-400">122.4194° W</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="aspect-video bg-slate-800 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                                            <MapPin className="h-8 w-8 text-primary animate-bounce" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent,_#000000a0)]" />
                                            <div className="absolute bottom-4 left-4 text-[10px] font-bold flex items-center gap-2">
                                                <Globe className="h-3 w-3 text-primary" /> Global Positioning System Enabled
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
