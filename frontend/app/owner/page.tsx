'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import {
    Users, CreditCard, IndianRupee, TrendingUp, FileText,
    ArrowRight, Receipt, PieChart, Calendar, BarChart3, Utensils, DollarSign
} from 'lucide-react';

interface Stats {
    students: number;
    staff: number;
    revenue: number;
    billRevenue?: number;
    sideIncome?: number;
    pending: number;
    expense: number;
    netIncome: number;
}

interface MonthlyStats {
    month: string;
    year: number;
    revenue: number;
    pending: number;
    totalBills: number;
}

interface CurrentMonthExpense {
    fixed: number;
    operational: number;
    total: number;
    month: string;
    year: number;
}

interface Insights {
    totalStudents: number;
    totalAmount: number;
    totalPaid: number;
    subscriptionsCollected: number;
    subscriptionsPending: number;
    collectionRate: number;
    avgRevenuePerStudent: number;
    newThisMonth: number;
    newLastMonth: number;
    retentionRate: number;
    planPopularity: [string, number][];
    vegCount: number;
    nonVegCount: number;
    avgHolidays: string;
    dailyTrend: { date: string; total: number }[];
    busiestSlot: [string, number] | null;
    statusCounts: {
        active: number;
        endingSoon: number;
        duesPending: number;
        messOver: number;
        unusualPlan: number;
        noDate: number;
    };
    boysCount: number;
    girlsCount: number;
}

