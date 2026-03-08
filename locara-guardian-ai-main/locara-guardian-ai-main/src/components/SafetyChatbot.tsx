import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Shield, Zap, Info, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export default function SafetyChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: "Hello! I am your LOCARA-AI Safety Assistant. How can I help you stay secure today?" }
    ]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Simulate AI response
        setTimeout(() => {
            let response = "I'm analyzing your request. Based on current safety data, I recommend staying in well-lit areas and ensuring your Trusted Contacts are notified of your route.";

            if (input.toLowerCase().includes("emergency") || input.toLowerCase().includes("sos")) {
                response = "IF YOU ARE IN IMMEDIATE DANGER, PLEASE PRESS THE RED SOS BUTTON OR CALL 911 IMMEDIATELY. My AI dispatch logic is on standby.";
            } else if (input.toLowerCase().includes("light") || input.toLowerCase().includes("dark")) {
                response = "Our data shows that street lighting in Sector 4 is currently suboptimal. I recommend taking the Main Avenue route which has 92% illumination coverage.";
            } else if (input.toLowerCase().includes("route") || input.toLowerCase().includes("map")) {
                response = "I can help you find a Safe Route. Check the 'Safe Route AI' tab on your dashboard for the most secure pathing.";
            }

            setMessages(prev => [...prev, { role: 'ai', content: response }]);
        }, 1000);
    };

    return (
        <>
            <div className="fixed bottom-24 right-8 z-[9000]">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="mb-4 w-80 md:w-96 glass-card-strong overflow-hidden flex flex-col h-[500px] shadow-2xl border-white/60 bg-white/40"
                        >
                            <div className="p-4 bg-primary text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                        <Brain className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-heading font-bold text-sm">LOCARA-AI Agent</h4>
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Safety Intelligence Live</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 rounded-xl h-10 w-10">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/20 backdrop-blur-sm">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${m.role === 'user'
                                                ? 'bg-primary text-white rounded-br-none shadow-primary/20'
                                                : 'bg-white border border-slate-100 rounded-bl-none text-slate-700'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-white/40 bg-white/40">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type safety question..."
                                        className="rounded-xl border-white bg-white/60 h-12 text-xs font-medium focus:bg-white transition-all shadow-inner"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <Button onClick={handleSend} size="icon" className="shrink-0 h-12 w-12 rounded-xl bg-midnight hover:bg-black text-white shadow-xl">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    {["Safe Route", "SOS Help", "Guidelines"].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setInput(t)}
                                            className="px-3 py-1.5 rounded-lg bg-white/60 border border-white text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-white hover:text-primary transition-all"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-16 w-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all ${isOpen ? 'bg-midnight text-white' : 'bg-primary text-white'
                        }`}
                >
                    {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
                    {!isOpen && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-rose rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                            1
                        </div>
                    )}
                </motion.button>
            </div>

            <div className="fixed bottom-8 left-8 z-[9000] hidden md:block">
                <div className="glass-card p-4 border-white/60 bg-white/30 backdrop-blur-xl flex items-center gap-4 group cursor-pointer hover:bg-white/50 transition-all shadow-xl rounded-[28px]">
                    <div className="h-10 w-10 flex items-center justify-center bg-rose text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-rose mb-0.5">High Performance AI</h5>
                        <p className="text-[11px] font-bold text-slate-800">Response optimized for Low Latency</p>
                    </div>
                    <Info className="h-4 w-4 text-slate-300 ml-2" />
                </div>
            </div>
        </>
    );
}
