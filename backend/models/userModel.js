const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: false },
    mobile: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['SUPER_ADMIN', 'OWNER', 'STUDENT', 'MANAGER'],
    },
    // Links user to a specific mess (null for SUPER_ADMIN)
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', default: null },
    status: { type: String, default: 'ACTIVE' },

    // ===== New Plan-Based Fields (from actions.js/calculations.js) =====
    plan: { type: String, default: '2 Time' },  // e.g. '1 Time Eve', '2 Time', '15 Days 1 Time Aftr'
    amount: { type: Number, default: 0 },         // Total amount charged
    paid: { type: Number, default: 0 },           // Amount paid so far
    diet: { type: String, enum: ['Veg', 'Non Veg'], default: 'Veg' },
    studentHolidays: { type: [String], default: [] },  // Personal holidays as ISO date strings
    paymentNotes: { type: String, default: '' },       // e.g. "700 on 1-Feb, 700 on 15-Feb"
    gender: { type: String, enum: ['boys', 'girls'], default: 'boys' },  // For boys/girls categorization

    // ===== Legacy / Backward-Compatible Fields =====
    monthlyFee: { type: Number, default: 0.00 },
    paymentMode: { type: String, default: 'PREPAID' },
    dailyRate: { type: Number, default: 0.00 },
    messType: { type: String, default: 'STANDARD' },
    // Store as YYYY-MM-DD string to avoid timezone issues
    joinedAt: { type: String },
    mealsPerDay: { type: Number, default: 2 },
    mealSlot: {
        type: String,
        enum: ['AFTERNOON', 'NIGHT', 'BOTH'],
        default: 'BOTH'
    },
    advanceBalance: { type: Number, default: 0 },

    // Meta
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.passwordHash;
        }
    },
    toObject: { virtuals: true }
});

// Partial unique index: allows duplicates if they are marked as deleted
userSchema.index({ mobile: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

const User = mongoose.model('User', userSchema);

// Helper functions
const findUserByMobile = async (mobile) => {
    return await User.findOne({ mobile, isDeleted: false });
};

const findUserById = async (id) => {
    return await User.findById(id);
};

const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

const getAllStudents = async (messId = null) => {
    const query = { role: 'STUDENT', isDeleted: false };
    if (messId) query.messId = messId;
    return await User.find(query).sort({ name: 1 });
};

const updateUser = async (id, updates) => {
    return await User.findByIdAndUpdate(id, updates, { new: true });
};

const deleteUser = async (id) => {
    return await User.findByIdAndUpdate(id, { isDeleted: true, status: 'INACTIVE' }, { new: true });
};

module.exports = {
    User,
    findUserByMobile,
    findUserById,
    createUser,
    getAllStudents,
    updateUser,
    deleteUser
};