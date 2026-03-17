'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, CheckCircle, AlertCircle, Download, CalendarRange, Clock, Coffee, LogOut, ArrowRight, IndianRupee, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AbsentRecord {
    date: string;
    shift: string;
}

interface BillBreakdown {
    meals_absent?: number;
    meals_present?: number;
    attendance_days?: number;
    absent_dates?: (string | AbsentRecord)[];
    joined_at?: string;
    end_date?: string;
}

interface Bill {
    id: string;
    student_id: string;
    month: string;
    year: number;
    amount: string;
    status: 'PAID' | 'PENDING';
    generatedAt: string;
    upiId?: string;
    payeeName?: string;
    breakdown?: BillBreakdown;
}

export default function StudentDashboard() {
    const { user, logout, loading: authLoading, updateUserInfo } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasFetched, setHasFetched] = useState(false);
    const router = useRouter();

    const fetchDashboardData = async () => {
        try {
            const [billsRes, meRes] = await Promise.all([
                API.get('/bills'),
                API.get('/auth/me')
            ]);
            setBills(billsRes.data);
            if (meRes.data && updateUserInfo) {
                updateUserInfo(meRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !hasFetched) {
            if (!user || user.role !== 'STUDENT') {
                router.push('/login');
            } else {
                fetchDashboardData();
                setHasFetched(true);
            }
        }
    }, [user, router, authLoading, hasFetched]);

    const handlePay = (bill: Bill) => {
        const upiId = bill.upiId || "prafullharer@slc";
        const payeeName = bill.payeeName || "Prafull Harer";
        const amount = parseFloat(bill.amount);

        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Mess-Bill-${bill.month}-${bill.year}`;
        window.location.href = upiLink;
    };

    const pendingBills = bills.filter(b => b.status?.toUpperCase() === 'PENDING');
    const historyBills = bills.filter(b => b.status?.toUpperCase() === 'PAID');
    const totalPending = pendingBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

    const handlePayAll = () => {
        const firstBill = pendingBills[0];
        const upiId = firstBill?.upiId || "prafullharer@slc";
        const payeeName = firstBill?.payeeName || "Prafull Harer";

        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${totalPending}&cu=INR&tn=Mess-All-Dues`;
        window.location.href = upiLink;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr === 'N/A') return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                 const [year, month, day] = dateStr.split('-');
                 return `${day}/${month}/${year}`;
            }
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const handleDownload = async (billId: string, month: string, year: number) => {
        try {
            const idToDownload = billId.replace('-pending', '').replace('-paid', '');
            const response = await API.get(`/bills/${idToDownload}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bill_${month}_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download bill. Please try again.');
        }
    };

    const upcomingHolidays = user?.studentHolidays?.filter(d => new Date(d) >= new Date(new Date().setHours(0,0,0,0))) || [];
    
    // Dynamic fallback fetching from DB generated bills if server cache hasn't updated yet
    const joinedAtStr = user?.joinedAt || bills[0]?.breakdown?.joined_at || 'N/A';
    const endDateStr = user?.messEndDate || user?.endDate || bills[0]?.breakdown?.end_date || 'N/A';
    const statusStyle = user?.computedStatus || { label: 'Active', dot: '🟢', color: '#16a34a' };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#faeee7] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user || user.role !== 'STUDENT') return null;

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
                    
                    {/* Welcome Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-neutral-500 mb-1">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A] flex items-center gap-3">
                                My Dashboard
                                {user?.computedStatus && (
                                    <span style={{ color: statusStyle.color }} className="text-sm px-2.5 py-1 rounded-lg border bg-white shadow-sm font-semibold flex items-center gap-1.5">
                                        {statusStyle.dot} {statusStyle.label}
                                    </span>
                                )}
                            </h1>
                        </div>
                    </div>

                    {/* Primary Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Start Date Card */}
                        <div className="card transition-all duration-150 bg-emerald-50 border-emerald-100">
                            <div className="flex items-center gap-2 mb-4 text-emerald-600">
                                <CalendarRange className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Joined On</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
                                {formatDate(joinedAtStr)}
                            </p>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Cycle start date</p>
                        </div>

                        {/* End Date Card */}
                        <div className="card transition-all duration-150 bg-orange-50 border-orange-100">
                            <div className="flex items-center gap-2 mb-4 text-orange-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Valid Until</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
                                {formatDate(endDateStr)}
                            </p>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Cycle end date</p>
                        </div>
                        
                        {/* Remaining Meals Card */}
                        <div className="card transition-all duration-150 bg-pink-50 border-pink-100">
                            <div className="flex items-center gap-2 mb-4 text-pink-600">
                                <Coffee className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Remaining Meals</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
                                {user?.remainingMeals ?? 'N/A'} <span className="text-lg text-neutral-500 font-medium tracking-normal">/ {user?.totalMeals ?? 'N/A'}</span>
                            </p>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Meals left in cycle</p>
                        </div>

                        {/* Total Amount Card */}
                        <div className="card transition-all duration-150 bg-blue-50 border-blue-100">
                            <div className="flex items-center gap-2 mb-4 text-blue-600">
                                <IndianRupee className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Total Fee</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
                                ₹{(user?.amount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Total cycle fee</p>
                        </div>

                        {/* Paid Amount Card */}
                        <div className="card transition-all duration-150 bg-purple-50 border-purple-100">
                            <div className="flex items-center gap-2 mb-4 text-purple-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Paid Amount</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
                                ₹{(user?.paid || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-neutral-500 mt-2 font-medium">Amount paid so far</p>
                        </div>

                        {/* Total Pending Dues Card */}
                        <div className="card transition-all duration-150 bg-[#0A0A0A] text-white border-[#0A0A0A]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Pending Dues</span>
                                </div>
                                {pendingBills.length > 0 && (
                                    <span className="bg-[#ff7b9b]/20 text-[#ff7b9b] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Due Now</span>
                                )}
                            </div>
                            <p className="text-3xl font-bold tracking-tight text-[#ff7b9b]">
                                ₹{totalPending.toLocaleString()}
                            </p>
                            {pendingBills.length > 0 && (
                                <button
                                    onClick={handlePayAll}
                                    className="w-full mt-4 py-2.5 rounded-lg bg-white text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all shadow-sm"
                                >
                                    Pay Outstanding <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                            {pendingBills.length === 0 && (
                                <p className="text-xs text-neutral-400 mt-2 font-medium">No pending dues currently</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Pending Bills Row */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card p-0 overflow-hidden bg-transparent border-none shadow-none">
                                <h2 className="text-xl font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                                    <IndianRupee className="w-5 h-5" /> Pending Approvals
                                </h2>
                                
                                {pendingBills.length === 0 ? (
                                    <div className="card text-center py-10 bg-white">
                                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                                        <p className="font-bold text-neutral-900">All caught up!</p>
                                        <p className="text-sm text-neutral-500 mt-1">You have no pending invoices.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingBills.map(bill => (
                                            <div key={bill.id} className="card bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                                                <div>
                                                    <p className="font-bold text-neutral-900 text-lg">{bill.month} {bill.year}</p>
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">Due Now</span>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                    <p className="text-2xl font-black text-neutral-900 tracking-tight">₹{bill.amount}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDownload(bill.id, bill.month, bill.year)}
                                                            className="px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 font-bold text-xs flex items-center justify-center hover:bg-neutral-100 transition-colors"
                                                            title="Download Invoice"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePay(bill)}
                                                            className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm"
                                                        >
                                                            <CreditCard className="w-4 h-4" /> Pay
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Payment History */}
                            {historyBills.length > 0 && (
                                <div className="card p-0 overflow-hidden bg-transparent border-none shadow-none">
                                    <h2 className="text-xl font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Recent Payments
                                    </h2>
                                    
                                    <div className="space-y-3">
                                        {historyBills.map(bill => (
                                            <div key={bill.id} className="card bg-white p-4 flex items-center justify-between border-l-4 border-l-emerald-500 hover:border-l-[#ffb88c] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900 text-sm">{bill.month} {bill.year}</p>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Paid Successfully</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    <span className="font-black text-neutral-900 text-base">₹{bill.amount}</span>
                                                    <button
                                                        onClick={() => handleDownload(bill.id, bill.month, bill.year)}
                                                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                                        title="Download PDF"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* My Holidays Section */}
                        <div className="space-y-3 h-full">
                            <h2 className="text-xl font-bold text-[#0A0A0A] mb-4 flex items-center gap-2">
                                <Coffee className="w-5 h-5" /> Leaves Taken
                            </h2>

                            <div className="card flex flex-col h-[400px] overflow-hidden bg-white">
                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                    {(user?.studentHolidays?.length || 0) === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                            <div className="w-12 h-12 bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center mb-3">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <p className="text-neutral-900 text-sm font-bold">No holidays logged</p>
                                            <p className="text-xs font-medium text-neutral-400 mt-1">Take a break soon!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {upcomingHolidays.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-3 px-1">Upcoming Holidays</p>
                                                    <div className="flex flex-col gap-2">
                                                        {upcomingHolidays.map((d, i) => (
                                                            <div key={`upcoming-${i}`} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                                                                <CalendarRange className="w-4 h-4 text-orange-600" />
                                                                <span className="text-[#0A0A0A] font-bold text-xs">{formatDate(d)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-1">All Recorded History</p>
                                                <div className="flex flex-col gap-2">
                                                    {[...(user?.studentHolidays || [])].sort((a,b) => new Date(b).getTime() - new Date(a).getTime()).map((d, i) => {
                                                        const isFuture = new Date(d) >= new Date(new Date().setHours(0,0,0,0));
                                                        return isFuture ? null : (
                                                            <div key={`past-${i}`} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                                                <div className="flex items-center gap-3">
                                                                    <FileText className="w-4 h-4 text-neutral-400" />
                                                                    <span className="text-neutral-600 font-bold text-xs">{formatDate(d)}</span>
                                                                </div>
                                                                <CheckCircle className="w-3.5 h-3.5 text-neutral-300" />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
        </div>
    );
}
