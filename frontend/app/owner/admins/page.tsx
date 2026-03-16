'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';
import { 
    Plus, Trash2, Shield, X, Mail, Phone, Lock, 
    User, MoreVertical, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: 'OWNER' | 'MANAGER';
    createdAt: string;
}

export default function AdminsPage() {
    const { user: currentUser } = useAuth();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { push } = require('next/navigation').useRouter();

    useEffect(() => {
        if (currentUser && currentUser.role === 'MANAGER') {
            push('/owner');
        }
    }, [currentUser, push]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        // role is forced to MANAGER by the backend
    });

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/auth/admins');
            setAdmins(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);
        try {
            await API.post('/auth/register-admin', formData);
            fetchAdmins();
            closeModal();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create administrative user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (id === currentUser?.id) {
            alert("You cannot remove your own administrative access.");
            return;
        }
        if (!confirm('Are you sure you want to remove this admin? This will immediately revoke their access.')) return;
        
        try {
            await API.delete(`/auth/admins/${id}`);
            fetchAdmins();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to remove admin');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
        setFormData({
            name: '',
            email: '',
            mobile: '',
            password: '',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">Administrative Team</h1>
                    <p className="text-neutral-500 text-sm mt-1">Manage users with administrative and management access ({admins.length} total)</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Admin
                </button>
            </div>

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                    <div key={admin.id} className="card relative transition-all hover:border-neutral-400 group">
                        {/* Status / Role Badge */}
                        <div className="flex items-center justify-between mb-4">
                            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                                admin.role === 'OWNER' 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                                {admin.role === 'OWNER' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                {admin.role}
                            </div>
                            {admin.id !== currentUser?.id && (
                                <button 
                                    onClick={() => handleDelete(admin.id)}
                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    title="Deactivate Admin"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            {admin.id === currentUser?.id && (
                                <div className="px-2 py-1 rounded bg-neutral-100 text-[10px] font-bold text-neutral-500">YOU</div>
                            )}
                        </div>

                        {/* User Profile Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-[#ff7b9b] font-bold text-lg">
                                    {admin.name[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-[#0A0A0A] truncate">{admin.name}</h3>
                                    <p className="text-xs text-neutral-500 truncate">Added {new Date(admin.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-neutral-100">
                                <div className="flex items-center gap-3 text-sm text-neutral-600">
                                    <Phone className="w-4 h-4 text-neutral-400" />
                                    <span>{admin.mobile}</span>
                                </div>
                                {admin.email && (
                                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                                        <Mail className="w-4 h-4 text-neutral-400" />
                                        <span className="truncate">{admin.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {admins.length === 0 && (
                <div className="text-center py-20 card bg-neutral-50/50">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p className="text-neutral-500 font-medium font-bold">No administrative users found</p>
                </div>
            )}

            {/* Add Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[#0A0A0A] flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                Create Sub-Admin User
                            </h2>
                            <button onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded-lg">
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-medium flex gap-2">
                                <ShieldAlert className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        placeholder="Admin name"
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Mobile</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <input
                                            placeholder="10-digit number"
                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                            value={formData.mobile}
                                            onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Email Address (Optional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1.5 block">Initial Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="password"
                                        placeholder="Secret password"
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all text-sm font-mono"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full btn-primary py-4 h-auto text-base mt-2 flex items-center justify-center gap-2 group" 
                                disabled={saving}
                            >
                                <Shield className={`w-5 h-5 group-hover:rotate-12 transition-transform ${saving ? 'animate-pulse' : ''}`} />
                                {saving ? 'Registering...' : 'Register Sub-Admin'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
