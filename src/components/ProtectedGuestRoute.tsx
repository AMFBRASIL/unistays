import { Navigate } from 'react-router-dom';
import { useGuestAuth } from '@/contexts/GuestAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedGuestRouteProps {
    children: React.ReactNode;
}

export function ProtectedGuestRoute({ children }: ProtectedGuestRouteProps) {
    const { guestUser, isLoading } = useGuestAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!guestUser) {
        return <Navigate to="/guest-portal/login" replace />;
    }

    return <>{children}</>;
}
