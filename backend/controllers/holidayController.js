const asyncHandler = require('../utils/asyncHandler');
const { Holiday, getHolidays, addHoliday, deleteHoliday, updateHoliday } = require('../models/holidayModel');
const { User } = require('../models/userModel');
const { holidayAffectsStudent } = require('../utils/calculations');

const stripAffectedPersonalHolidays = async (holiday) => {
    // Find any students who manually marked this exact date as a personal holiday
    const students = await User.find({ role: 'STUDENT', studentHolidays: holiday.dateStr });
    for (const s of students) {
        if (holidayAffectsStudent(holiday, s.plan)) {
            // Strip it out if the global holiday now covers their slot
            s.studentHolidays = s.studentHolidays.filter(d => d !== holiday.dateStr);
            await s.save();
        }
    }
};

// Get all holidays
const getHolidaysController = asyncHandler(async (req, res) => {
    const { year, month } = req.query;
    const query = {};
    if (req.user.messId) query.messId = req.user.messId;
    if (year && month) {
        const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
        query.dateStr = { $regex: `^${monthPrefix}` };
    } else if (year) {
        query.dateStr = { $regex: `^${year}` };
    }
    const holidays = await Holiday.find(query).sort({ dateStr: -1 });

    res.json(holidays.map(h => ({
        id: h._id.toString(),
        date: h.dateStr,
        slot: h.slot || 'Whole Day',
        reason: h.reason || h.name || '',
        name: h.name || h.reason || '',
        created_at: h.created_at
    })));
});

// Add a holiday
const addHolidayController = asyncHandler(async (req, res) => {
    const { date, name, slot, reason } = req.body;

    if (!date) {
        res.status(400);
        throw new Error('Date is required');
    }

    // Validate format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400);
        throw new Error('Date must be in YYYY-MM-DD format');
    }

    // Validate slot if provided
    const validSlots = ['Whole Day', 'Afternoon', 'Evening'];
    if (slot && !validSlots.includes(slot)) {
        res.status(400);
        throw new Error('Slot must be one of: Whole Day, Afternoon, Evening');
    }

    // Check if holiday exists for this date in this mess
    const existQuery = { dateStr: date };
    if (req.user.messId) existQuery.messId = req.user.messId;
    const existing = await Holiday.findOne(existQuery);
    if (existing) {
        res.status(400);
        throw new Error('Holiday already exists for this date');
    }

    const holiday = await Holiday.create({
        dateStr: date,
        name: name || reason || '',
        slot: slot || 'Whole Day',
        reason: reason || name || '',
        messId: req.user.messId
    });

    // Instantly remove this date from any affected students' personal holidays
    await stripAffectedPersonalHolidays(holiday);

    res.status(201).json({
        id: holiday._id.toString(),
        date: holiday.dateStr,
        slot: holiday.slot,
        reason: holiday.reason,
        name: holiday.name,
        created_at: holiday.created_at
    });
});

// Edit a holiday
const editHolidayController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, name, slot, reason } = req.body;

    const updates = {};
    if (date) updates.dateStr = date;
    if (name !== undefined) updates.name = name;
    if (slot) updates.slot = slot;
    if (reason !== undefined) updates.reason = reason;

    const holiday = await updateHoliday(id, updates);

    if (!holiday) {
        res.status(404);
        throw new Error('Holiday not found');
    }

    // Instantly remove this date from any affected students' personal holidays due to the edit
    await stripAffectedPersonalHolidays(holiday);

    res.json({
        id: holiday._id.toString(),
        date: holiday.dateStr,
        slot: holiday.slot,
        reason: holiday.reason,
        name: holiday.name,
        created_at: holiday.created_at
    });
});

// Delete a holiday
const deleteHolidayController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const holiday = await deleteHoliday(id);

    if (!holiday) {
        res.status(404);
        throw new Error('Holiday not found');
    }

    res.json({ message: 'Holiday deleted' });
});

module.exports = {
    getHolidays: getHolidaysController,
    addHoliday: addHolidayController,
    editHoliday: editHolidayController,
    deleteHoliday: deleteHolidayController
};
