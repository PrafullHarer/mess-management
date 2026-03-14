const asyncHandler = require('../utils/asyncHandler');
const { DailyEntry, getDailyEntries, addDailyEntry, updateDailyEntry, deleteDailyEntry } = require('../models/dailyEntryModel');

// Get all daily entries
const getDailyEntriesController = asyncHandler(async (req, res) => {
    const { year, month } = req.query;
    const entries = await getDailyEntries(year, month);

    res.json(entries.map(e => ({
        id: e._id.toString(),
        date: e.date,
        slot: e.slot,
        online: e.online || 0,
        cash: e.cash || 0,
        total: (e.online || 0) + (e.cash || 0),
        created_at: e.created_at
    })));
});

// Add a daily entry
const addDailyEntryController = asyncHandler(async (req, res) => {
    const { date, slot, online, cash } = req.body;

    if (!date) {
        res.status(400);
        throw new Error('Date is required');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400);
        throw new Error('Date must be in YYYY-MM-DD format');
    }


    const entry = await addDailyEntry({
        date,
        slot: slot || 'Daily',
        online: parseInt(online) || 0,
        cash: parseInt(cash) || 0
    });

    res.status(201).json({
        id: entry._id.toString(),
        date: entry.date,
        slot: entry.slot,
        online: entry.online,
        cash: entry.cash,
        total: entry.online + entry.cash,
        created_at: entry.created_at
    });
});

// Edit a daily entry
const editDailyEntryController = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date, slot, online, cash } = req.body;

    const updates = {};
    if (date) updates.date = date;
    if (slot) updates.slot = slot;
    if (online !== undefined) updates.online = parseInt(online) || 0;
    if (cash !== undefined) updates.cash = parseInt(cash) || 0;

    const entry = await updateDailyEntry(id, updates);

    if (!entry) {
        res.status(404);
        throw new Error('Daily entry not found');
    }

    res.json({
        id: entry._id.toString(),
        date: entry.date,
        slot: entry.slot,
        online: entry.online,
        cash: entry.cash,
        total: entry.online + entry.cash,
        created_at: entry.created_at
    });
});

// Delete a daily entry
const deleteDailyEntryController = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const entry = await deleteDailyEntry(id);

    if (!entry) {
        res.status(404);
        throw new Error('Daily entry not found');
    }

    res.json({ message: 'Daily entry deleted' });
});

module.exports = {
    getDailyEntries: getDailyEntriesController,
    addDailyEntry: addDailyEntryController,
    editDailyEntry: editDailyEntryController,
    deleteDailyEntry: deleteDailyEntryController
};
