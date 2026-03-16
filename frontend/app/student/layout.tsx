'use client';
import { useState, useEffect } from 'react';
import StudentSidebar from '@/components/StudentSidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'STUDENT')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#faeee7]">
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }
    if (!user || user.role !== 'STUDENT') return null;

    return (
        <div className="min-h-screen bg-[#faeee7]">
            <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-[#0A0A0A] flex items-center px-4 sticky top-0 z-30 shadow-md">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="ml-3">
                    <h1 className="text-base font-bold text-white tracking-tight">{user.name}</h1>
                    <p className="text-[10px] text-neutral-500 -mt-0.5">Student Dashboard</p>
                </div>
            </header>

            <main className="lg:ml-64 p-4 lg:p-10 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
