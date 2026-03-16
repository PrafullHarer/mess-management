const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { User, createUser, findUserByMobile } = require('../models/userModel');
const { Mess, createMess, getAllMesses, getMessById, updateMess } = require('../models/messModel');

// ========================
// MESS MANAGEMENT
// ========================

// GET /api/super-admin/messes — List all messes
const listMesses = asyncHandler(async (req, res) => {
    const messes = await getAllMesses();

    // Enrich with counts
    const enriched = await Promise.all(messes.map(async (mess) => {
        const messObj = mess.toJSON();
        const studentCount = await User.countDocuments({ messId: mess._id, role: 'STUDENT', isDeleted: false });
        const staffCount = await User.countDocuments({ messId: mess._id, role: { $in: ['OWNER', 'MANAGER'] }, isDeleted: false });
        return { ...messObj, studentCount, staffCount };
    }));

    res.json(enriched);
});

// POST /api/super-admin/messes — Create a mess + its owner
const createMessWithOwner = asyncHandler(async (req, res) => {
    const { messName, messAddress, messPhone, ownerName, ownerMobile, ownerEmail, ownerPassword } = req.body;

    // Validate
    if (!messName || !messName.trim()) {
        res.status(400); throw new Error('Mess name is required');
    }
    if (!ownerName || !ownerName.trim()) {
        res.status(400); throw new Error('Owner name is required');
    }
    if (!ownerMobile || ownerMobile.replace(/\D/g, '').length !== 10) {
        res.status(400); throw new Error('Valid 10-digit mobile number is required for owner');
    }
    if (!ownerPassword) {
        res.status(400); throw new Error('Owner password is required');
    }

    // Check duplicate mobile
    const cleanMobile = ownerMobile.replace(/\D/g, '');
    if (await findUserByMobile(cleanMobile)) {
        res.status(400); throw new Error('User with this mobile already exists');
    }

    // Create the mess first
    const mess = await createMess({
        name: messName.trim(),
        address: messAddress || '',
        phone: messPhone || '',
        status: 'ACTIVE'
    });

    // Create the owner user, linked to this mess
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ownerPassword, salt);

    const owner = await createUser({
        name: ownerName.trim(),
        email: ownerEmail || '',
        mobile: cleanMobile,
        passwordHash: hashedPassword,
        role: 'OWNER',
        messId: mess._id,
        status: 'ACTIVE'
    });

    // Update mess with owner reference
    mess.ownerId = owner._id;
    await mess.save();

    res.status(201).json({
        mess: { id: mess._id, name: mess.name, address: mess.address },
        owner: { id: owner._id, name: owner.name, mobile: owner.mobile }
    });
});

// PUT /api/super-admin/messes/:id — Update a mess
const editMess = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, status } = req.body;

    const mess = await getMessById(id);
    if (!mess) {
        res.status(404); throw new Error('Mess not found');
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (address !== undefined) updates.address = address;
    if (phone !== undefined) updates.phone = phone;
    if (status) updates.status = status;

    const updated = await updateMess(id, updates);
    res.json(updated);
});

// DELETE /api/super-admin/messes/:id — Suspend a mess
const suspendMess = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const mess = await getMessById(id);
    if (!mess) {
        res.status(404); throw new Error('Mess not found');
    }

    // Suspend the mess
    await updateMess(id, { status: 'SUSPENDED' });

    // Deactivate all users in this mess
    await User.updateMany(
        { messId: id, isDeleted: false },
        { status: 'INACTIVE' }
    );

    res.json({ message: `Mess "${mess.name}" suspended and all users deactivated` });
});

// ========================
// OWNER MANAGEMENT
// ========================

// GET /api/super-admin/owners — List all owners
const listOwners = asyncHandler(async (req, res) => {
    const owners = await User.find({
        role: 'OWNER',
        isDeleted: false
    }).populate('messId', 'name address status').sort({ createdAt: -1 });

    res.json(owners.map(o => ({
        id: o._id,
        name: o.name,
        email: o.email,
        mobile: o.mobile,
        status: o.status,
        mess: o.messId ? { id: o.messId._id, name: o.messId.name, status: o.messId.status } : null,
        createdAt: o.createdAt
    })));
});

// DELETE /api/super-admin/owners/:id — Remove an owner
const removeOwner = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const owner = await User.findById(id);

    if (!owner || owner.role !== 'OWNER') {
        res.status(404); throw new Error('Owner not found');
    }

    // Soft-delete the owner
    owner.isDeleted = true;
    owner.status = 'INACTIVE';
    await owner.save();

    res.json({ message: 'Owner removed' });
});

// ========================
// PLATFORM STATS
// ========================
const getPlatformStats = asyncHandler(async (req, res) => {
    const totalMesses = await Mess.countDocuments({ status: { $ne: 'INACTIVE' } });
    const activeMesses = await Mess.countDocuments({ status: 'ACTIVE' });
    const totalOwners = await User.countDocuments({ role: 'OWNER', isDeleted: false });
    const totalStudents = await User.countDocuments({ role: 'STUDENT', isDeleted: false });
    const totalManagers = await User.countDocuments({ role: 'MANAGER', isDeleted: false });

    res.json({
        totalMesses,
        activeMesses,
        totalOwners,
        totalStudents,
        totalManagers
    });
});

module.exports = {
    listMesses,
    createMessWithOwner,
    editMess,
    suspendMess,
    listOwners,
    removeOwner,
    getPlatformStats
};
