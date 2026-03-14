const mongoose = require('mongoose');

const holidaySchema = mongoose.Schema({
    name: { type: String, default: '' },
    // Store as YYYY-MM-DD string to avoid timezone issues
    dateStr: { type: String, required: true, unique: true },
    // Slot: determines which meal plans are affected
    slot: {
        type: String,
        enum: ['Whole Day', 'Afternoon', 'Evening'],
        default: 'Whole Day'
    },
    // Reason/note for the holiday
    reason: { type: String, default: '' }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

const Holiday = mongoose.model('Holiday', holidaySchema);

const getHolidays = async (year, month) => {
    let query = {};

    if (year && month) {
        const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
        query.dateStr = { $regex: `^${monthPrefix}` };
    } else if (year) {
        query.dateStr = { $regex: `^${year}` };
    }

    return await Holiday.find(query).sort({ dateStr: -1 });
};

const addHoliday = async (dateStr, name, slot, reason) => {
    return await Holiday.create({
        dateStr,
        name: name || reason || '',
        slot: slot || 'Whole Day',
        reason: reason || name || ''
    });
};

const deleteHoliday = async (id) => {
    return await Holiday.findByIdAndDelete(id);
};

const updateHoliday = async (id, updates) => {
    return await Holiday.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = { Holiday, getHolidays, addHoliday, deleteHoliday, updateHoliday };
