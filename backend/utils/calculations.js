/*
  calculations.js — Core Business Logic
  Plan detection, meal simulation, holiday parsing,
  student status determination.
*/

/* ===== KNOWN PLANS ===== */
const KNOWN_PLANS = [
    '1 Time Eve', '1 Time Aftr', '2 Time',
    '15 Days 1 Time Eve', '15 Days 1 Time Aftr', '15 Days 2 Time',
    '15 days 2 Time', '15 days 1 Time Eve', '15 days 1 Time Aftr',
    '12 Time (W T F)'
];

const PLAN_OPTIONS = [
    '1 Time Eve', '1 Time Aftr', '2 Time',
    '15 Days 1 Time Eve', '15 Days 1 Time Aftr', '15 Days 2 Time'
];

function isUnusualPlan(p) {
    if (!p) return true;
    if (KNOWN_PLANS.includes(p)) return false;
    if (isTwoTime(p) || isEvening(p) || isAfternoon(p)) return false;
    if (/12\s*time/i.test(p)) return false;
    return true;
}

/* ===== PLAN DETECTION ===== */
function isTwoTime(p) {
    if (!p) return false;
    const lc = p.toLowerCase().replace(/[\s-]+/g, '');
    return /(?<!\d)2time/i.test(lc) || lc.includes('twotime');
}

function isEvening(p) {
    if (!p) return false;
    const lc = p.toLowerCase();
    return (lc.includes('eve') || lc.includes('evg') || lc.includes('evening')) && !isTwoTime(p);
}

// Morning plans are treated as afternoon for holiday logic
function isAfternoon(p) {
    if (!p) return false;
    const lc = p.toLowerCase();
    return (lc.includes('aftr') || lc.includes('after') || lc.includes('afternoon') || lc.includes('morng') || lc.includes('morning')) && !isTwoTime(p);
}

function planDuration(p) {
    if (!p) return 28;
    return /15\s*days?/i.test(p) ? 15 : 28;
}

function totalMeals(p) {
    if (!p) return 28;
    if (/12\s*time/i.test(p)) return 12;
    const d = planDuration(p);
    return isTwoTime(p) ? d * 2 : d;
}

/**
 * Map plan string to legacy mealSlot value for backward compat
 */
function planToMealSlot(plan) {
    if (!plan) return 'BOTH';
    if (isTwoTime(plan)) return 'BOTH';
    if (isEvening(plan)) return 'NIGHT';
    if (isAfternoon(plan)) return 'AFTERNOON';
    return 'BOTH';
}

/* ===== HELPER ===== */
function parseLocalDate(str) {
    if (!str) return new Date(NaN);
    if (str instanceof Date) return str;
    const parts = str.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function safeInt(v) {
    const n = parseInt(v, 10);
    return isNaN(n) ? 0 : n;
}

function fmtDate(d) {
    if (!d) return '';
    if (typeof d === 'string') d = parseLocalDate(d);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ===== MEAL SIMULATION ===== */
function simulatePlan(s, hols) {
    const tm = totalMeals(s.plan);
    const ms = /12\s*time/i.test(s.plan) || isUnusualPlan(s.plan);

    const sHols = [...(s.studentHolidays || [])];

    let consumedMeals = 0;
    let elapsedHols = 0;
    let remainingMeals = tm;
    let endD = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

    const joinDate = s.joinedAt || s.joiningDate;
    if (!joinDate || ms) {
        return { consumedMeals: 0, elapsedHols: 0, remainingMeals: tm, endDate: endD, history: [] };
    }

    const start = parseLocalDate(joinDate);
    if (isNaN(start)) {
        return { consumedMeals: 0, elapsedHols: 0, personalHols: 0, remainingMeals: tm, endDate: endD, history: [] };
    }

    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })); 
    today.setHours(0, 0, 0, 0);
    const mult = isTwoTime(s.plan) ? 2 : 1;
    const maxDays = 730;

    let currentD = new Date(start);
    let dayCount = 0;
    let pendingMealsToSimulate = tm;
    const history = [];

    while (pendingMealsToSimulate > 0 && dayCount < maxDays) {
        const isGlobalHol = (hols || []).some(h => {
            const hd = parseLocalDate(h.date || h.dateStr); // fallbacks for older hol structures just in case
            return hd.getTime() === currentD.getTime() && holidayAffectsStudent(h, s.plan);
        });

        const dateNum = currentD.getDate();
        const isoStr = currentD.getFullYear() + '-' + String(currentD.getMonth() + 1).padStart(2, '0') + '-' + String(currentD.getDate()).padStart(2, '0');
        let personalIdx = sHols.indexOf(isoStr);
        if (personalIdx === -1) personalIdx = sHols.indexOf(dateNum);
        const isPersonalHol = personalIdx !== -1;

        if (isPersonalHol) {
            sHols.splice(personalIdx, 1);
        }

        const isHoliday = isGlobalHol || isPersonalHol;
        const isPast = currentD.getTime() < today.getTime();
        const historyObj = {
            date: new Date(currentD),
            isHoliday, globalHol: isGlobalHol, personalHol: isPersonalHol,
            isEaten: false, isFuture: !isPast
        };

        if (isHoliday) {
            historyObj.mealsConsumed = 0;
            // Only increment elapsedHols if it is past. Also, if we want to track pure personal hols we can do it here.
            if (isPast) elapsedHols++;
        } else {
            const mealsToday = Math.min(pendingMealsToSimulate, mult);
            pendingMealsToSimulate -= mealsToday;
            historyObj.mealsConsumed = mealsToday;
            if (isPast) {
                historyObj.isEaten = true;
                consumedMeals += mealsToday;
                remainingMeals -= mealsToday;
            }
        }

        history.push(historyObj);
        currentD.setDate(currentD.getDate() + 1);
        dayCount++;
    }

    return {
        consumedMeals, elapsedHols,
        personalHols: history.filter(h => h.personalHol && !h.globalHol).length,
        remainingMeals: Math.max(0, remainingMeals),
        endDate: currentD,
        history
    };
}

