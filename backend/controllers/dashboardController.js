const { getISTDate, getTodayStr } = require('../utils/dateUtils');
const { User } = require('../models/userModel');
const { Staff } = require('../models/staffModel');
const { Bill } = require('../models/billModel');
const { Expense } = require('../models/expenseModel');
const { SideIncome } = require('../models/sideIncomeModel');
const { Holiday } = require('../models/holidayModel');
const { DailyEntry } = require('../models/dailyEntryModel');
const {
    studentStatus, remainingMeals, messEndDate,
    totalMeals, isEvening, isAfternoon, isTwoTime,
    safeInt, computeInsights
} = require('../utils/calculations');

const getDashboardStats = async (req, res) => {
    try {
        // Initialize defaults
        let students = 0;
        let staff = 0;
        let revenue = 0;
        let pending = 0;
        let fixedExpense = 0;
        let staffPayments = 0;
        let operationalExpense = 0;
        let sideIncome = 0;
        let monthlyStats = [];
        const now = getISTDate();
        let currentMonthExpense = {
            fixed: 0,
            operational: 0,
            total: 0,
            month: now.toLocaleString('default', { month: 'long' }),
            year: now.getFullYear()
        };

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Query stats
        try {
            students = await User.countDocuments({ role: 'STUDENT', status: 'ACTIVE', isDeleted: false });
        } catch (e) {
            console.error('Dashboard: Failed to get student count', e.message);
        }

        try {
            staff = await Staff.countDocuments({ status: 'ACTIVE' });
        } catch (e) {
            console.log('Dashboard: Staff count failed');
        }

        try {
            const revResult = await User.aggregate([
                { $match: { role: 'STUDENT', status: 'ACTIVE', isDeleted: false } },
                { $group: { _id: null, total: { $sum: { $convert: { input: '$paid', to: 'double', onError: 0, onNull: 0 } } } } }
            ]);
            revenue = revResult.length > 0 ? revResult[0].total : 0;
        } catch (e) {
            console.error('Dashboard: Failed to get revenue', e.message);
        }

        try {
            const penResult = await User.aggregate([
                { $match: { role: 'STUDENT', status: 'ACTIVE', isDeleted: false } },
                {
                    $project: {
                        pendingAmount: {
                            $max: [0, {
                                $subtract: [
                                    { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } },
                                    { $convert: { input: '$paid', to: 'double', onError: 0, onNull: 0 } }
                                ]
                            }]
                        }
                    }
                },
                { $group: { _id: null, total: { $sum: '$pendingAmount' } } }
            ]);
            pending = penResult.length > 0 ? penResult[0].total : 0;
        } catch (e) {
            console.error('Dashboard: Failed to get pending', e.message);
        }

        try {
            const fixedExpResult = await Staff.aggregate([
                { $match: { status: 'ACTIVE' } },
                { $group: { _id: null, total: { $sum: '$salary' } } }
            ]);
            fixedExpense = fixedExpResult.length > 0 ? fixedExpResult[0].total : 0;
        } catch (e) {
            console.log('Dashboard: Fixed expense aggregation failed');
        }

        try {
            const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const opExpResult = await Expense.aggregate([
                { $match: { dateStr: { $regex: `^${monthPrefix}` } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            operationalExpense = opExpResult.length > 0 ? opExpResult[0].total : 0;
        } catch (e) {
            console.log('Dashboard: Operational expenses aggregation failed');
        }

        try {
            const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const sideIncomeResult = await SideIncome.aggregate([
                { $match: { dateStr: { $regex: `^${monthPrefix}` } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            sideIncome = sideIncomeResult.length > 0 ? sideIncomeResult[0].total : 0;
        } catch (e) {
            console.log('Dashboard: Side income aggregation failed');
        }

        const totalExpense = fixedExpense + operationalExpense;

        // Monthly breakdown - Replaced with Live Cycle representation Since we drop monthly cache
        try {
            monthlyStats = [{
                month: now.toLocaleString('default', { month: 'long' }),
                year: now.getFullYear(),
                revenue: revenue,
                pending: pending,
                totalBills: students
            }];
        } catch (e) {
            console.error('Dashboard: Failed to get monthly stats', e.message);
        }

        currentMonthExpense.fixed = fixedExpense;
        currentMonthExpense.operational = operationalExpense;
        currentMonthExpense.total = fixedExpense + operationalExpense;

        const totalRevenue = revenue + sideIncome;

        // ===== NEW: Business Insights from calculations.js =====
        let insights = {};
        try {
            const allStudents = await User.find({ role: 'STUDENT', isDeleted: false });
            const holidays = await Holiday.find({});
            const dailyEntries = await DailyEntry.find({});

            const holsFormatted = holidays.map(h => ({
                date: h.dateStr,
                slot: h.slot || 'Whole Day',
                reason: h.reason || h.name || ''
            }));

            const boys = allStudents.filter(s => (s.gender || 'boys') === 'boys').map(s => s.toObject());
            const girls = allStudents.filter(s => s.gender === 'girls').map(s => s.toObject());
            const entriesFormatted = dailyEntries.map(e => ({
                date: e.date,
                slot: e.slot,
                online: e.online || 0,
                cash: e.cash || 0
            }));

            insights = computeInsights(boys, girls, holsFormatted, entriesFormatted);

            // Status distribution
            const statusCounts = { active: 0, endingSoon: 0, duesPending: 0, messOver: 0, unusualPlan: 0, noDate: 0 };
            [...boys, ...girls].forEach(s => {
                const st = studentStatus(s, holsFormatted);
                if (st.label === 'Active') statusCounts.active++;
                else if (st.label === 'Ending Soon') statusCounts.endingSoon++;
                else if (st.label === 'Dues Pending') statusCounts.duesPending++;
                else if (st.label === 'Mess Over') statusCounts.messOver++;
                else if (st.label === 'Unusual Plan') statusCounts.unusualPlan++;
                else if (st.label === 'No Date') statusCounts.noDate++;
            });
            insights.statusCounts = statusCounts;
            insights.boysCount = boys.length;
            insights.girlsCount = girls.length;
        } catch (e) {
            console.error('Dashboard: Failed to compute insights', e.message);
        }

        res.json({
            stats: {
                students,
                staff,
                revenue: totalRevenue,
                billRevenue: revenue,
                sideIncome,
                pending,
                expense: totalExpense,
                fixedExpense,
                operationalExpense,
                netIncome: totalRevenue - totalExpense
            },
            monthlyStats,
            currentMonthExpense,
            insights
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ message: 'Failed to load dashboard stats' });
    }
};

module.exports = { getDashboardStats };
