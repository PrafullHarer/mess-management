'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';
import {
    Plus, Trash2, Edit2, Calendar, RefreshCw,
    Search, Filter, ChevronDown, X, Check, Lock
} from 'lucide-react';

interface GlobalHoliday {
    id: string;
    date: string;
    slot: string;
    reason: string;
    name: string;
}

interface ComputedStatus {
    label: string;
    color: string;
    dot: string;
    secondary?: { label: string; color: string };
}

interface Student {
    id: string;
    name: string;
    mobile: string;
    plan: string;
    amount: number;
    paid: number;
    diet: string;
    joinedAt: string;
    joiningDate?: string;
    studentHolidays: string[];
    paymentNotes: string;
    gender: string;
    status: string;
    // Computed by backend
    computedStatus: ComputedStatus;
    remainingMeals: number;
    messEndDate: string;
    messEndDateISO: string;
    totalHolidays: number;
    totalMeals: number;
    consumedMeals: number;
    pending: number;
}

const PLAN_OPTIONS = [
    '1 Time Eve', '1 Time Aftr', '2 Time',
    '15 Days 1 Time Eve', '15 Days 1 Time Aftr', '15 Days 2 Time'
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Active': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Ending Soon': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Dues Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Mess Over': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Unusual Plan': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'No Date': { bg: 'bg-neutral-50', text: 'text-neutral-500', border: 'border-neutral-200' },
    'Error': { bg: 'bg-neutral-50', text: 'text-neutral-500', border: 'border-neutral-200' },
};

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRenewing, setIsRenewing] = useState(false);
    const [isHolidayPickerOpen, setIsHolidayPickerOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filterGender, setFilterGender] = useState<'all' | 'boys' | 'girls'>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        password: 'password123',
        plan: '2 Time',
        amount: 0,
        paid: 0,
        diet: 'Veg' as 'Veg' | 'Non Veg',
        joiningDate: new Date().toISOString().split('T')[0],
        studentHolidays: [] as string[],
        paymentNotes: '',
        gender: 'boys' as 'boys' | 'girls'
    });

    // Holiday picker state
    const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);
    const [globalHolidays, setGlobalHolidays] = useState<GlobalHoliday[]>([]);

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/students');
            setStudents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGlobalHolidays = useCallback(async () => {
        try {
            const { data } = await API.get('/holidays');
            setGlobalHolidays(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchGlobalHolidays();
    }, [fetchStudents, fetchGlobalHolidays]);

    // Check if a global holiday affects a student's plan
    const globalHolidayAffects = (slot: string, plan: string) => {
        if (!plan) return slot === 'Whole Day';
        if (slot === 'Whole Day') return true;
        const lc = plan.toLowerCase();
        const isEve = lc.includes('eve') || lc.includes('evening');
        const isAftr = lc.includes('aftr') || lc.includes('after') || lc.includes('afternoon');
        const is2Time = lc.includes('2 time') || lc.includes('2time');
        if (slot === 'Evening' && (isEve || is2Time)) return true;
        if (slot === 'Afternoon' && (isAftr || is2Time)) return true;
        return false;
    };

    const getGlobalHolidayDates = (plan: string): Set<string> => {
        const dates = new Set<string>();
        globalHolidays.forEach(h => {
            if (globalHolidayAffects(h.slot, plan)) {
                dates.add(h.date);
            }
        });
        return dates;
    };

    const handleSaveStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Please enter student name');
            return;
        }
        if (!formData.mobile || formData.mobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!editingId && !formData.password) {
            alert('Please enter a password');
            return;
        }
        if (!formData.joiningDate) {
            alert('Please select joining date');
            return;
        }
        if (formData.paid > formData.amount && formData.amount > 0) {
            alert(`Paid (₹${formData.paid}) cannot exceed Amount (₹${formData.amount})`);
            return;
        }

        setSaving(true);
        try {
            const apiPayload = {
                name: formData.name,
                mobile: formData.mobile,
                plan: formData.plan,
                amount: formData.amount,
                paid: formData.paid,
                diet: formData.diet,
                joined_at: formData.joiningDate,
                joiningDate: formData.joiningDate,
                studentHolidays: formData.studentHolidays,
                paymentNotes: formData.paymentNotes,
                gender: formData.gender,
                ...(editingId && !formData.password ? {} : { password: formData.password })
            };

            if (editingId) {
                await API.put(`/students/${editingId}`, apiPayload);
            } else {
                await API.post('/students', apiPayload);
            }
            fetchStudents();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err?.response?.data?.message || 'Failed to save student');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this student? This cannot be undone.')) return;
        try {
            await API.delete(`/students/${id}`);
            fetchStudents();
        } catch {
            alert('Failed to remove student');
        }
    };

    const openEditModal = (student: Student) => {
        setEditingId(student.id);
        const joinedAtStr = student.joinedAt || student.joiningDate || '';
        const displayDate = joinedAtStr && joinedAtStr.includes('T') ? joinedAtStr.split('T')[0] : joinedAtStr;

        setFormData({
            name: student.name,
            mobile: student.mobile,
            password: '',
            plan: student.plan || '2 Time',
            amount: student.amount || 0,
            paid: student.paid || 0,
            diet: (student.diet || 'Veg') as 'Veg' | 'Non Veg',
            joiningDate: displayDate,
            studentHolidays: student.studentHolidays || [],
            paymentNotes: student.paymentNotes || '',
            gender: (student.gender || 'boys') as 'boys' | 'girls'
        });
        setIsRenewing(false);
        setIsModalOpen(true);
    };

    const openRenewModal = (student: Student) => {
        setEditingId(student.id); // KEEP the same ID (don't create a new student)
        setFormData({
            name: student.name,
            mobile: student.mobile,
            password: '', // Kept empty so it doesn't try to change password
            plan: student.plan || '2 Time',
            amount: student.amount || 0,
            paid: 0, // Reset paid amount for new cycle
            diet: (student.diet || 'Veg') as 'Veg' | 'Non Veg',
            joiningDate: new Date().toISOString().split('T')[0], // Reset joining date to today
            studentHolidays: [], // Clear personal holidays
            paymentNotes: '', // Clear old payment notes
            gender: (student.gender || 'boys') as 'boys' | 'girls'
        });
        setIsRenewing(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsRenewing(false);
        setIsHolidayPickerOpen(false);
        setEditingId(null);
        setFormData({
            name: '',
            mobile: '',
            password: 'password123',
            plan: '2 Time',
            amount: 0,
            paid: 0,
            diet: 'Veg',
            joiningDate: new Date().toISOString().split('T')[0],
            studentHolidays: [],
            paymentNotes: '',
            gender: 'boys'
        });
    };

    // Holiday picker helpers
    const openHolidayPicker = () => {
        if (!formData.joiningDate) {
            alert('Please select a joining date first');
            return;
        }
        setSelectedHolidays([...formData.studentHolidays]);
        setIsHolidayPickerOpen(true);
    };

    const toggleHolidayDate = (isoString: string) => {
        setSelectedHolidays(prev =>
            prev.includes(isoString)
                ? prev.filter(d => d !== isoString)
                : [...prev, isoString]
        );
    };

    const confirmHolidaySelection = () => {
        setFormData(prev => ({ ...prev, studentHolidays: selectedHolidays }));
        setIsHolidayPickerOpen(false);
    };

    const generateCalendarDays = () => {
        if (!formData.joiningDate) return {};
        const start = new Date(formData.joiningDate);
        start.setHours(0, 0, 0, 0);
        // We'll generate a max of 120 days since editing students can have longer plans
        const maxDays = 120;
        
        let endObj: Date | null = null;
        if (editingId) {
            const st = students.find(s => s.id === editingId);
            if (st?.messEndDateISO) {
                endObj = new Date(st.messEndDateISO);
                endObj.setHours(0, 0, 0, 0);
            }
        }

        const months: Record<string, Date[]> = {};
        for (let i = 0; i < maxDays; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);

            if (endObj && d.getTime() > endObj.getTime()) {
                break;
            }

            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!months[key]) months[key] = [];
            months[key].push(new Date(d));
        }
        return months;
    };

    const formatISODate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Filter students
    const filtered = students.filter(s => {
        const matchSearch = !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.mobile.includes(search);
        const matchGender = filterGender === 'all' || s.gender === filterGender;
        const matchStatus = filterStatus === 'all' || s.computedStatus?.label === filterStatus;
        return matchSearch && matchGender && matchStatus;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">Students</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        {students.length} total · {students.filter(s => s.computedStatus?.label === 'Active').length} active
                    </p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Student
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name or mobile..."
                        className="input-field pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="input-field"
                    style={{ width: 'auto' }}
                    value={filterGender}
                    onChange={e => setFilterGender(e.target.value as 'all' | 'boys' | 'girls')}
                >
                    <option value="all">All Genders</option>
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                </select>

                <select
                    className="input-field"
                    style={{ width: 'auto' }}
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Ending Soon">Ending Soon</option>
                    <option value="Dues Pending">Dues Pending</option>
                    <option value="Mess Over">Mess Over</option>
                    <option value="Unusual Plan">Unusual Plan</option>
                </select>
            </div>

            {/* Student Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((student) => {
                    const statusStyle = STATUS_COLORS[student.computedStatus?.label] || STATUS_COLORS['Error'];

                    return (
                        <div key={student.id} className="card hover:border-neutral-300 transition-all duration-200 group">
                            {/* Header row */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-bold text-[#0A0A0A]">{student.name}</p>
                                    <p className="text-sm text-neutral-500">{student.mobile}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                    {student.computedStatus?.dot} {student.computedStatus?.label}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Plan</span>
                                    <span className="font-medium">{student.plan || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Diet</span>
                                    <span className="font-medium">{student.diet || 'Veg'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Remaining</span>
                                    <span className="font-bold" style={{ color: student.computedStatus?.color || '#0A0A0A' }}>
                                        {student.remainingMeals} / {student.totalMeals} meals
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-500">Mess End</span>
                                    <span className="font-medium">{student.messEndDate || '—'}</span>
                                </div>
                                {student.amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500">Payment</span>
                                        <span className="font-medium">
                                            ₹{student.paid?.toLocaleString()} / ₹{student.amount?.toLocaleString()}
                                            {student.pending > 0 && (
                                                <span className="text-amber-600 ml-1 text-xs">(₹{student.pending} due)</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                                {student.joinedAt && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500">Joined</span>
                                        <span className="font-medium text-neutral-600">
                                            {new Date(student.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                {student.studentHolidays?.length > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-neutral-500">Holidays</span>
                                        <span className="font-medium text-blue-600">{student.studentHolidays.length} personal</span>
                                    </div>
                                )}
                            </div>

                            {/* Secondary status */}
                            {student.computedStatus?.secondary && (
                                <div className="mt-2 text-xs font-semibold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                                    {student.computedStatus.secondary.label}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                                <button
                                    onClick={() => openEditModal(student)}
                                    className="flex-1 text-xs font-semibold py-2 rounded-lg border border-neutral-200 hover:border-[#0A0A0A] transition-colors flex items-center justify-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => openRenewModal(student)}
                                    className="flex-1 text-xs font-semibold py-2 rounded-lg border border-neutral-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1"
                                    title="Renew with today's date"
                                >
                                    <RefreshCw className="w-3 h-3" /> Renew
                                </button>
                                <button
                                    onClick={() => handleDelete(student.id)}
                                    className="text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-200 hover:border-red-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-neutral-500">
                    {search || filterGender !== 'all' || filterStatus !== 'all'
                        ? 'No students match your filters.'
                        : 'No students added yet.'}
                </div>
            )}

            {/* ===== MODAL ===== */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {!isHolidayPickerOpen ? (
                            /* ---- Student Form ---- */
                            <form onSubmit={handleSaveStudent} className="p-6 space-y-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">
                                        {isRenewing ? 'Renew Cycle' : editingId ? 'Edit Student' : 'Add New Student'}
                                    </h2>
                                    <button type="button" onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        placeholder="Full name"
                                        className="input-field"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Mobile */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">
                                        Mobile <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        placeholder="10-digit number"
                                        className="input-field"
                                        value={formData.mobile}
                                        onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                {/* Joining Date */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">
                                        Joining Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={formData.joiningDate}
                                        onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Plan */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">
                                        Plan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="input-field"
                                        value={formData.plan}
                                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                                    >
                                        {PLAN_OPTIONS.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">Gender</label>
                                    <div className="flex gap-2">
                                        {(['boys', 'girls'] as const).map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${formData.gender === g
                                                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                            >
                                                {g === 'boys' ? '👦 Boys' : '👧 Girls'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount & Paid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-500 mb-2 block">Amount ₹</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-neutral-500 mb-2 block">Paid ₹</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={formData.paid}
                                            onChange={e => setFormData({ ...formData, paid: parseInt(e.target.value) || 0 })}
                                            min={0}
                                        />
                                    </div>
                                </div>

                                {/* Diet */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">Diet</label>
                                    <div className="flex gap-2">
                                        {(['Veg', 'Non Veg'] as const).map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${formData.diet === d
                                                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, diet: d })}
                                            >
                                                {d === 'Veg' ? '🥬 Veg' : '🍗 Non Veg'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Personal Holidays */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">Personal Holidays</label>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between py-3 px-4 rounded-lg border border-neutral-200 hover:border-neutral-400 transition-colors text-sm"
                                        onClick={openHolidayPicker}
                                    >
                                        <span>
                                            {formData.studentHolidays.length > 0
                                                ? `${formData.studentHolidays.length} selected 📅`
                                                : 'Select Holidays 📅'}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                    </button>
                                    <p className="text-xs text-neutral-400 mt-1">Select dates after joining date.</p>
                                </div>

                                {/* Payment Notes */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">Payment Notes</label>
                                    <input
                                        placeholder="e.g. 700 on 1-Feb, 700 on 15-Feb"
                                        className="input-field"
                                        value={formData.paymentNotes}
                                        onChange={e => setFormData({ ...formData, paymentNotes: e.target.value })}
                                    />
                                    <p className="text-xs text-neutral-400 mt-1">Optional: track installment history</p>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 mb-2 block">
                                        Password {!editingId && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        placeholder={editingId ? 'Leave blank to keep current' : 'Login password'}
                                        className="input-field"
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        {...(!editingId && { required: true })}
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : (editingId ? 'Update' : 'Add')} Student
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* ---- Holiday Picker ---- */
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Select Holidays</h2>
                                    <button onClick={() => setIsHolidayPickerOpen(false)} className="p-1 hover:bg-neutral-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-neutral-500 mb-4">Tap dates to mark as personal holiday.</p>

                                <div className="flex justify-between mb-4 pb-3 border-b border-neutral-100 text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                                                <Lock className="w-2.5 h-2.5 text-white" />
                                            </span> Global
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded bg-orange-500"></span> Personal
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded bg-emerald-400"></span> Present
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-blue-600">{getGlobalHolidayDates(formData.plan).size} global</span>
                                        <span className="text-neutral-300 mx-1">·</span>
                                        <span className="font-semibold text-orange-600">{selectedHolidays.length} personal</span>
                                    </div>
                                </div>

                                <div className="max-h-[50vh] overflow-y-auto space-y-4">
                                    {(() => {
                                        const globalDates = getGlobalHolidayDates(formData.plan);
                                        return Object.entries(generateCalendarDays()).map(([monthKey, days]) => {
                                            const [yy, mm] = monthKey.split('-');
                                            const firstDay = days[0];
                                            const firstDayOfWeek = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1).getDay();
                                            const startOffset = firstDay.getDate() - 1;
                                            const totalOffset = (firstDayOfWeek + startOffset) % 7;

                                            return (
                                                <div key={monthKey}>
                                                    <div className="font-semibold text-xs uppercase tracking-wider text-neutral-500 mb-2">
                                                        {monthNames[parseInt(mm) - 1]} {yy}
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                            <div key={i} className="text-center text-[10px] font-bold text-neutral-400 py-1">{d}</div>
                                                        ))}
                                                        {Array.from({ length: totalOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                                                        {days.map(d => {
                                                            const iso = formatISODate(d);
                                                            const isGlobalHol = globalDates.has(iso);
                                                            const isPersonalHol = selectedHolidays.includes(iso);
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            const isPast = d.getTime() < today.getTime();
                                                            const globalHol = isGlobalHol ? globalHolidays.find(h => h.date === iso) : null;

                                                            if (isGlobalHol) {
                                                                return (
                                                                    <div
                                                                        key={iso}
                                                                        className="aspect-square rounded-md flex items-center justify-center text-sm font-medium bg-blue-500 text-white cursor-not-allowed relative"
                                                                        title={`🔒 Global: ${globalHol?.reason || globalHol?.name || 'Holiday'}`}
                                                                    >
                                                                        {d.getDate()}
                                                                        <Lock className="w-2 h-2 absolute top-0.5 right-0.5 opacity-70" />
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    key={iso}
                                                                    type="button"
                                                                    className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium transition-all ${isPersonalHol
                                                                        ? 'bg-orange-500 text-white shadow-sm'
                                                                        : isPast
                                                                            ? 'bg-emerald-50 text-emerald-600 opacity-70 hover:opacity-100 hover:bg-emerald-100'
                                                                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                                        }`}
                                                                    onClick={() => toggleHolidayDate(iso)}
                                                                >
                                                                    {d.getDate()}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>

                                <div className="flex gap-3 mt-5 pt-4 border-t">
                                    <button
                                        type="button"
                                        className="flex-1 btn-secondary"
                                        onClick={() => setIsHolidayPickerOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                        onClick={confirmHolidaySelection}
                                    >
                                        <Check className="w-4 h-4" /> Done ({selectedHolidays.length})
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
