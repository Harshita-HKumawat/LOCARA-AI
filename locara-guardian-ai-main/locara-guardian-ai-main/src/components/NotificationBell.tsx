import { useState } from 'react';
import { Bell, Check, Trash2, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
    } = useNotificationStore();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white/40 border border-white hover:bg-white transition-all shadow-sm group"
            >
                <Bell className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[8px] font-black text-white shadow-lg ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[-1]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 md:w-96 glass-card shadow-2xl border-white/60 overflow-hidden flex flex-col z-50"
                        >
                            <div className="p-4 border-b border-white/20 flex items-center justify-between bg-primary/5">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Notifications</h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllAsRead()}
                                            className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            <Check className="h-3 w-3" /> Mark Read
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={() => clearNotifications()}
                                            className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="h-3 w-3" /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                            <Bell className="h-6 w-6 text-slate-300" />
                                        </div>
                                        <p className="text-xs font-bold text-muted-foreground">No new updates right now.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 transition-colors relative group ${notif.read ? 'opacity-70 bg-white/10' : 'bg-primary/5'}`}
                                            >
                                                {!notif.read && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                                )}
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`h-1.5 w-1.5 rounded-full ${notif.type === 'success' ? 'bg-emerald-500' :
                                                                    notif.type === 'warning' ? 'bg-gold' :
                                                                        notif.type === 'error' ? 'bg-rose' : 'bg-primary'
                                                                }`} />
                                                            <h4 className="text-[11px] font-black uppercase tracking-wider text-foreground">{notif.title}</h4>
                                                        </div>
                                                        <p className="text-[11px] font-medium leading-relaxed text-muted-foreground mb-2">
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 capitalize">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                            </div>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {!notif.read && (
                                                                    <button
                                                                        onClick={() => markAsRead(notif.id)}
                                                                        className="p-1 hover:text-primary"
                                                                        title="Mark as read"
                                                                    >
                                                                        <Check className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                                {notif.link && (
                                                                    <Link
                                                                        to={notif.link}
                                                                        onClick={() => {
                                                                            setIsOpen(false);
                                                                            markAsRead(notif.id);
                                                                        }}
                                                                        className="p-1 hover:text-primary"
                                                                        title="View Details"
                                                                    >
                                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 bg-white/50 border-t border-white/20 text-center">
                                    <Link
                                        to="/my-complaints"
                                        onClick={() => setIsOpen(false)}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                    >
                                        View All Reports
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
