'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import {
    Building2, Users, Plus, X, LogOut, TrendingUp,
    ChefHat, Shield, Trash2, Edit, Eye, Ban
} from 'lucide-react';

interface Mess {
    id: string;
    name: string;
    address: string;
    phone: string;
    status: string;
    studentCount: number;
    staffCount: number;
    ownerId?: { name: string; mobile: string; email: string };
}

interface PlatformStats {
    totalMesses: number;
    activeMesses: number;
    totalOwners: number;
    totalStudents: number;
    totalManagers: number;
}

export default function SuperAdminDashboard() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [messes, setMesses] = useState<Mess[]>([]);
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState({
        messName: '', messAddress: '', messPhone: '',
        ownerName: '', ownerMobile: '', ownerEmail: '', ownerPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [messRes, statsRes] = await Promise.all([
                API.get('/super-admin/messes'),
                API.get('/super-admin/stats')
            ]);
            setMesses(messRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to load data', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        try {
            await API.post('/super-admin/messes', form);
            setSuccess('Mess & Owner created successfully!');
            setShowCreateModal(false);
            setForm({ messName: '', messAddress: '', messPhone: '', ownerName: '', ownerMobile: '', ownerEmail: '', ownerPassword: '' });
            fetchData();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to create');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuspend = async (messId: string) => {
        if (!confirm('Are you sure you want to suspend this mess? All users will be deactivated.')) return;
        try {
            await API.delete(`/super-admin/messes/${messId}`);
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to suspend');
        }
    };

    if (loading || !user) return (
        <div className="min-h-screen bg-[#faeee7] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-[#ff7b9b]/30 border-t-[#ff7b9b] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#faeee7]">
            {/* Navbar */}
            <nav className="bg-[#0A0A0A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ff7b9b] rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Super Admin</h1>
                        <p className="text-xs text-neutral-400">Platform Management</p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                        {[
                            { label: 'Total Messes', value: stats.totalMesses, icon: Building2, color: 'bg-blue-50 text-blue-600' },
                            { label: 'Active Messes', value: stats.activeMesses, icon: ChefHat, color: 'bg-emerald-50 text-emerald-600' },
                            { label: 'Owners', value: stats.totalOwners, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                            { label: 'Students', value: stats.totalStudents, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
                            { label: 'Sub-Admins', value: stats.totalManagers, icon: Shield, color: 'bg-pink-50 text-pink-600' }
                        ].map((s, i) => (
                            <div key={i} className="bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-5">
                                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <p className="text-3xl font-bold text-[#0A0A0A]">{s.value}</p>
                                <p className="text-xs text-[#8a7a72] font-medium mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Header + Create Button */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#0A0A0A]">All Messes</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-[#0A0A0A] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add New Mess
                    </button>
                </div>

                {success && (
                    <div className="mb-4 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-medium">
                        {success}
                    </div>
                )}

                {/* Messes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {messes.map((mess) => (
                        <div key={mess.id} className="bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-6 hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#0A0A0A] rounded-xl flex items-center justify-center text-[#ff7b9b] font-bold text-lg">
                                        {mess.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#0A0A0A] text-lg">{mess.name}</h3>
                                        {mess.address && <p className="text-xs text-[#8a7a72]">{mess.address}</p>}
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                    mess.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                    mess.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                                    'bg-neutral-100 text-neutral-600'
                                }`}>
                                    {mess.status}
                                </span>
                            </div>

                            {/* Owner Info */}
                            {mess.ownerId && (
                                <div className="bg-[#faeee7] rounded-xl p-3 mb-4">
                                    <p className="text-xs text-[#8a7a72] font-bold uppercase tracking-wider mb-1">Owner</p>
                                    <p className="text-sm font-semibold text-[#0A0A0A]">{mess.ownerId.name}</p>
                                    <p className="text-xs text-[#8a7a72]">{mess.ownerId.mobile}</p>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 text-center bg-[#faeee7] rounded-lg py-2">
                                    <p className="text-lg font-bold text-[#0A0A0A]">{mess.studentCount}</p>
                                    <p className="text-[10px] text-[#8a7a72] font-semibold uppercase">Students</p>
                                </div>
                                <div className="flex-1 text-center bg-[#faeee7] rounded-lg py-2">
                                    <p className="text-lg font-bold text-[#0A0A0A]">{mess.staffCount}</p>
                                    <p className="text-[10px] text-[#8a7a72] font-semibold uppercase">Staff</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {mess.status === 'ACTIVE' && (
                                <button
                                    onClick={() => handleSuspend(mess.id)}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Ban className="w-3.5 h-3.5" /> Suspend Mess
                                </button>
                            )}
                        </div>
                    ))}

                    {messes.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <Building2 className="w-12 h-12 text-[#8a7a72] mx-auto mb-4 opacity-50" />
                            <p className="text-[#8a7a72] font-medium">No messes created yet</p>
                            <p className="text-sm text-[#8a7a72]/60 mt-1">Click &quot;Add New Mess&quot; to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Mess Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-[#fff5f0] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-[#e8d6cc]">
                            <h2 className="text-xl font-bold text-[#0A0A0A]">Create New Mess</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[#faeee7] rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">{error}</div>
                            )}

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-[#8a7a72] uppercase tracking-wider">Mess Details</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">Mess Name *</label>
                                <input type="text" required value={form.messName} onChange={e => setForm({ ...form, messName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e8d6cc] rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                    placeholder="e.g. Krishna Mess" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">Address</label>
                                <input type="text" value={form.messAddress} onChange={e => setForm({ ...form, messAddress: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e8d6cc] rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                    placeholder="e.g. Near College Gate" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">Phone</label>
                                <input type="text" value={form.messPhone} onChange={e => setForm({ ...form, messPhone: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e8d6cc] rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                    placeholder="e.g. 9876543210" maxLength={10} />
                            </div>

                            <div className="border-t border-[#e8d6cc] pt-5 space-y-1">
                                <p className="text-xs font-bold text-[#8a7a72] uppercase tracking-wider">Owner Account</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">Owner Name *</label>
                                <input type="text" required value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e8d6cc] rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                    placeholder="Owner's full name" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">Owner Mobile *</label>
                                <input type="text" required maxLength={10} value={form.ownerMobile} onChange={e => setForm({ ...form, ownerMobile: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e8d6cc] rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                    placeholder="10-digit mobile number" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">Owner Email</label>
                                <input type="email" value={form.ownerEmail} onChange={e => setForm({ ...form, ownerEmail: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e8d6cc] rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                    placeholder="owner@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#0A0A0A] mb-1.5">Owner Password *</label>
                                <input type="password" required value={form.ownerPassword} onChange={e => setForm({ ...form, ownerPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e8d6cc] rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                    placeholder="Min 6 characters" />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-[#0A0A0A] text-white rounded-xl font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" /> Create Mess & Owner
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
