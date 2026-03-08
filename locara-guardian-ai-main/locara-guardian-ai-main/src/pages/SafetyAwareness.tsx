import { motion } from "framer-motion";
import {
    BookOpen, Shield, Heart, Zap, Play, Search,
    ArrowRight, MessageSquare, Download, Share2,
    Eye, Brain, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedSection from "@/components/AnimatedSection";

const guidelines = [
    {
        title: "Urban Navigation",
        icon: Zap,
        desc: "How to identify safe routes in unfamiliar city sectors using ambient lighting and street-active data.",
        readTime: "4 min",
        category: "Strategy"
    },
    {
        title: "Digital Footprint Safety",
        icon: Shield,
        desc: "Protecting your real-time location data while using social sharing platforms.",
        readTime: "6 min",
        category: "Privacy"
    },
    {
        title: "AI Response Protocols",
        icon: Brain,
        desc: "Understanding how LOCARA-AI interprets your distress signals and optimizes dispatch.",
        readTime: "3 min",
        category: "Technology"
    },
    {
        title: "Emergency Communication",
        icon: MessageSquare,
        desc: "Best practices for communicating with emergency dispatchers during high-stress scenarios.",
        readTime: "5 min",
        category: "Communication"
    },
];

const videos = [
    { title: "Self Defense: Volume 1", duration: "12:45", views: "12k+" },
    { title: "Situational Awareness 101", duration: "08:20", views: "45k+" },
    { title: "SOS Feature Masterclass", duration: "05:12", views: "8k+" },
];

export default function SafetyAwareness() {
    return (
        <div className="min-h-screen pt-28 pb-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">

                {/* Hero Section */}
                <AnimatedSection>
                    <div className="text-center mb-24">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                            Intelligence Library
                        </span>
                        <h1 className="font-heading text-5xl font-bold text-foreground md:text-7xl tracking-tight leading-tight mb-8">
                            Stay Informed. <br /><span className="gradient-text">Stay Secure.</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                            Equip yourself with the knowledge and tactical skills to navigate the world with confidence.
                            Powered by global safety insights.
                        </p>

                        <div className="mt-12 max-w-xl mx-auto relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            <Input
                                placeholder="Search guidelines, blogs, or self-defense videos..."
                                className="h-16 pl-14 pr-6 rounded-3xl bg-white/60 border-white shadow-xl focus:bg-white transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                </AnimatedSection>

                <div className="grid gap-12 lg:grid-cols-3 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-16">

                        {/* Guidelines Grid */}
                        <section>
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="font-heading text-3xl font-bold flex items-center gap-3">
                                    <BookOpen className="h-6 w-6 text-primary" /> Safety Guidelines
                                </h2>
                                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl">View All</Button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {guidelines.map((g, i) => (
                                    <AnimatedSection key={g.title} delay={i * 0.1}>
                                        <div className="glass-card-strong p-8 group hover:scale-[1.02] transition-all bg-white border-white/60 shadow-xl border relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <g.icon className="h-24 w-24 text-primary" />
                                            </div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white">
                                                    <g.icon className="h-5 w-5" />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/5">
                                                    {g.category}
                                                </span>
                                            </div>
                                            <h3 className="font-heading text-xl font-bold mb-3 tracking-tight">{g.title}</h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-2">
                                                {g.desc}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Eye className="h-3 w-3" /> {g.readTime} READ
                                                </span>
                                                <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary/10 text-primary font-bold">
                                                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </AnimatedSection>
                                ))}
                            </div>
                        </section>

                        {/* Video Modules */}
                        <section>
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="font-heading text-3xl font-bold flex items-center gap-3">
                                    <Play className="h-6 w-6 text-rose" /> Training Modules
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {videos.map((v, i) => (
                                    <div key={v.title} className="glass-card p-4 flex items-center justify-between border-white hover:bg-white transition-all shadow-md group">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 md:h-20 md:w-28 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-white/80 group-hover:bg-rose group-hover:text-white transition-all flex items-center justify-center shadow-lg">
                                                    <Play className="h-5 w-5 fill-current ml-1" />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>
                                            <div>
                                                <h4 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">{v.title}</h4>
                                                <div className="flex gap-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                    <span>{v.duration}</span>
                                                    <span>•</span>
                                                    <span>{v.views} views</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-400 hover:text-primary">
                                            <Download className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* Daily Tip Card */}
                        <div className="glass-card-strong p-10 bg-gradient-to-br from-primary to-lavender text-white border-none shadow-2xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/10 blur-3xl rounded-full" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="h-10 w-10 flex items-center justify-center bg-white/20 backdrop-blur-xl rounded-2xl">
                                        <Heart className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Daily Insight</span>
                                </div>
                                <p className="font-heading text-xl font-bold leading-relaxed mb-10">
                                    "Your intuition is your first line of defense. If a location feels unsafe, LOCARA-AI likely already has data to support that feeling."
                                </p>
                                <div className="flex gap-3">
                                    <Button className="flex-1 rounded-xl bg-white text-primary font-bold h-12 hover:bg-white/90">Save Tip</Button>
                                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-xl bg-white/10 text-white hover:bg-white/20"><Share2 className="h-5 w-5" /></Button>
                                </div>
                            </div>
                        </div>

                        {/* Resources List */}
                        <div className="glass-card p-10 border-white bg-white/30 backdrop-blur-xl">
                            <h4 className="font-heading text-xl font-bold mb-8">Public Resources</h4>
                            <div className="space-y-6">
                                {[
                                    { title: "Legal Rights Guide", sub: "Regional Laws (PDF)" },
                                    { title: "Victim Support Centers", sub: "Directory" },
                                    { title: "Self Defense Classes", sub: "Partner Network" },
                                    { title: "Smart City Safety APIs", sub: "Developer Documentation" },
                                ].map((d) => (
                                    <div key={d.title} className="group cursor-pointer">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{d.title}</p>
                                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                        </div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{d.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Widget Placeholder */}
                        <div className="p-10 rounded-[40px] bg-slate-100 flex flex-col items-center text-center">
                            <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary mb-6">
                                <HelpCircle className="h-10 w-10" />
                            </div>
                            <h5 className="font-heading text-lg font-bold mb-2">Need Guidance?</h5>
                            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                Our AI assistant is ready to provide real-time safety advice based on your current location.
                            </p>
                            <Button className="w-full h-14 rounded-2xl bg-midnight hover:bg-black font-bold text-[10px] uppercase tracking-widest text-white">Ask LOCARA Agent</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
