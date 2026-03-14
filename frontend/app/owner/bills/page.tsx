'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';
import { Plus, Check, MessageSquare, ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';

interface AbsentRecord {
    date: string;
    shift: string;
}

interface BillBreakdown {
    meals_present?: number;
    meals_absent?: number;
    absent_dates?: (string | AbsentRecord)[];
    meal_slot?: string;
    per_meal_rate?: number;
    attendance_days?: number;
    days_in_month?: number;
    days_enrolled?: number;
}

interface Bill {
    id: string;
    student_name: string;
    mobile: string;
    month: string;
    year: number;
    amount: string;
    status: 'PAID' | 'PENDING';
    generated_at: string;
    transaction_ref?: string;
    breakdown?: BillBreakdown;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    // No more local month/year state needed, it just shows live pending dues
    const currentMonthStr = new Date().toLocaleString('default', { month: 'long' });

    const fetchBills = useCallback(async () => {
        try {
            const { data } = await API.get('/bills');
            setBills(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    // Removed local generation and month navigation logics



    const formatDateForWhatsApp = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const handleDownload = async (billId: string, month: string, year: number) => {
        try {
            const response = await API.get(`/bills/${billId}/download`, {
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

    const handleSendWhatsApp = (bill: Bill) => {
        // UPI Payment Link
        const upiId = "prafullharer@slc";
        const payeeName = "Prafull Harer";
        const amount = parseFloat(bill.amount);
        const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Mess-Bill-${bill.month}-${bill.year}`;

        const message = `*Mess Management Software - Bill Reminder*

*Student:* ${bill.student_name}
*Plan:* ${bill.breakdown?.meal_slot || 'Standard'}

*Total Pending Dues: Rs.${bill.amount}*

For any queries, please contact Mess Management Software.

*Pay Now:* ${upiLink}

Thank you for choosing Mess Management Software!`;

        window.open(`https://wa.me/91${bill.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const filteredBills = bills;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Bills</h1>
                    <p className="text-neutral-500 text-sm mt-1">Generate and manage monthly bills</p>
                </div>
            </div>





            {/* Bills List */}
            <div className="space-y-3">
                {filteredBills.length > 0 ? (
                    filteredBills.map(bill => (
                        <div key={bill.id} className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-300 transition-colors">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#0A0A0A] truncate text-base sm:text-sm">{bill.student_name}</p>
                                <p className="text-xs text-neutral-500">{bill.mobile}</p>
                            </div>
                            <div className="flex items-center justify-between sm:block text-right">
                                <p className="text-lg font-bold text-[#0A0A0A]">₹{bill.amount}</p>
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${bill.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {bill.status === 'PAID' && <Check className="w-3 h-3" />}
                                    {bill.status}
                                </span>
                            </div>
                            <div className="flex gap-2 sm:gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100">
                                <button
                                    onClick={() => handleDownload(bill.id, bill.month, bill.year)}
                                    className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-lg border border-neutral-200 hover:border-[#0A0A0A] transition-colors flex items-center justify-center gap-1.5"
                                    title="Download PDF"
                                >
                                    <Download className="w-3.5 h-3.5" /> PDF
                                </button>
                                {bill.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleSendWhatsApp(bill)}
                                        className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#25D366] text-white hover:bg-[#1da851] transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-neutral-500 card">
                        <Check className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                        <p className="font-bold text-lg text-emerald-600">All Clear!</p>
                        <p className="text-sm mt-1">There are no pending dues right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