export default function OwnerDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
    const [currentMonthExpense, setCurrentMonthExpense] = useState<CurrentMonthExpense | null>(null);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await API.get('/dashboard');
                setStats(data.stats);
                setMonthlyStats(data.monthlyStats || []);
                setCurrentMonthExpense(data.currentMonthExpense || null);
                setInsights(data.insights || null);
                setError(false);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-neutral-500 mb-4">Failed to load dashboard data</p>
                <button onClick={() => window.location.reload()} className="btn-secondary">
                    Retry
                </button>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Revenue', value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: IndianRupee },
        { label: 'Total Expense', value: `₹${(stats?.expense || 0).toLocaleString()}`, icon: CreditCard },
        { label: 'Net Profit', value: `₹${(stats?.netIncome || 0).toLocaleString()}`, icon: TrendingUp, accent: true },
        { label: 'Side Income', value: `₹${(stats?.sideIncome || 0).toLocaleString()}`, icon: DollarSign },
    ];

    const sc = insights?.statusCounts;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm font-medium text-neutral-500 mb-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Dashboard</h1>
                </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`card group transition-all duration-150 ${stat.accent ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : ''}`}
                    >
                        <div className={`flex items-center gap-2 mb-4 ${stat.accent ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            <stat.icon className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <p className={`text-3xl font-bold tracking-tight ${stat.accent ? 'text-[#C8FF00]' : ''}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Membership Overview - Requested Section */}
            {insights && (
                <div className="card-no-padding overflow-hidden border-none bg-transparent">
                    <div className="flex items-center gap-2 mb-6 ml-1">
                        <Users className="w-5 h-5 text-[#0A0A0A]" />
                        <h2 className="text-xl font-bold text-[#0A0A0A]">Membership Overview</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Column 1: Core Totals */}
                        <div className="space-y-4">
                            <div className="card bg-neutral-50 border-neutral-200">
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Total Students</p>
                                <p className="text-3xl font-bold text-[#0A0A0A]">{insights.totalStudents}</p>
                            </div>
                            <div className="card bg-emerald-50 border-emerald-100">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Subscriptions Collected</p>
                                <p className="text-3xl font-bold text-emerald-700">₹{insights.subscriptionsCollected?.toLocaleString()}</p>
                            </div>
                            <div className="card bg-amber-50 border-amber-100">
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Subscriptions Pending</p>
                                <p className="text-3xl font-bold text-amber-700">₹{insights.subscriptionsPending?.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Column 2: Status Breakdowns */}
                        <div className="space-y-4">
                            <div className="card bg-[#0A0A0A] text-white border-[#0A0A0A]">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Active</p>
                                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                </div>
                                <p className="text-3xl font-bold text-[#C8FF00] mt-1">{insights.statusCounts.active}</p>
                            </div>
                            <div className="card bg-orange-50 border-orange-100">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Ending Soon</p>
                                    <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                                </div>
                                <p className="text-3xl font-bold text-orange-700 mt-1">{insights.statusCounts.endingSoon}</p>
                            </div>
                            <div className="card bg-red-50 border-red-100">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Dues Pending</p>
                                    <span className="h-2 w-2 rounded-full bg-red-400"></span>
                                </div>
                                <p className="text-3xl font-bold text-red-700 mt-1">{insights.statusCounts.duesPending}</p>
                            </div>
                        </div>

                        {/* Column 3: Quick Info Card */}
                        <div className="card flex flex-col justify-center items-center text-center bg-neutral-900 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <TrendingUp className="w-32 h-32" />
                            </div>
                            <p className="text-sm font-medium text-neutral-400 relative z-10 mb-2">💰 Collection Rate</p>
                            <p className="text-5xl font-black text-[#C8FF00] relative z-10">{insights.collectionRate}%</p>
                            <p className="text-xs text-neutral-500 mt-4 relative z-10 max-w-[200px]">
                                Your mess is currently running at a {insights.collectionRate}% revenue collection efficiency this cycle.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Business Insights Row ===== */}
            {insights && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* New This Month */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3 text-neutral-500">
                            <span className="text-sm">🆕</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">New This Month</span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
                            {insights.newThisMonth}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                            vs {insights.newLastMonth} last month
                        </p>
                    </div>

                    {/* Retention Rate */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3 text-neutral-500">
                            <span className="text-sm">🔄</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">Retention Rate</span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-blue-600">
                            {insights.retentionRate}%
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">Plan renewals</p>
                    </div>

                    {/* Avg Revenue */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3 text-neutral-500">
                            <span className="text-sm">📈</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">Avg Revenue</span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
                            ₹{insights.avgRevenuePerStudent?.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">per student</p>
                    </div>

                    {/* Avg Holidays */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3 text-neutral-500">
                            <span className="text-sm">🏖️</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">Avg Holidays</span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-orange-600">
                            {insights.avgHolidays}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">days per student</p>
                    </div>

                    {/* Busiest Slot */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3 text-neutral-500">
                            <span className="text-sm">🍽️</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">Busiest Slot</span>
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
                            {insights.busiestSlot ? insights.busiestSlot[0] : 'None'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                            {insights.busiestSlot ? `${insights.busiestSlot[1]} Students` : '0 Students'}
                        </p>
                    </div>

                    {/* Diet Split */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3 text-neutral-500">
                            <span className="text-sm">🥗</span>
                            <span className="text-xs font-semibold uppercase tracking-wider">Diet Split</span>
                        </div>
                        <div className="flex items-end gap-4 mt-1">
                            <div>
                                <p className="text-2xl font-bold text-emerald-600">{insights.vegCount}</p>
                                <p className="text-xs text-neutral-500 font-medium">Veg</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{insights.nonVegCount}</p>
                                <p className="text-xs text-neutral-500 font-medium">Non Veg</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Status Distribution + Plan Popularity ===== */}
            {insights && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Distribution */}
                    {sc && (
                        <div className="card">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Student Status</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Active', count: sc.active, color: 'bg-emerald-500', dot: '🟢' },
                                    { label: 'Ending Soon', count: sc.endingSoon, color: 'bg-orange-500', dot: '🟠' },
                                    { label: 'Dues Pending', count: sc.duesPending, color: 'bg-amber-500', dot: '🟡' },
                                    { label: 'Mess Over', count: sc.messOver, color: 'bg-red-500', dot: '🔴' },
                                    { label: 'Unusual Plan', count: sc.unusualPlan, color: 'bg-purple-500', dot: '🟣' },
                                ].filter(s => s.count > 0).map(s => {
                                    const total = insights.totalStudents || 1;
                                    const pct = Math.round((s.count / total) * 100);
                                    return (
                                        <div key={s.label}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium">{s.dot} {s.label}</span>
                                                <span className="text-neutral-500">{s.count} ({pct}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="flex gap-4 pt-2 border-t border-neutral-100 text-sm">
                                    <span className="text-neutral-500">👦 Boys: <strong className="text-[#0A0A0A]">{insights.boysCount}</strong></span>
                                    <span className="text-neutral-500">👧 Girls: <strong className="text-[#0A0A0A]">{insights.girlsCount}</strong></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Plan Popularity */}
                    {insights.planPopularity && insights.planPopularity.length > 0 && (
                        <div className="card">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm">📋</span>
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Plan Popularity</h2>
                            </div>
                            <div className="space-y-3">
                                {insights.planPopularity.map(([plan, count], idx) => {
                                    const total = insights.totalStudents || 1;
                                    const pct = Math.round((count / total) * 100);
                                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500'];
                                    return (
                                        <div key={plan}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-neutral-900">
                                                    <span className="text-neutral-400 mr-2">{idx + 1}.</span>
                                                    {plan}
                                                </span>
                                                <span className="text-neutral-500 font-medium">{count} ({pct}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${colors[idx % colors.length]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {insights.busiestSlot && (
                                    <div className="pt-2 border-t border-neutral-100 text-sm text-neutral-500">
                                        Busiest: <strong className="text-[#0A0A0A]">{insights.busiestSlot[0]}</strong> ({insights.busiestSlot[1]} students)
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===== Daily Trend + Monthly Breakdown ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Stats Table */}
                <div className="lg:col-span-2 card">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Monthly Breakdown</h2>
                    {monthlyStats.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100">
                                        <th className="text-left py-3 font-semibold text-neutral-500">Month</th>
                                        <th className="text-right py-3 font-semibold text-neutral-500">Revenue</th>
                                        <th className="text-right py-3 font-semibold text-neutral-500">Pending</th>
                                        <th className="text-right py-3 font-semibold text-neutral-500">Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyStats.map((m, idx) => (
                                        <tr key={idx} className="border-b border-neutral-50 last:border-0">
                                            <td className="py-3 font-medium text-[#0A0A0A]">
                                                {m.month} {m.year}
                                            </td>
                                            <td className="py-3 text-right text-[#0A0A0A] font-semibold">
                                                ₹{m.revenue.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right text-amber-600 font-medium">
                                                ₹{m.pending.toLocaleString()}
                                            </td>
                                            <td className={`py-3 text-right font-bold ${(m.revenue - m.pending) >= 0 ? 'text-[#0A0A0A]' : 'text-red-500'}`}>
                                                ₹{m.revenue.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-neutral-400">
                            No billing data yet. Generate bills to see monthly breakdown.
                        </div>
                    )}
                </div>

                {/* Current Month Expense + Quick Actions */}
                <div className="space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1">
                        {currentMonthExpense?.month || new Date().toLocaleString('default', { month: 'long' })} {currentMonthExpense?.year || new Date().getFullYear()} Expenses
                    </h2>

                    <div className="card bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
                        <div className="flex items-center gap-2 mb-4 text-red-600">
                            <Receipt className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Expense</span>
                        </div>
                        <p className="text-3xl font-bold tracking-tight text-red-600 mb-4">
                            ₹{(currentMonthExpense?.total || 0).toLocaleString()}
                        </p>

                        <div className="space-y-2 pt-3 border-t border-red-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-600">Fixed (Rent/Salaries)</span>
                                <span className="font-semibold text-neutral-900">
                                    ₹{(currentMonthExpense?.fixed || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-600">Monthly Variable</span>
                                <span className="font-semibold text-neutral-900">
                                    ₹{(currentMonthExpense?.operational || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <a
                            href="/owner/staff"
                            className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-white/80 border border-red-200 text-sm font-medium text-red-700 hover:bg-white transition-colors"
                        >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Daily Trend */}
                    {insights?.dailyTrend && insights.dailyTrend.length > 0 && (
                        <>
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1 pt-3">Daily Collection</h2>
                            <div className="card">
                                <div className="space-y-2">
                                    {insights.dailyTrend.map((d) => (
                                        <div key={d.date} className="flex items-center justify-between text-sm">
                                            <span className="text-neutral-500 font-mono text-xs">{d.date}</span>
                                            <span className="font-semibold">₹{d.total.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Quick Actions */}
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-1 pt-4">Quick Actions</h2>

                    <a
                        href="/owner/bills"
                        className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 bg-white hover:border-[#0A0A0A] transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900" />
                            <span className="text-sm font-medium">Generate Bills</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all" />
                    </a>

                    <a
                        href="/owner/students"
                        className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 bg-white hover:border-[#0A0A0A] transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900" />
                            <span className="text-sm font-medium">Add Student</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all" />
                    </a>
                </div>
            </div>
        </div>
    );
}
