import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('citizen' | 'police' | 'city_authority' | 'admin')[];
}

function getDashboardForRole(role?: string) {
    if (role === 'police') return '/police-dashboard';
    if (role === 'city_authority') return '/authority-dashboard';
    if (role === 'admin') return '/admin-dashboard';
    return '/dashboard';
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuthStore();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Redirect to the correct dashboard for the user's actual role
        // rather than showing a generic unauthorized page
        const correctDashboard = getDashboardForRole(profile.role);
        // Only redirect if we're not already on the correct dashboard
        if (location.pathname !== correctDashboard) {
            return <Navigate to={correctDashboard} replace />;
        }
    }

    return <>{children}</>;
}
