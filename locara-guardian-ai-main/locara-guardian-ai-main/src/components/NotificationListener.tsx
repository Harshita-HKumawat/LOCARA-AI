/**
 * NotificationListener.tsx
 *
 * Completely rewritten notification engine.
 *
 * Strategy:
 * - Read "last seen" complaint statuses from localStorage (survives page refresh)
 * - Listen to the complaints BroadcastChannel for instant cross-tab updates
 * - Poll localStorage every 4 seconds as a fallback
 * - When a status change is detected for the logged-in citizen's complaint → fire notification
 */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/useNotificationStore';
import type { Complaint, ComplaintStatus } from '@/store/useComplaintStore';

const LS_COMPLAINTS_KEY = 'locara_complaints_v2';
const LS_SEEN_KEY = 'locara_seen_statuses'; // { [complaintId]: status }
const BC_CHANNEL = 'locara_complaints_sync';

const STATUS_MESSAGES: Record<ComplaintStatus, string> = {
    'Submitted': 'Your complaint has been received and is pending initial review.',
    'Under Review': 'Authorities are currently reviewing your complaint.',
    'Verified': 'Your complaint has been verified. Authorities are investigating.',
    'Action Taken': 'Action has been taken regarding your reported incident. 🚔',
    'Closed': 'Your complaint has been successfully resolved. ✅',
    'False Report': 'Your complaint was marked as unverified after investigation.',
};

function readComplaints(): Complaint[] {
    try {
        return JSON.parse(localStorage.getItem(LS_COMPLAINTS_KEY) || '[]') as Complaint[];
    } catch {
        return [];
    }
}

function readSeenStatuses(): Record<string, string> {
    try {
        return JSON.parse(localStorage.getItem(LS_SEEN_KEY) || '{}');
    } catch {
        return {};
    }
}

function writeSeenStatuses(seen: Record<string, string>) {
    localStorage.setItem(LS_SEEN_KEY, JSON.stringify(seen));
}

export default function NotificationListener() {
    const { profile } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const navigate = useNavigate();
    const initialised = useRef(false);

    const checkForUpdates = (complaints: Complaint[], userId: string) => {
        const seen = readSeenStatuses();
        const newSeen = { ...seen };
        let changed = false;

        const mine = complaints.filter(c =>
            c.user_id === userId ||
            (userId === 'demo-user-id' && c.user_id === 'demo-user-id')
        );

        mine.forEach(complaint => {
            const prevStatus = seen[complaint.id];

            if (prevStatus === undefined) {
                // First time seeing this complaint — just record it, no notification
                newSeen[complaint.id] = complaint.status;
                changed = true;
                return;
            }

            if (prevStatus !== complaint.status) {
                // Status has CHANGED since we last looked → fire notification
                const msg = STATUS_MESSAGES[complaint.status] ?? `Status updated to ${complaint.status}`;

                addNotification({
                    user_id: userId,
                    title: 'Case Update',
                    message: `[${complaint.case_id}] ${msg}`,
                    type: complaint.status === 'Closed' ? 'success'
                        : complaint.status === 'False Report' ? 'error'
                            : complaint.status === 'Action Taken' ? 'warning'
                                : 'info',
                    link: '/my-complaints',
                });

                toast.info('🔔 Complaint Status Updated', {
                    description: msg,
                    action: {
                        label: 'View Details',
                        onClick: () => navigate('/my-complaints'),
                    },
                    duration: 10000,
                });

                newSeen[complaint.id] = complaint.status;
                changed = true;
            }
        });

        if (changed) writeSeenStatuses(newSeen);
    };

    useEffect(() => {
        if (!profile) return;
        const userId = profile.id;

        // --- Initialise: snapshot current statuses so we don't notify for old data ---
        if (!initialised.current) {
            const complaints = readComplaints();
            const seen = readSeenStatuses();
            const newSeen = { ...seen };

            complaints
                .filter(c => c.user_id === userId || (userId === 'demo-user-id' && c.user_id === 'demo-user-id'))
                .forEach(c => {
                    if (newSeen[c.id] === undefined) {
                        newSeen[c.id] = c.status;
                    }
                });

            writeSeenStatuses(newSeen);
            initialised.current = true;
        }

        // --- BroadcastChannel: instant cross-tab updates ---
        let bc: BroadcastChannel | null = null;
        try {
            bc = new BroadcastChannel(BC_CHANNEL);
            bc.onmessage = (event) => {
                const msg = event.data;
                if (msg?.type === 'UPDATE' && msg.complaint) {
                    // Re-read all complaints from localStorage so we have the full picture
                    const complaints = readComplaints();
                    checkForUpdates(complaints, userId);
                }
            };
        } catch {
            console.warn('[NotificationListener] BroadcastChannel not available.');
        }

        // --- Polling fallback every 4 seconds ---
        const poll = setInterval(() => {
            const complaints = readComplaints();
            checkForUpdates(complaints, userId);
        }, 4000);

        return () => {
            bc?.close();
            clearInterval(poll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile?.id]);

    return null;
}
