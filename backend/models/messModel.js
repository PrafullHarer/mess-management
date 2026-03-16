const mongoose = require('mongoose');

const messSchema = mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'], default: 'ACTIVE' },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
        }
    }
});

const Mess = mongoose.model('Mess', messSchema);

const createMess = async (data) => {
    return await Mess.create(data);
};

const getAllMesses = async () => {
    return await Mess.find().populate('ownerId', 'name mobile email').sort({ createdAt: -1 });
};

const getMessById = async (id) => {
    return await Mess.findById(id).populate('ownerId', 'name mobile email');
};

const updateMess = async (id, updates) => {
    return await Mess.findByIdAndUpdate(id, updates, { new: true });
};

const deleteMess = async (id) => {
    return await Mess.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
};

module.exports = { Mess, createMess, getAllMesses, getMessById, updateMess, deleteMess };
