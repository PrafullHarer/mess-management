'use client';
import { useEffect, useState, useCallback } from 'react';
import API from '@/lib/api';
import { Search, Calendar, X, Check, Save, ChevronDown, Lock } from 'lucide-react';

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
}

interface Student {
    id: string;
    name: string;
    mobile: string;
    plan: string;
    diet: string;
    gender: string;
    joinedAt: string;
    studentHolidays: string[];
    computedStatus: ComputedStatus;
    remainingMeals: number;
    totalMeals: number;
    messEndDate: string;
    messEndDateISO: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Active': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Ending Soon': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'Dues Pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Mess Over': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Unusual Plan': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'No Date': { bg: 'bg-neutral-50', text: 'text-neutral-500', border: 'border-neutral-200' },
    'Error': { bg: 'bg-neutral-50', text: 'text-neutral-500', border: 'border-neutral-200' },
};

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterGender, setFilterGender] = useState<'all' | 'boys' | 'girls'>('all');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Global holidays
    const [globalHolidays, setGlobalHolidays] = useState<GlobalHoliday[]>([]);

    // Calendar modal
    const [calendarStudentId, setCalendarStudentId] = useState<string | null>(null);
    const [calendarStudentName, setCalendarStudentName] = useState('');
    const [calendarStudentPlan, setCalendarStudentPlan] = useState('');
    const [calendarJoinDate, setCalendarJoinDate] = useState('');
    const [calendarEndDate, setCalendarEndDate] = useState<string | null>(null);
    const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);

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

    // Get global holiday dates that affect a specific plan
    const getGlobalHolidayDates = (plan: string): Set<string> => {
        const dates = new Set<string>();
        globalHolidays.forEach(h => {
            if (globalHolidayAffects(h.slot, plan)) {
                dates.add(h.date);
            }
        });
        return dates;
    };

    // Open calendar for a student
    const openCalendar = (student: Student) => {
        const plan = student.plan || '';
        const globalDates = getGlobalHolidayDates(plan);
        // Strip personal holidays that overlap with global holidays
        const cleaned = (student.studentHolidays || []).filter(d => !globalDates.has(d));

        setCalendarStudentId(student.id);
        setCalendarStudentName(student.name);
        setCalendarStudentPlan(plan);
        setCalendarJoinDate(student.joinedAt || '');
        setCalendarEndDate(student.messEndDateISO || null); // Capture the exact unformatted date string
        setSelectedHolidays(cleaned);
    };

    const closeCalendar = () => {
        setCalendarStudentId(null);
        setCalendarStudentName('');
        setCalendarStudentPlan('');
        setCalendarJoinDate('');
        setCalendarEndDate(null);
        setSelectedHolidays([]);
    };

    const toggleHolidayDate = (isoStr: string) => {
        setSelectedHolidays(prev =>
            prev.includes(isoStr)
                ? prev.filter(d => d !== isoStr)
                : [...prev, isoStr]
        );
    };

    const saveHolidays = async () => {
        if (!calendarStudentId) return;
        setSaving(calendarStudentId);
        // Strip any personal holidays that sit on global holidays before saving
        const globalDates = getGlobalHolidayDates(calendarStudentPlan);
        const cleanedHolidays = selectedHolidays.filter(d => !globalDates.has(d));
        try {
            await API.put(`/students/${calendarStudentId}`, {
                studentHolidays: cleanedHolidays
            });
            setToast({ type: 'success', text: `✅ Holidays saved for ${calendarStudentName}` });
            fetchStudents();
            closeCalendar();
            setTimeout(() => setToast(null), 3000);
        } catch {
            setToast({ type: 'error', text: '❌ Failed to save holidays' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSaving(null);
        }
    };

    // Generate days from joining date up to exactly the mess end date
    const generateCalendarDays = () => {
        if (!calendarJoinDate) return {};
        const start = new Date(calendarJoinDate);
        start.setHours(0, 0, 0, 0);

        // Limit loop heavily so we don't accidentally infinite loop if things break
        const maxDays = 120; // Absolute safety cap
        
        // Grab the mess end date object if we have one
        let endObj: Date | null = null;
        if (calendarEndDate) {
            endObj = new Date(calendarEndDate);
            endObj.setHours(0, 0, 0, 0);
        }

        const months: Record<string, Date[]> = {};
        for (let i = 0; i < maxDays; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);

            // STOP immediately if we've reached past the mess end date!
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

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Filter students
    const filtered = students.filter(s => {
        const matchSearch = !search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.mobile.includes(search);
        const matchGender = filterGender === 'all' || s.gender === filterGender;
        return matchSearch && matchGender;
    });

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0A0A0A]">Attendance</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Manage personal holidays. Tap a student to open calendar.
                    </p>
                </div>
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
                    <option value="all">All</option>
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                </select>
            </div>

            {/* Today's Meal Requirement Cards */}
            {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                let studentsPresent = 0;
                let studentsOnLeave = 0;
                let vegPresent = 0;
                let nonVegPresent = 0;
                
                students.forEach(s => {
                    const gDates = getGlobalHolidayDates(s.plan || '');
                    const onLeave = gDates.has(todayStr) || (s.studentHolidays || []).includes(todayStr);
                    
                    if (onLeave) {
                        studentsOnLeave++;
                    } else {
                        studentsPresent++;
                        if ((s.diet || '').toLowerCase().includes('non')) {
                            nonVegPresent++;
                        } else {
                            vegPresent++;
                        }
                    }
                });

                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card bg-emerald-50 border-emerald-100 transition-all duration-200 hover:shadow-md">
                            <div className="flex items-center gap-2 mb-3 text-emerald-600">
                                <Check className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Total Present Today</span>
                            </div>
                            <p className="text-3xl font-black text-[#0A0A0A]">{studentsPresent}</p>
                            <p className="text-xs text-neutral-500 mt-1 font-medium">Expected for meals</p>
                        </div>

                        <div className="card bg-orange-50 border-orange-100 transition-all duration-200 hover:shadow-md">
                            <div className="flex items-center gap-2 mb-3 text-orange-600">
                                <X className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Total On Leave</span>
                            </div>
                            <p className="text-3xl font-black text-[#0A0A0A]">{studentsOnLeave}</p>
                            <p className="text-xs text-neutral-500 mt-1 font-medium">Not coming today</p>
                        </div>

                        <div className="card bg-blue-50 border-blue-100 transition-all duration-200 hover:shadow-md">
                            <div className="flex items-center gap-2 mb-3 text-blue-600">
                                <span className="text-base">🥬</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Veg Meals</span>
                            </div>
                            <p className="text-3xl font-black text-[#0A0A0A]">{vegPresent}</p>
                            <p className="text-xs text-neutral-500 mt-1 font-medium">Vegetarian count</p>
                        </div>

                        <div className="card bg-rose-50 border-rose-100 transition-all duration-200 hover:shadow-md">
                            <div className="flex items-center gap-2 mb-3 text-rose-600">
                                <span className="text-base">🍗</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Non-Veg Meals</span>
                            </div>
                            <p className="text-3xl font-black text-[#0A0A0A]">{nonVegPresent}</p>
                            <p className="text-xs text-neutral-500 mt-1 font-medium">Non-vegetarian count</p>
                        </div>
                    </div>
                );
            })()}

            {/* Student List */}
            <div className="space-y-2">
                {filtered.map(student => {
                    const holCount = student.studentHolidays?.length || 0;
                    const statusStyle = STATUS_COLORS[student.computedStatus?.label] || STATUS_COLORS['Error'];

                    // Today's status for this student
                    const todayStr = new Date().toISOString().split('T')[0];
                    const globalDatesForStudent = getGlobalHolidayDates(student.plan || '');
                    const isGlobalHolToday = globalDatesForStudent.has(todayStr);
                    const isPersonalHolToday = (student.studentHolidays || []).includes(todayStr);
                    const isPresentToday = !isGlobalHolToday && !isPersonalHolToday;

                    return (
                        <button
                            key={student.id}
                            onClick={() => openCalendar(student)}
                            className="w-full text-left p-4 rounded-xl border-2 border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                {/* Today's Status Indicator */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                                    isGlobalHolToday
                                        ? 'bg-blue-100 text-blue-600'
                                        : isPersonalHolToday
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {isGlobalHolToday ? '🔒' : isPersonalHolToday ? '📅' : '✅'}
                                </div>

                                {/* Info */}
                                <div>
                                    <p className="font-bold text-[#0A0A0A]">{student.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-neutral-500">{student.plan}</span>
                                        <span className="text-neutral-300">·</span>
                                        <span className="text-xs text-neutral-500">
                                            {student.remainingMeals}/{student.totalMeals} meals left
                                        </span>
                                        <span className="text-neutral-300">·</span>
                                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${statusStyle.bg} ${statusStyle.text}`}>
                                            {student.computedStatus?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side */}
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold ${
                                    isPresentToday ? 'text-emerald-600' : isGlobalHolToday ? 'text-blue-600' : 'text-orange-600'
                                }`}>
                                    {isPresentToday ? 'Present' : isGlobalHolToday ? 'Global Holiday' : 'Personal Holiday'}
                                </span>
                                {holCount > 0 && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700">
                                        {holCount}
                                    </span>
                                )}
                                <Calendar className="w-4 h-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-neutral-500">
                    {search || filterGender !== 'all' ? 'No students match your filters.' : 'No students added yet.'}
                </div>
            )}

            {/* ===== CALENDAR MODAL ===== */}
            {calendarStudentId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold">{calendarStudentName}</h2>
                                <button onClick={closeCalendar} className="p-1 hover:bg-neutral-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-sm text-neutral-500 mb-4">
                                Tap dates to mark personal holidays. These dates won&apos;t count as meal days.
                            </p>

                            {!calendarJoinDate ? (
                                <div className="text-center py-12 text-neutral-500">
                                    <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                                    <p>No joining date set for this student.</p>
                                    <p className="text-xs mt-1">Edit the student to set a joining date first.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Legend */}
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
                                        <div className="flex items-center gap-3 text-xs">
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
                                        <div className="text-xs text-right">
                                            <span className="font-semibold text-blue-600">{getGlobalHolidayDates(calendarStudentPlan).size} global</span>
                                            <span className="text-neutral-300 mx-1">·</span>
                                            <span className="font-semibold text-orange-600">{selectedHolidays.length} personal</span>
                                        </div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="space-y-5 mb-6">
                                        {(() => {
                                            const globalDates = getGlobalHolidayDates(calendarStudentPlan);
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

                                                                // Find the global holiday reason if applicable
                                                                const globalHol = isGlobalHol ? globalHolidays.find(h => h.date === iso) : null;

                                                                if (isGlobalHol) {
                                                                    // Global holiday — locked, cannot toggle
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

                                                                // Personal holiday or regular day — toggleable
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
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    className="flex-1 btn-secondary"
                                    onClick={closeCalendar}
                                >
                                    Cancel
                                </button>
                                {calendarJoinDate && (
                                    <button
                                        type="button"
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                        onClick={saveHolidays}
                                        disabled={saving === calendarStudentId}
                                    >
                                        {saving === calendarStudentId ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" /> Save ({selectedHolidays.length})
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                    <p className="font-medium text-sm">{toast.text}</p>
                </div>
            )}
        </div>
    );
}