/* ===== HOLIDAY MATCHING ===== */
function holidayAffectsStudent(h, p) {
    const slot = h.slot || 'Whole Day';
    if (!p) return slot === 'Whole Day';
    if (slot === 'Whole Day') return true;
    if (slot === 'Evening' && (isEvening(p) || isTwoTime(p))) return true;
    if (slot === 'Afternoon' && (isAfternoon(p) || isTwoTime(p))) return true;
    return false;
}

/* ===== PROXY FUNCTIONS ===== */
function totalHolidays(s, hols) { // Changed name back to totalHolidays to match user snippet
    try {
        const sim = simulatePlan(s, hols);
        return sim.history.filter(h => h.isHoliday).length;
    } catch { return 0; }
}

function messEndDate(s, hols) {
    try {
        const sim = simulatePlan(s, hols);
        return sim.endDate;
    } catch { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })); }
}

function remainingMeals(s, hols) {
    try {
        if (/12\s*time/i.test(s.plan)) return 12;
        const sim = simulatePlan(s, hols);
        return sim.remainingMeals;
    } catch { return 0; }
}

/* ===== STUDENT STATUS ===== */
function studentStatus(s, hols) {
    if (isUnusualPlan(s.plan)) {
        return { label: 'Unusual Plan', color: '#7c3aed', dot: '🟣' };
    }
    try {
        const joinDate = s.joinedAt || s.joiningDate;
        if (!joinDate) return { label: 'No Date', color: '#6b7280', dot: '⚪' };
        const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })); 
        today.setHours(0, 0, 0, 0);
        const endD = messEndDate(s, hols);
        const pending = safeInt(s.amount) - safeInt(s.paid);
        const rem = remainingMeals(s, hols);
        const hasDues = safeInt(s.amount) > 0 && pending > 0;
        const isOver = today > endD;

        if (isOver && hasDues) return { label: 'Mess Over', color: '#dc2626', dot: '🔴', secondary: { label: `₹${pending} Due`, color: '#ca8a04' } };
        if (isOver) return { label: 'Mess Over', color: '#dc2626', dot: '🔴' };
        if (hasDues) return { label: 'Dues Pending', color: '#ca8a04', dot: '🟡' };

        const tmCheck = totalMeals(s.plan);
        const endingSoonThreshold = Math.max(3, Math.ceil(tmCheck * 0.18));
        if (rem <= endingSoonThreshold) return { label: 'Ending Soon', color: '#ea580c', dot: '🟠' };
        return { label: 'Active', color: '#16a34a', dot: '🟢' };
    } catch {
        return { label: 'Error', color: '#6b7280', dot: '⚪' };
    }
}

/* ===== HOLIDAY PARSING ===== */
function parseHolidays(str) {
    if (!str || !str.toString().trim()) return [];

    const raw = str.toString().split(',').map(s => s.trim()).filter(Boolean);
    const result = [];

    for (const p of raw) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(p)) {
            result.push(p);
        } else if (/^\d{1,2}-\d{1,2}$/.test(p)) {
            const [start, end] = p.split('-').map(Number);
            if (start >= 1 && start <= 31 && end >= 1 && end <= 31 && start <= end) {
                for (let i = start; i <= end; i++) result.push(i);
            }
        } else {
            const n = parseInt(p);
            if (!isNaN(n) && n >= 1 && n <= 31) {
                result.push(n);
            }
        }
    }

    return [...new Set(result)];
}

