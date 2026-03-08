import { Bell, Check, CheckCheck, ExternalLink, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<string, { color: string; bg: string }> = {
    info: { color: 'text-primary', bg: 'bg-primary/10' },
    success: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    warning: { color: 'text-gold', bg: 'bg-gold/10' },
    error: { color: 'text-rose', bg: 'bg-rose/10' },
};

export default function ComplaintNotificationsPanel() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();

    return (
        <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <Bell className={`h-5 w-5 text-primary ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                    Complaint Notifications
                    {unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose text-[9px] font-black text-white shadow">
                            {unreadCount}
                        </span>
                    )}
                </h3>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllAsRead()}
                            className="text-[10px] uppercase tracking-widest font-black h-8 text-primary hover:bg-primary/5"
                        >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Mark All Read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearNotifications()}
                            className="text-[10px] uppercase tracking-widest font-black h-8 text-muted-foreground hover:text-rose hover:bg-rose/5"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence>
                    {notifications.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center opacity-40">
                            <Bell className="h-10 w-10 mb-4 text-slate-300" />
                            <p className="text-sm font-bold text-muted-foreground">You're all caught up!</p>
                            <p className="text-xs text-muted-foreground mt-1">Notifications will appear here when authorities update your complaint status.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const style = TYPE_ICONS[notif.type] || TYPE_ICONS.info;
                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`relative rounded-2xl p-4 border transition-all group ${notif.read
                                            ? 'bg-white/40 border-white/40 opacity-70'
                                            : 'bg-white border-primary/20 shadow-sm'
                                        }`}
                                >
                                    {/* Unread indicator stripe */}
                                    {!notif.read && (
                                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full" />
                                    )}

                                    <div className="flex items-start gap-3 pl-2">
                                        <div className={`shrink-0 p-2 rounded-xl ${style.bg}`}>
                                            <Bell className={`h-4 w-4 ${style.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-[11px] font-black uppercase tracking-wider text-foreground">
                                                    {notif.title}
                                                </p>
                                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notif.read && (
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="p-1 hover:text-primary transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                    {notif.link && (
                                                        <Link
                                                            to={notif.link}
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="p-1 hover:text-primary transition-colors"
                                                            title="View Details"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {notifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20 text-center">
                    <Link to="/my-complaints" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                        View All My Complaints →
                    </Link>
                </div>
            )}
        </div>
    );
}
