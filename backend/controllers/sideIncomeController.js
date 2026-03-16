const {
    SideIncome,
    createSideIncome,
    getSideIncomeByMonth,
    getMonthlyTotals,
    updateSideIncome,
    deleteSideIncome,
    getSideIncomeById,
    isWithinEditWindow,
    isFutureDate
} = require('../models/sideIncomeModel');
const { getTodayStr } = require('../utils/dateUtils');

// Add new side income entry
const addIncome = async (req, res) => {
    try {
        const { category, amount, description, date } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ message: 'Category and amount are required' });
        }

        // Validate custom category has description
        if (category === 'CUSTOM' && !description) {
            return res.status(400).json({ message: 'Description is required for custom income' });
        }

        const income = await SideIncome.create({
            category,
            amount: parseFloat(amount),
            description: description || '',
            createdBy: req.user.id,
            dateStr: date || getTodayStr(),
            messId: req.user.messId
        });

        res.status(201).json(income);
    } catch (error) {
        console.error('Add side income error:', error);
        res.status(400).json({ message: error.message || 'Failed to add income' });
    }
};

// Get income by month (and optional category)
const getIncomeByMonth = async (req, res) => {
    try {
        const today = new Date();
        const year = parseInt(req.query.year) || today.getFullYear();
        const month = parseInt(req.query.month) || today.getMonth() + 1;
        const category = req.query.category || null;

        const query = { dateStr: { $regex: `^${year}-${String(month).padStart(2, '0')}` } };
        if (req.user.messId) query.messId = req.user.messId;
        if (category) query.category = category;
        const income = await SideIncome.find(query).sort({ dateStr: -1 }).populate('createdBy', 'name');

        // Add editable flag to each entry
        const incomeWithEditFlag = income.map(item => {
            const itemObj = item.toJSON();
            itemObj.editable = isWithinEditWindow(item.dateStr);
            return itemObj;
        });

        res.json({ income: incomeWithEditFlag });
    } catch (error) {
        console.error('Get side income error:', error);
        res.status(500).json({ message: 'Failed to fetch income' });
    }
};

// Get monthly stats
const getStats = async (req, res) => {
    try {
        const today = new Date();
        const year = parseInt(req.query.year) || today.getFullYear();
        const month = parseInt(req.query.month) || today.getMonth() + 1;

        const query = { dateStr: { $regex: `^${year}-${String(month).padStart(2, '0')}` } };
        if (req.user.messId) query.messId = req.user.messId;
        
        const result = await SideIncome.aggregate([
            { $match: query },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const totals = { SNACKS: { total: 0, count: 0 }, PANI_PURI: { total: 0, count: 0 }, CUSTOM: { total: 0, count: 0 }, grandTotal: 0 };
        result.forEach(item => { totals[item._id] = { total: item.total, count: item.count }; totals.grandTotal += item.total; });

        res.json(totals);
    } catch (error) {
        console.error('Get side income stats error:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

// Update income entry
const editIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, description, date, category } = req.body;

        const updates = {};
        if (amount !== undefined) updates.amount = parseFloat(amount);
        if (description !== undefined) updates.description = description;
        if (date !== undefined) updates.dateStr = date;
        if (category !== undefined) updates.category = category;

        const income = await updateSideIncome(id, updates, req.user._id);

        res.json(income);
    } catch (error) {
        console.error('Update side income error:', error);
        res.status(400).json({ message: error.message || 'Failed to update income' });
    }
};

// Delete income entry
const removeIncome = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteSideIncome(id);

        res.json({ message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Delete side income error:', error);
        res.status(400).json({ message: error.message || 'Failed to delete income' });
    }
};

// Get valid date range for adding income
const getValidDateRange = async (req, res) => {
    try {
        const todayStr = getTodayStr();
        const today = new Date(todayStr + 'T00:00:00+05:30');
        const minDate = new Date(today);
        minDate.setFullYear(minDate.getFullYear() - 1); // Allow up to 1 year back

        const minDateStr = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;

        res.json({
            minDate: minDateStr,
            maxDate: todayStr
        });
    } catch (error) {
        console.error('Get date range error:', error);
        res.status(500).json({ message: 'Failed to get date range' });
    }
};

module.exports = {
    addIncome,
    getIncomeByMonth,
    getStats,
    editIncome,
    removeIncome,
    getValidDateRange
};