/* ===== BUSINESS INSIGHTS ===== */
// Added parameters so it executes correctly within the Node environment
function computeInsights(boys, girls, holidays, dailyEntries) {
    const all = [...(boys || []), ...(girls || [])];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const currentMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.getFullYear() + '-' + String(lastMonth.getMonth() + 1).padStart(2, '0');

    // Revenue metrics
    const subscriptionsCollected = all.reduce((a, s) => a + safeInt(s.paid), 0);
    const subscriptionsPending = all.reduce((a, s) => {
        const due = safeInt(s.amount) - safeInt(s.paid);
        return a + (due > 0 ? due : 0);
    }, 0);
    const totalAmount = all.reduce((a, s) => a + safeInt(s.amount), 0); 
    const collectionRate = totalAmount > 0 ? Math.round((subscriptionsCollected / totalAmount) * 100) : 0;
    const avgRevenuePerStudent = all.length > 0 ? Math.round(subscriptionsCollected / all.length) : 0;

    // Student lifecycle
    const newThisMonth = all.filter(s => s.joiningDate && s.joiningDate.startsWith(currentMonth)).length;
    const newLastMonth = all.filter(s => s.joiningDate && s.joiningDate.startsWith(lastMonthStr)).length;

    const messOverStudents = all.filter(s => {
        const st = studentStatus(s, holidays);
        return st.label === 'Mess Over';
    });
    const renewedStudents = all.filter(s => {
        const key = (s.name || '').toLowerCase().replace(/\s+/g, '');
        return all.filter(x => (x.name || '').toLowerCase().replace(/\s+/g, '') === key).length > 1;
    });
    const retentionRate = messOverStudents.length > 0
        ? Math.round((renewedStudents.length / (messOverStudents.length + renewedStudents.length)) * 100)
        : 100;

    // Plan popularity
    const planCounts = {};
    all.forEach(s => {
        const p = s.plan || 'Unknown';
        planCounts[p] = (planCounts[p] || 0) + 1;
    });
    const planPopularity = Object.entries(planCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Diet split
    const vegCount = all.filter(s => !(s.diet || '').toLowerCase().includes('non')).length;
    const nonVegCount = all.length - vegCount;

    // Holiday stats
    const avgHolidays = all.length > 0
        ? (all.reduce((a, s) => a + (s.studentHolidays || []).length, 0) / all.length).toFixed(1)
        : '0';

    // Daily collection trend (last 7 entries)
    const entries = dailyEntries || [];
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().slice(-7);
    const dailyTrend = sortedDates.map(date => {
        const dayEntries = entries.filter(e => e.date === date);
        const total = dayEntries.reduce((a, e) => a + safeInt(e.online) + safeInt(e.cash), 0);
        return { date, total };
    });

    // Busiest slot
    const slotCounts = {};
    all.forEach(s => {
        if (isEvening(s.plan)) slotCounts['Evening'] = (slotCounts['Evening'] || 0) + 1;
        else if (isAfternoon(s.plan)) slotCounts['Afternoon'] = (slotCounts['Afternoon'] || 0) + 1;
        else if (isTwoTime(s.plan)) slotCounts['2 Time'] = (slotCounts['2 Time'] || 0) + 1;
        else slotCounts['Other'] = (slotCounts['Other'] || 0) + 1;
    });
    const busiestSlot = Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0] || null;

    return {
        totalStudents: all.length,
        totalAmount, totalPaid: subscriptionsCollected,
        subscriptionsCollected, subscriptionsPending,
        collectionRate, avgRevenuePerStudent,
        newThisMonth, newLastMonth, retentionRate,
        planPopularity, vegCount, nonVegCount,
        avgHolidays, dailyTrend, busiestSlot
    };
}

module.exports = {
    KNOWN_PLANS,
    PLAN_OPTIONS,
    isUnusualPlan,
    isTwoTime,
    isEvening,
    isAfternoon,
    planDuration,
    totalMeals,
    planToMealSlot,
    parseLocalDate,
    safeInt,
    fmtDate,
    simulatePlan,
    holidayAffectsStudent,
    totalHolidays,
    messEndDate,
    remainingMeals,
    studentStatus,
    parseHolidays,
    computeInsights
};
