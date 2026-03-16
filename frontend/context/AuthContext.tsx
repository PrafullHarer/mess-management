'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    role: 'SUPER_ADMIN' | 'OWNER' | 'STUDENT' | 'MANAGER';
    mobile: string;
    email?: string;
    messId?: string | null;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUserInfo: (userData: User) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await import('../lib/api').then(mod => mod.default.get('/auth/me'));
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            } catch (error) {
                console.error("Session verification failed", error);
                Cookies.remove('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (token: string, userData: User) => {
        Cookies.set('token', token, { expires: 30 });
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Route based on role
        switch (userData.role) {
            case 'SUPER_ADMIN':
                router.push('/super-admin');
                break;
            case 'OWNER':
            case 'MANAGER':
                router.push('/owner');
                break;
            case 'STUDENT':
                router.push('/student');
                break;
            default:
                router.push('/login');
        }
    };

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const updateUserInfo = (userData: User) => {
        if (!user) return;
        const newUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserInfo, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
