import { create } from 'zustand';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    created_at: string;
    link?: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const LS_KEY = 'locara_notifications';

const lsRead = (): Notification[] => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const lsWrite = (notifications: Notification[]) => {
    localStorage.setItem(LS_KEY, JSON.stringify(notifications));
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: lsRead(),
    unreadCount: lsRead().filter(n => !n.read).length,

    addNotification: (data) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            read: false,
            created_at: new Date().toISOString(),
            ...data
        };

        const updated = [newNotification, ...get().notifications];
        lsWrite(updated);
        set({
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length
        });
    },

    markAsRead: (id) => {
        const updated = get().notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        lsWrite(updated);
        set({
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length
        });
    },

    markAllAsRead: () => {
        const updated = get().notifications.map(n => ({ ...n, read: true }));
        lsWrite(updated);
        set({
            notifications: updated,
            unreadCount: 0
        });
    },

    clearNotifications: () => {
        lsWrite([]);
        set({ notifications: [], unreadCount: 0 });
    }
}));
