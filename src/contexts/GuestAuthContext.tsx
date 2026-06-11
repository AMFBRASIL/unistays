import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

const GUEST_POST_LOGIN_REDIRECT_KEY = 'guest_post_login_redirect';

interface GuestUser {
    id: number;
    name?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    reservationId?: string;
    documentNumber?: string;
    nationality?: string;
    tier?: string;
    loyaltyPoints?: number;
    totalStays?: number;
    memberSince?: string | Date;
    preferences?: any;
}

interface GuestAuthContextType {
    guestUser: GuestUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithReservation: (reservationCode: string, lastName: string, checkInDate: string) => Promise<void>;
    logout: () => void;
    /** Atualiza o perfil do hóspede a partir da API (após PUT /guests/me ou web check-in). */
    refreshGuestUser: () => Promise<void>;
}

const GuestAuthContext = createContext<GuestAuthContextType | undefined>(undefined);

export function GuestAuthProvider({ children }: { children: ReactNode }) {
    const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const resolvePostLoginRedirect = () => {
        const redirectTo = sessionStorage.getItem(GUEST_POST_LOGIN_REDIRECT_KEY);
        if (redirectTo) {
            sessionStorage.removeItem(GUEST_POST_LOGIN_REDIRECT_KEY);
            return redirectTo;
        }
        return '/guest-portal';
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('guestToken');
            const storedUser = localStorage.getItem('guest_user');

            if (!token) {
                setGuestUser(null);
                setIsLoading(false);
                return;
            }

            if (storedUser) {
                try {
                    setGuestUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error parsing stored guest user:', error);
                    localStorage.removeItem('guestToken');
                    localStorage.removeItem('guest_user');
                    setGuestUser(null);
                    setIsLoading(false);
                    return;
                }
            }

            try {
                const response = await api.getGuestMe();
                if (response.success && response.data && typeof response.data === 'object' && 'guest' in response.data) {
                    const g = (response.data as { guest: Record<string, unknown> }).guest;
                    const merged = {
                        ...g,
                        name:
                            (g.name as string) ||
                            `${(g.firstName as string) || ''} ${(g.lastName as string) || ''}`.trim(),
                    };
                    setGuestUser(merged as GuestUser);
                    localStorage.setItem('guest_user', JSON.stringify(merged));
                } else {
                    localStorage.removeItem('guestToken');
                    localStorage.removeItem('guest_user');
                    setGuestUser(null);
                }
            } catch {
                localStorage.removeItem('guestToken');
                localStorage.removeItem('guest_user');
                setGuestUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.guestLogin(email, password);

            if (response.success && response.data) {
                const { token, guest } = response.data;
                localStorage.setItem('guestToken', token);
                localStorage.setItem('guest_user', JSON.stringify(guest));
                setGuestUser(guest);
                navigate(resolvePostLoginRedirect());
            } else {
                throw new Error(response.error?.message || 'Login failed');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to login');
        }
    };

    const loginWithReservation = async (reservationCode: string, lastName: string, checkInDate: string) => {
        try {
            const response = await api.guestLoginWithReservation({
                reservationCode,
                lastName,
                checkInDate
            });

            if (response.success && response.data) {
                const { token, guest } = response.data;
                localStorage.setItem('guestToken', token);
                localStorage.setItem('guest_user', JSON.stringify(guest));
                setGuestUser(guest);
                navigate(resolvePostLoginRedirect());
            } else {
                throw new Error(response.error?.message || 'Reservation not found');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to login with reservation');
        }
    };

    const logout = () => {
        localStorage.removeItem('guestToken');
        localStorage.removeItem('guest_user');
        setGuestUser(null);
        navigate('/guest-portal/login');
    };

    const refreshGuestUser = async () => {
        const token = localStorage.getItem('guestToken');
        if (!token) return;
        try {
            const response = await api.getGuestMe();
            if (response.success && response.data && typeof response.data === 'object' && 'guest' in response.data) {
                const g = (response.data as { guest: Record<string, unknown> }).guest;
                const merged = {
                    ...g,
                    name:
                        (g.name as string) ||
                        `${(g.firstName as string) || ''} ${(g.lastName as string) || ''}`.trim(),
                };
                setGuestUser(merged as GuestUser);
                localStorage.setItem('guest_user', JSON.stringify(merged));
            }
        } catch (e) {
            console.error('refreshGuestUser failed', e);
        }
    };

    return (
        <GuestAuthContext.Provider value={{
            guestUser,
            isLoading,
            isAuthenticated: !!guestUser,
            login,
            loginWithReservation,
            logout,
            refreshGuestUser,
        }}>
            {children}
        </GuestAuthContext.Provider>
    );
}

export function useGuestAuth() {
    const context = useContext(GuestAuthContext);
    if (context === undefined) {
        throw new Error('useGuestAuth must be used within a GuestAuthProvider');
    }
    return context;
}
