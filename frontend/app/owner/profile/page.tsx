'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import API from '@/lib/api';
import { User, Lock, Mail, Phone, Save, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateUserInfo } = useAuth();
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                //@ts-ignore
                email: user.email || '',
                mobile: user.mobile || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const { data } = await API.put('/auth/profile', {
                name: profileData.name,
                email: profileData.email,
                mobile: profileData.mobile
            });
            setStatus({ type: 'success', message: 'Profile updated successfully' });
            updateUserInfo(data);
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            await API.put('/auth/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setStatus({ type: 'success', message: 'Password updated successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Account Settings</h1>
                <p className="text-neutral-500 mt-1">Manage your administrator profile and security preferences.</p>
            </div>

            {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{status.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Section */}
                <div className="card space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
                        <User className="w-5 h-5 text-neutral-400" />
                        <h2 className="text-lg font-bold text-[#0A0A0A]">Profile Information</h2>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Display Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#0A0A0A] transition-colors" />
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm font-medium"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#0A0A0A] transition-colors" />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm font-medium"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Mobile Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#0A0A0A] transition-colors" />
                                <input
                                    type="tel"
                                    value={profileData.mobile}
                                    onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm font-medium"
                                    placeholder="10-digit mobile"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 group py-4 h-auto text-base"
                        >
                            <Save className={`w-5 h-5 group-hover:scale-110 transition-transform ${loading ? 'animate-pulse' : ''}`} />
                            {loading ? 'Saving Changes...' : 'Save Profile'}
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="card space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-neutral-100">
                        <Lock className="w-5 h-5 text-neutral-400" />
                        <h2 className="text-lg font-bold text-[#0A0A0A]">Security / Password</h2>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Current Password</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#0A0A0A] transition-colors" />
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all text-sm font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#0A0A0A] transition-colors" />
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm font-medium"
                                    placeholder="Min. 6 characters"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#0A0A0A] transition-colors" />
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-[#ff7b9b] focus:border-[#ff7b9b] outline-none transition-all text-sm font-medium"
                                    placeholder="Repeat new password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${
                                loading ? 'bg-neutral-100 text-neutral-400' : 'bg-[#0A0A0A] text-white hover:bg-neutral-800 active:scale-[0.98]'
                            }`}
                        >
                            <Lock className="w-4 h-4" />
                            {loading ? 'Processing...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Account Info Footer */}
            <div className="card bg-neutral-50 border-neutral-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-[#0A0A0A]">Administrative Access</h3>
                        <p className="text-xs text-neutral-500 mt-1">Role: <span className="font-semibold text-neutral-900">{user?.role}</span> • Account ID: {user?.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
