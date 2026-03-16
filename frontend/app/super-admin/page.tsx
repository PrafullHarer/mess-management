'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import {
    Building2, Users, Plus, X, LogOut, TrendingUp,
    ChefHat, Shield, Trash2, Edit, Eye, Ban,
    Activity, Database, Server, Cpu, HardDrive,
    Clock, CheckCircle2, XCircle, AlertTriangle,
    RefreshCw, Wifi, MemoryStick, Globe, Key,
    Layers, ArrowUpRight, Gauge
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

interface CollectionStat {
    name: string;
    documentCount: number | string;
    sizeBytes: number;
}

interface SystemHealth {
    status: string;
    timestamp: string;
    database: {
        status: string;
        healthy: boolean;
        host: string;
        name: string;
        pingMs: number | null;
        pingError?: string;
    };
    collections: CollectionStat[];
    totalCollections: number;
    server: {
        uptime: number;
        nodeVersion: string;
        platform: string;
        mongooseVersion: string;
        memory: {
            heapUsed: number;
            heapTotal: number;
            rss: number;
            external: number;
        };
        cpuCount: number;
        totalSystemMemory: number;
        freeSystemMemory: number;
        loadAvg: number[];
    };
    environment: {
        nodeEnv: string;
        hasJwtSecret: boolean;
        hasDatabaseUrl: boolean;
        port: number;
        isVercel: boolean;
    };
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

export default function SuperAdminDashboard() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'messes' | 'health'>('messes');
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

    // System Health state
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [healthLoading, setHealthLoading] = useState(false);
    const [healthError, setHealthError] = useState('');
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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

    const fetchHealth = useCallback(async () => {
        setHealthLoading(true);
        setHealthError('');
        try {
            const res = await API.get('/super-admin/system-health');
            setHealth(res.data);
            setLastRefresh(new Date());
        } catch (err: any) {
            setHealthError(err?.response?.data?.message || 'Failed to fetch system health');
        } finally {
            setHealthLoading(false);
        }
    }, []);

    // Fetch health data when switching to health tab
    useEffect(() => {
        if (activeTab === 'health' && !health && !healthLoading) {
            fetchHealth();
        }
    }, [activeTab, health, healthLoading, fetchHealth]);

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

