'use client';
import Link from 'next/link';
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
    CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
                            <UtensilsCrossed className="w-4 h-4 text-[#C8FF00]" />
                        </div>
                        <span className="text-xl font-bold text-[#0A0A0A] tracking-tight">Mess Management</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-semibold text-neutral-600 hover:text-[#0A0A0A] transition-colors">
                            Sign In
                        </Link>
                        <Link href="/login" className="btn-primary flex items-center gap-1.5 py-2 px-4 h-auto text-xs">
                            Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#C8FF00]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-neutral-200 rounded-full text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-8 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-[#C8FF00] animate-pulse" />
                        Digitalized Canteen Operations
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#0A0A0A] tracking-tight mb-6 leading-[1.1]">
                        Modernize Your <span className="text-neutral-400">Mess</span> <br />
                        <span className="relative inline-block">
                            Operations
                            <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#C8FF00]/30 -rotate-1 rounded-full -z-10" />
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        The all-in-one platform for canteen owners to track student attendance, 
                        automated billing, and manage staff operations with ease.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/login" className="w-full sm:w-auto btn-primary text-base py-4 px-8 min-w-[200px] flex items-center justify-center gap-2 group shadow-xl">
                            Administrator Login
                            <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto btn-secondary text-base py-4 px-8 min-w-[200px] flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors">
                            Student Portal
                            <Users className="w-5 h-5 text-neutral-400" />
                        </Link>
                    </div>

                    {/* App Preview Mockup */}
                    <div className="mt-20 relative px-4">
                        <div className="max-w-5xl mx-auto p-4 bg-white border border-neutral-200 rounded-2xl shadow-2xl relative overflow-hidden group">
                           <div className="bg-[#0A0A0A] rounded-xl p-8 text-white text-left">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-[#C8FF00]" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-neutral-400">Revenue Snapshot</span>
                                        </div>
                                        <div className="text-4xl font-black">₹1,42,800</div>
                                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded w-fit">
                                            +12% vs last month
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-neutral-400">Active Students</span>
                                        </div>
                                        <div className="text-4xl font-black">74</div>
                                        <div className="text-xs text-neutral-500 font-bold">24 Active Subscriptions</div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-indigo-400" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-neutral-400">Total Attendance</span>
                                        </div>
                                        <div className="text-4xl font-black">1.2k+</div>
                                        <div className="text-xs text-neutral-500 font-bold">Today's Avg: 41 meals</div>
                                    </div>
                                </div>
                           </div>
                        </div>
                        {/* Floating elements */}
                        <div className="hidden lg:block absolute top-10 -right-10 w-48 p-4 bg-white border border-neutral-100 rounded-xl shadow-lg animate-bounce duration-[3s]">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-bold">Bill Generated</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-100 rounded" />
                        </div>
                        <div className="hidden lg:block absolute -bottom-10 -left-10 w-48 p-4 bg-white border border-neutral-100 rounded-xl shadow-lg ring-4 ring-[#FAFAFA]">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                                <span className="text-[10px] font-bold tracking-tight">Sent to WhatsApp</span>
                            </div>
                            <div className="h-2 w-full bg-neutral-100 rounded" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 bg-white border-y border-neutral-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <p className="text-[#C8FF00] font-black text-xs uppercase tracking-[0.2em] mb-4">Core Ecosystem</p>
                        <h2 className="text-3xl md:text-4xl font-black text-[#0A0A0A] tracking-tighter">Engineered for Reliability</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { 
                                icon: Calendar, 
                                color: 'text-orange-500', 
                                bg: 'bg-orange-50',
                                title: 'Shift Attendance', 
                                desc: 'One-tap marking for Afternoon and Night shifts with 30-day correction window.' 
                            },
                            { 
                                icon: CreditCard, 
                                color: 'text-indigo-500', 
                                bg: 'bg-indigo-50',
                                title: 'Smart Billing', 
                                desc: 'Attendance-based math that automatically calculates free holidays and rebates.' 
                            },
                            { 
                                icon: MessageSquare, 
                                color: 'text-emerald-500', 
                                bg: 'bg-emerald-50',
                                title: 'Direct Reminders', 
                                desc: 'Send bill details and payment links directly to student WhatsApp in seconds.' 
                            },
                            { 
                                icon: Laptop, 
                                color: 'text-blue-500', 
                                bg: 'bg-blue-50',
                                title: 'Responsive UI', 
                                desc: 'Fully optimized for mobile management. Manage your mess on the go.' 
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl border border-neutral-100 hover:border-neutral-300 transition-all hover:shadow-xl group">
                                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-lg font-bold text-[#0A0A0A] mb-3">{feature.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats / Proof */}
            <section className="py-24 px-6 relative overflow-hidden bg-[#0A0A0A] text-white">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
                    <div>
                        <div className="text-5xl font-black mb-2 tracking-tighter">74+</div>
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Active Students</div>
                    </div>
                    <div>
                        <div className="text-5xl font-black mb-2 tracking-tighter">₹1.4M+</div>
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Revenue Tracked</div>
                    </div>
                    <div>
                        <div className="text-5xl font-black mb-2 tracking-tighter">4.3</div>
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Avg Holidays</div>
                    </div>
                    <div>
                        <div className="text-5xl font-black mb-2 tracking-tighter">100%</div>
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Transparency</div>
                    </div>
                </div>
                {/* Background Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/5 whitespace-nowrap select-none pointer-events-none">
                    CANTEEN SOFT
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto py-12 px-6 border-t border-neutral-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
                                <UtensilsCrossed className="w-4 h-4 text-[#C8FF00]" />
                            </div>
                            <span className="text-lg font-bold text-[#0A0A0A] tracking-tight text-center md:text-left">
                                Mess-Canteen-Mangement-Software
                            </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">© 2024 Built for modern mess owners. All rights reserved.</p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <Link href="/login" className="text-xs font-bold text-neutral-500 hover:text-[#0A0A0A] uppercase tracking-widest transition-colors">Owner Dashboard</Link>
                        <Link href="/login" className="text-xs font-bold text-neutral-500 hover:text-[#0A0A0A] uppercase tracking-widest transition-colors">Student Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
