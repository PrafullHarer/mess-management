'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserCog, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'Profile', href: '/student/profile', icon: UserCog },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function StudentSidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <>
            {/* Mobile Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside className={`w-64 bg-[#0A0A0A] h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 transform 
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">
                            Mess & Canteen
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5">Student Portal</p>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-2 text-neutral-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? 'bg-[#ff7b9b] text-white'
                                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-800 space-y-2">
                    {/* User Profile Section */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-neutral-900/50 rounded-xl border border-neutral-800/50">
                        <div className="w-8 h-8 rounded-full bg-[#ff7b9b] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {user?.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Student'}</p>
                            <p className="text-[10px] text-neutral-500 truncate uppercase tracking-tighter font-semibold">{user?.mobile || 'No Mobile'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-neutral-400 hover:text-red-400 hover:bg-neutral-900/50 rounded-lg text-sm font-medium transition-all duration-150 group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