    const handleDelete = async (messId: string) => {
        if (!confirm('Are you ABSOLUTELY sure you want to delete this mess? ALL attached users, financial logs, and bills will be permanently destroyed and users will no longer be able to log in.')) return;
        try {
            await API.delete(`/super-admin/messes/${messId}`);
            fetchData();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to delete');
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
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-1.5 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('messes')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'messes'
                                ? 'bg-[#0A0A0A] text-white shadow-lg'
                                : 'text-[#8a7a72] hover:text-[#0A0A0A] hover:bg-[#faeee7]'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Mess Management
                    </button>
                    <button
                        onClick={() => setActiveTab('health')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            activeTab === 'health'
                                ? 'bg-[#0A0A0A] text-white shadow-lg'
                                : 'text-[#8a7a72] hover:text-[#0A0A0A] hover:bg-[#faeee7]'
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        System Health
                    </button>
                </div>

                {/* ======================== */}
                {/* TAB: Mess Management     */}
                {/* ======================== */}
                {activeTab === 'messes' && (
                    <>
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
                                            onClick={() => handleDelete(mess.id)}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                        >
                                            <Ban className="w-3.5 h-3.5" /> Permanently Delete
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
                    </>
                )}

                {/* ======================== */}
                {/* TAB: System Health       */}
                {/* ======================== */}
                {activeTab === 'health' && (
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-[#0A0A0A]">System Health</h2>
                                {lastRefresh && (
                                    <p className="text-xs text-[#8a7a72] mt-1">
                                        Last refreshed: {lastRefresh.toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={fetchHealth}
                                disabled={healthLoading}
                                className="flex items-center gap-2 bg-[#0A0A0A] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-neutral-800 disabled:opacity-50 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
                                {healthLoading ? 'Checking...' : 'Refresh'}
                            </button>
                        </div>

                        {healthError && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2">
                                <XCircle className="w-4 h-4 flex-shrink-0" />
                                {healthError}
                            </div>
                        )}

                        {healthLoading && !health && (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="w-10 h-10 border-3 border-[#ff7b9b]/30 border-t-[#ff7b9b] rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-sm text-[#8a7a72] font-medium">Running diagnostics...</p>
                                </div>
                            </div>
                        )}

                        {health && (
                            <div className="space-y-6">
                                {/* Overall Status Banner */}
                                <div className={`rounded-2xl p-6 border flex items-center gap-4 ${
                                    health.status === 'healthy'
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                        health.status === 'healthy' ? 'bg-emerald-100' : 'bg-red-100'
                                    }`}>
                                        {health.status === 'healthy'
                                            ? <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                                            : <XCircle className="w-7 h-7 text-red-600" />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold ${health.status === 'healthy' ? 'text-emerald-800' : 'text-red-800'}`}>
                                            System {health.status === 'healthy' ? 'Healthy' : 'Degraded'}
                                        </h3>
                                        <p className={`text-sm font-medium ${health.status === 'healthy' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            All checks completed at {new Date(health.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2">
                                        <Gauge className={`w-5 h-5 ${health.status === 'healthy' ? 'text-emerald-500' : 'text-red-500'}`} />
                                        <span className={`text-sm font-bold ${health.status === 'healthy' ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {health.database.pingMs !== null ? `${health.database.pingMs}ms` : 'N/A'} DB Latency
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Health Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        {
                                            label: 'Database',
                                            value: health.database.status,
                                            icon: Database,
                                            healthy: health.database.healthy,
                                            detail: health.database.pingMs !== null ? `${health.database.pingMs}ms ping` : 'No ping',
                                        },
                                        {
                                            label: 'Server Uptime',
                                            value: formatUptime(health.server.uptime),
                                            icon: Clock,
                                            healthy: true,
                                            detail: health.server.platform,
                                        },
                                        {
                                            label: 'Memory Usage',
                                            value: formatBytes(health.server.memory.heapUsed),
                                            icon: MemoryStick,
                                            healthy: health.server.memory.heapUsed / health.server.memory.heapTotal < 0.85,
                                            detail: `of ${formatBytes(health.server.memory.heapTotal)}`,
                                        },
                                        {
                                            label: 'Collections',
                                            value: health.totalCollections.toString(),
                                            icon: Layers,
                                            healthy: true,
                                            detail: `${health.collections.reduce((sum, c) => sum + (typeof c.documentCount === 'number' ? c.documentCount : 0), 0)} total docs`,
                                        },
                                    ].map((card, i) => (
                                        <div key={i} className="bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    card.healthy ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <card.icon className="w-5 h-5" />
                                                </div>
                                                <div className={`w-2.5 h-2.5 rounded-full ${card.healthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                            </div>
                                            <p className="text-lg font-bold text-[#0A0A0A] truncate">{card.value}</p>
                                            <p className="text-xs text-[#8a7a72] font-medium mt-0.5">{card.label}</p>
                                            <p className="text-[10px] text-[#8a7a72]/60 font-medium mt-1">{card.detail}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Database Details & Environment */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Database Info */}
                                    <div className="bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-6">
                                        <div className="flex items-center gap-2 mb-5">
                                            <Database className="w-5 h-5 text-[#ff7b9b]" />
                                            <h3 className="text-lg font-bold text-[#0A0A0A]">Database Details</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Status', value: health.database.status, icon: health.database.healthy ? CheckCircle2 : XCircle, color: health.database.healthy ? 'text-emerald-600' : 'text-red-600' },
                                                { label: 'Host', value: health.database.host, icon: Globe, color: 'text-neutral-600' },
                                                { label: 'DB Name', value: health.database.name, icon: Database, color: 'text-neutral-600' },
                                                { label: 'Ping Latency', value: health.database.pingMs !== null ? `${health.database.pingMs}ms` : 'Error', icon: Wifi, color: health.database.pingMs !== null ? 'text-neutral-600' : 'text-red-600' },
                                                { label: 'Mongoose', value: `v${health.server.mongooseVersion}`, icon: Layers, color: 'text-neutral-600' },
                                            ].map((row, i) => (
                                                <div key={i} className="flex items-center justify-between py-2 border-b border-[#e8d6cc]/50 last:border-0">
                                                    <div className="flex items-center gap-2">
                                                        <row.icon className={`w-3.5 h-3.5 ${row.color}`} />
                                                        <span className="text-sm text-[#8a7a72] font-medium">{row.label}</span>
                                                    </div>
                                                    <span className={`text-sm font-semibold ${row.color === 'text-neutral-600' ? 'text-[#0A0A0A]' : row.color}`}>{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Environment Config */}
                                    <div className="bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-6">
                                        <div className="flex items-center gap-2 mb-5">
                                            <Key className="w-5 h-5 text-[#ff7b9b]" />
                                            <h3 className="text-lg font-bold text-[#0A0A0A]">Environment Config</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Node.js', value: health.server.nodeVersion, ok: true },
                                                { label: 'Environment', value: health.environment.nodeEnv.toUpperCase(), ok: true },
                                                { label: 'Port', value: health.environment.port.toString(), ok: true },
                                                { label: 'JWT Secret', value: health.environment.hasJwtSecret ? 'Configured ✓' : 'MISSING ✗', ok: health.environment.hasJwtSecret },
                                                { label: 'Database URL', value: health.environment.hasDatabaseUrl ? 'Configured ✓' : 'MISSING ✗', ok: health.environment.hasDatabaseUrl },
                                                { label: 'Platform', value: health.server.platform, ok: true },
                                                { label: 'Vercel', value: health.environment.isVercel ? 'Yes' : 'No', ok: true },
                                                { label: 'CPU Cores', value: health.server.cpuCount.toString(), ok: true },
                                            ].map((row, i) => (
                                                <div key={i} className="flex items-center justify-between py-2 border-b border-[#e8d6cc]/50 last:border-0">
                                                    <span className="text-sm text-[#8a7a72] font-medium">{row.label}</span>
                                                    <span className={`text-sm font-semibold ${row.ok ? 'text-[#0A0A0A]' : 'text-red-600'}`}>
                                                        {row.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Server Memory */}
                                <div className="bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <Server className="w-5 h-5 text-[#ff7b9b]" />
                                        <h3 className="text-lg font-bold text-[#0A0A0A]">Server Resources</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Heap Used', value: formatBytes(health.server.memory.heapUsed), pct: Math.round((health.server.memory.heapUsed / health.server.memory.heapTotal) * 100) },
                                            { label: 'Heap Total', value: formatBytes(health.server.memory.heapTotal), pct: Math.round((health.server.memory.heapTotal / health.server.totalSystemMemory) * 100) },
                                            { label: 'RSS', value: formatBytes(health.server.memory.rss), pct: Math.round((health.server.memory.rss / health.server.totalSystemMemory) * 100) },
                                            { label: 'System Free', value: formatBytes(health.server.freeSystemMemory), pct: Math.round((health.server.freeSystemMemory / health.server.totalSystemMemory) * 100) },
                                        ].map((mem, i) => (
                                            <div key={i} className="bg-[#faeee7] rounded-xl p-4">
                                                <p className="text-xs text-[#8a7a72] font-bold uppercase tracking-wider mb-2">{mem.label}</p>
                                                <p className="text-xl font-bold text-[#0A0A0A] mb-2">{mem.value}</p>
                                                <div className="w-full h-2 bg-[#e8d6cc] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            mem.pct > 80 ? 'bg-red-500' : mem.pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${Math.min(mem.pct, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-[#8a7a72] mt-1">{mem.pct}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Collection Stats Table */}
                                <div className="bg-[#fff5f0] border border-[#e8d6cc] rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <Layers className="w-5 h-5 text-[#ff7b9b]" />
                                        <h3 className="text-lg font-bold text-[#0A0A0A]">Collection Stats</h3>
                                        <span className="ml-auto text-xs font-semibold text-[#8a7a72] bg-[#faeee7] px-3 py-1 rounded-full">
                                            {health.totalCollections} collections
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-[#e8d6cc]">
                                                    <th className="text-left py-3 px-4 text-xs font-bold text-[#8a7a72] uppercase tracking-wider">Collection</th>
                                                    <th className="text-right py-3 px-4 text-xs font-bold text-[#8a7a72] uppercase tracking-wider">Documents</th>
                                                    <th className="text-right py-3 px-4 text-xs font-bold text-[#8a7a72] uppercase tracking-wider">Size</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {health.collections.map((col, i) => (
                                                    <tr key={i} className="border-b border-[#e8d6cc]/40 hover:bg-[#faeee7] transition-colors">
                                                        <td className="py-3 px-4 font-semibold text-[#0A0A0A] flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-[#ff7b9b]" />
                                                            {col.name}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-medium text-[#0A0A0A]">
                                                            {typeof col.documentCount === 'number' ? col.documentCount.toLocaleString() : col.documentCount}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-medium text-[#8a7a72]">
                                                            {formatBytes(col.sizeBytes)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
