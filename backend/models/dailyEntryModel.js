const mongoose = require('mongoose');

const dailyEntrySchema = mongoose.Schema({
    date: { type: String, required: true },       // YYYY-MM-DD
    slot: {
        type: String,
        default: 'Daily'
    },
    online: { type: Number, default: 0 },          // Online payment amount
    cash: { type: Number, default: 0 },            // Cash payment amount
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
        }
    }
});

const DailyEntry = mongoose.model('DailyEntry', dailyEntrySchema);

const getDailyEntries = async (year, month) => {
    let query = {};
    if (year && month) {
        const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
        query.date = { $regex: `^${monthPrefix}` };
    } else if (year) {
        query.date = { $regex: `^${year}` };
    }
    return await DailyEntry.find(query).sort({ date: -1, slot: 1 });
};

const addDailyEntry = async (data) => {
    return await DailyEntry.create(data);
};

const updateDailyEntry = async (id, updates) => {
    return await DailyEntry.findByIdAndUpdate(id, updates, { new: true });
};

const deleteDailyEntry = async (id) => {
    return await DailyEntry.findByIdAndDelete(id);
};

module.exports = { DailyEntry, getDailyEntries, addDailyEntry, updateDailyEntry, deleteDailyEntry };
