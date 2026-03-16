'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    UtensilsCrossed,
    ArrowRight,
    ShieldCheck,
    TrendingUp,
    Calendar,
    CreditCard,
    Users,
    Laptop,
    MessageSquare,
    CheckCircle2,
    Zap,
    BarChart3,
    Clock,
    Sparkles,
    ChevronRight,
    ArrowUpRight,
    IndianRupee,
    Bell,
    FileText,
} from 'lucide-react';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [stats, setStats] = useState({
        activeStudents: "74+",
        revenueTracked: "₹1.4L+",
        billsGenerated: "1.2k+",
        transparency: "100%"
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/public/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch live stats", error);
            }
        };
        fetchStats();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#faeee7] flex flex-col font-sans">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-neutral-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-[#0A0A0A] rounded-xl flex items-center justify-center shadow-lg">
                            <UtensilsCrossed className="w-4 h-4 text-[#ff7b9b]" />
                        </div>
                        <span className="text-xl font-bold text-[#0A0A0A] tracking-tight">Mess Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-neutral-600 hover:text-[#0A0A0A] transition-colors px-3 py-2">
                            Sign In
                        </Link>
                        <Link href="/login" className="btn-primary flex items-center gap-1.5 py-2.5 px-5 h-auto text-xs rounded-xl shadow-lg shadow-neutral-900/10 hover:shadow-xl hover:shadow-neutral-900/15 transition-all">
                            Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Dark Theme */}
            <section className="relative overflow-hidden bg-[#0A0A0A] pt-16">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#ff7b9b]/8 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff7b9b]/3 rounded-full blur-[150px]" />
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
                    <div className="text-center">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-neutral-400 mb-10 backdrop-blur-sm">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7b9b] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff7b9b]" />
                            </div>
                            Trusted by Mess Owners Across India
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 leading-[1.05]">
                            Your Mess,{' '}
                            <br className="hidden md:block" />
                            <span className="relative">
                                <span className="bg-gradient-to-r from-[#ff7b9b] via-[#ff9bb5] to-[#ffb8cc] bg-clip-text text-transparent">
                                    Simplified
                                </span>
                                <Sparkles className="absolute -top-4 -right-8 w-6 h-6 text-[#ff7b9b]/60 animate-pulse" />
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            The complete platform for canteen owners — track attendance, automate billing,
                            manage staff, and send WhatsApp reminders. All in one place.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Link href="/login" className="w-full sm:w-auto bg-[#ff7b9b] hover:bg-[#ff6b8e] text-white text-base py-4 px-8 min-w-[220px] rounded-2xl font-bold flex items-center justify-center gap-2.5 group shadow-xl shadow-[#ff7b9b]/20 hover:shadow-2xl hover:shadow-[#ff7b9b]/30 transition-all hover:-translate-y-0.5">
                                Start Managing
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 text-base py-4 px-8 min-w-[220px] rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all backdrop-blur-sm">
                                <Users className="w-5 h-5 text-neutral-400" />
                                Student Portal
                            </Link>
                        </div>

                        {/* Dashboard Preview Card */}
                        <div className="max-w-5xl mx-auto relative">
                            {/* Glow behind card */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#ff7b9b]/20 via-transparent to-indigo-500/10 rounded-3xl blur-2xl" />

                            <div className="relative p-1 bg-gradient-to-b from-white/15 to-white/5 rounded-2xl">
                                <div className="bg-[#111111] rounded-xl overflow-hidden">
                                    {/* Fake browser chrome */}
                                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                                        </div>
                                        <div className="flex-1 flex justify-center">
                                            <div className="px-4 py-1 bg-white/5 rounded-lg text-[10px] text-neutral-500 font-medium">
                                                mess-management.app/dashboard
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dashboard content */}
                                    <div className="p-6 md:p-8">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                            {[
                                                { label: 'Total Revenue', value: '₹1,42,800', icon: TrendingUp, color: 'text-[#ff7b9b]', bg: 'bg-[#ff7b9b]/10', change: '+12%' },
                                                { label: 'Active Students', value: '74', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', change: '+5' },
                                                { label: 'Pending Bills', value: '₹23,400', icon: IndianRupee, color: 'text-amber-400', bg: 'bg-amber-400/10', change: '12 left' },
                                                { label: 'Today\'s Meals', value: '41', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10', change: 'Afternoon' },
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 md:p-5 hover:bg-white/[0.06] transition-colors group">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2 py-0.5 rounded-md">{stat.change}</span>
                                                    </div>
                                                    <div className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
                                                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating notification cards */}
                            <div className="hidden lg:block absolute -top-6 -right-12 animate-[float_6s_ease-in-out_infinite]">
                                <div className="p-4 bg-white rounded-xl shadow-2xl border border-neutral-100 w-52">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-[#0A0A0A]">Bill Generated</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 font-medium">March bills sent to 74 students</p>
                                </div>
                            </div>
                            <div className="hidden lg:block absolute -bottom-6 -left-12 animate-[float_6s_ease-in-out_infinite_2s]">
                                <div className="p-4 bg-white rounded-xl shadow-2xl border border-neutral-100 w-52">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-[#25D366]" />
                                        <span className="text-xs font-bold text-[#0A0A0A]">WhatsApp Sent</span>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 font-medium">Payment reminder delivered ✓</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curve transition */}
                <div className="relative h-16 md:h-24">
                    <svg viewBox="0 0 1440 96" fill="none" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M0 96L1440 96L1440 0C1440 0 1080 96 720 96C360 96 0 0 0 0L0 96Z" fill="#faeee7" />
                    </svg>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ff7b9b]/10 rounded-full text-xs font-bold text-[#ff7b9b] uppercase tracking-widest mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            How It Works
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A0A0A] tracking-tight mb-4">
                            Three steps to{' '}
                            <span className="bg-gradient-to-r from-[#ff7b9b] to-[#ff9bb5] bg-clip-text text-transparent">
                                effortless
                            </span>{' '}
                            management
                        </h2>
                        <p className="text-neutral-500 text-lg font-medium max-w-xl mx-auto">
                            Set up once, run forever. No technical knowledge required.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector line (desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-[#ff7b9b]/20 via-[#ff7b9b]/40 to-[#ff7b9b]/20" />

                        {[
                            {
                                step: '01',
                                icon: Users,
                                title: 'Register Students',
                                desc: 'Add students with their plan, diet, and meal slot. Set pricing and start tracking immediately.',
                                color: 'from-orange-500 to-red-500',
                            },
                            {
                                step: '02',
                                icon: Calendar,
                                title: 'Mark Attendance',
                                desc: 'One-tap daily attendance for Afternoon and Night shifts. 30-day correction window included.',
                                color: 'from-indigo-500 to-blue-500',
                            },
                            {
                                step: '03',
                                icon: CreditCard,
                                title: 'Generate & Send Bills',
                                desc: 'Automated billing with rebates. Send via WhatsApp with UPI payment links in one click.',
                                color: 'from-emerald-500 to-teal-500',
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="relative group">
                                <div className="bg-white rounded-2xl p-8 border border-neutral-100 hover:border-neutral-200 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300 h-full">
                                    {/* Step Number Circle */}
                                    <div className={`w-[72px] h-[72px] rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform`}>
                                        <item.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-xs font-black text-neutral-300 uppercase tracking-[0.2em] mb-3">
                                        Step {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 tracking-tight">{item.title}</h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid - Bento Style */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0A] rounded-full text-xs font-bold text-white uppercase tracking-widest mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-[#ff7b9b]" />
                            Feature Set
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#0A0A0A] tracking-tight mb-4">
                            Everything you need,
                            <br />nothing you don&apos;t
                        </h2>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Feature 1 - Smart Billing (Large) */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-[#0A0A0A] to-[#1a1a1a] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7b9b]/10 rounded-full blur-[80px] group-hover:bg-[#ff7b9b]/15 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-[#ff7b9b]/10 rounded-xl flex items-center justify-center mb-6">
                                    <CreditCard className="w-6 h-6 text-[#ff7b9b]" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 tracking-tight">Smart Billing Engine</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed font-medium max-w-md mb-8">
                                    Automated calculation based on attendance, plans, and holidays. Rebates computed instantly.
                                    Generate bills for all students in one click.
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Auto Rebates', 'PDF Export', 'UPI Links'].map((tag) => (
                                        <div key={tag} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center">
                                            <span className="text-xs font-semibold text-neutral-300">{tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 - WhatsApp */}
                        <div className="bg-[#dcf8c6] rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#25D366]/10 rounded-full blur-2xl" />
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-[#25D366]/15 rounded-xl flex items-center justify-center mb-6">
                                    <MessageSquare className="w-6 h-6 text-[#25D366]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 tracking-tight">WhatsApp Integration</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed font-medium">
                                    Send bill summaries and payment reminders directly to students via WhatsApp. One click, instant delivery.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 - Attendance */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <Calendar className="w-6 h-6 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 tracking-tight">Shift Attendance</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed font-medium">
                                    One-tap marking for Afternoon and Night shifts. 30-day correction window. Never lose track again.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 - Staff Management */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 tracking-tight">Admin & Staff</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed font-medium">
                                    Multi-admin support with Owner and Manager roles. Track staff salaries and expenses seamlessly.
                                </p>
                            </div>
                        </div>

                        {/* Feature 5 - Daily Entries & Side Income (Wide) */}
                        <div className="lg:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <BarChart3 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0A0A0A] mb-3 tracking-tight">Daily Tracking</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed font-medium">
                                    Log daily cash & online collections. Track side income from guest meals, extra orders, and more.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Band */}
            <section className="py-20 px-6 relative overflow-hidden bg-[#0A0A0A]">
                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {[
                            { value: stats.activeStudents, label: 'Active Students', icon: Users },
                            { value: stats.revenueTracked, label: 'Revenue Tracked', icon: TrendingUp },
                            { value: stats.billsGenerated, label: 'Bills Generated', icon: FileText },
                            { value: stats.transparency, label: 'Transparency', icon: ShieldCheck },
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-12 h-12 mx-auto mb-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#ff7b9b]/10 group-hover:border-[#ff7b9b]/20 transition-all">
                                    <stat.icon className="w-5 h-5 text-neutral-500 group-hover:text-[#ff7b9b] transition-colors" />
                                </div>
                                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white rounded-3xl p-12 md:p-16 border border-neutral-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7b9b]/5 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#0A0A0A] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                                <UtensilsCrossed className="w-7 h-7 text-[#ff7b9b]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0A0A] tracking-tight mb-4">
                                Ready to simplify your mess?
                            </h2>
                            <p className="text-neutral-500 text-lg font-medium mb-10 max-w-lg mx-auto">
                                Join the growing community of mess owners who have digitalized their operations.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/login" className="w-full sm:w-auto bg-[#0A0A0A] hover:bg-neutral-800 text-white text-base py-4 px-8 min-w-[200px] rounded-2xl font-bold flex items-center justify-center gap-2 group shadow-xl transition-all hover:-translate-y-0.5">
                                    Get Started Now
                                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Link>
                                <Link href="/login" className="w-full sm:w-auto btn-secondary text-base py-4 px-8 min-w-[200px] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                                    Student Login
                                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-16 px-6 border-t border-neutral-200 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                        {/* Branding */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-[#0A0A0A] rounded-xl flex items-center justify-center">
                                    <UtensilsCrossed className="w-4 h-4 text-[#ff7b9b]" />
                                </div>
                                <span className="text-lg font-bold text-[#0A0A0A] tracking-tight">
                                    Mess Management
                                </span>
                            </div>
                            <p className="text-sm text-neutral-500 font-medium leading-relaxed text-center md:text-left max-w-xs">
                                The all-in-one platform for canteen owners to digitalize their mess operations.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <h4 className="text-xs font-black text-[#0A0A0A] uppercase tracking-[0.15em]">Quick Links</h4>
                            <div className="flex flex-col items-center md:items-start gap-3">
                                <Link href="/login" className="text-sm font-medium text-neutral-500 hover:text-[#0A0A0A] transition-colors flex items-center gap-2 group">
                                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#ff7b9b] transition-colors" />
                                    Owner Dashboard
                                </Link>
                                <Link href="/login" className="text-sm font-medium text-neutral-500 hover:text-[#0A0A0A] transition-colors flex items-center gap-2 group">
                                    <Users className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#ff7b9b] transition-colors" />
                                    Student Portal
                                </Link>
                            </div>
                        </div>

                        {/* Authors */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <h4 className="text-xs font-black text-[#0A0A0A] uppercase tracking-[0.15em]">Built By</h4>
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <span className="text-sm font-semibold text-neutral-700">Aadityaa Sharma</span>
                                <span className="text-sm font-semibold text-neutral-700">Prafull Harer</span>
                            </div>
                            <p className="text-xs text-neutral-400 font-medium mt-1">
                                Made with <span className="text-[#ff7b9b]">❤️</span> for mess owners & students
                            </p>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-neutral-400 font-medium">
                            © 2026 Mess Management Software. All rights reserved.
                        </p>
                        <p className="text-xs text-neutral-400 font-medium">
                            v1.2.0
                        </p>
                    </div>
                </div>
            </footer>

            {/* Footer closing and page end */}
        </div>
    );
}
