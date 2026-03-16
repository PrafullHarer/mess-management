const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { User, createUser, findUserByMobile } = require('../models/userModel');
const { Mess, createMess, getAllMesses, getMessById, updateMess } = require('../models/messModel');
const { DailyEntry } = require('../models/dailyEntryModel');
const { Expense } = require('../models/expenseModel');
const { SideIncome } = require('../models/sideIncomeModel');
const { Holiday } = require('../models/holidayModel');
const { Attendance } = require('../models/attendanceModel');
const { Bill } = require('../models/billModel');
const { MealRequest } = require('../models/mealRequestModel');
const { Staff, StaffPayment } = require('../models/staffModel');

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

// DELETE /api/super-admin/messes/:id — Delete a mess and all its data
const deleteMess = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const mess = await getMessById(id);
    if (!mess) {
        res.status(404); throw new Error('Mess not found');
    }

    // Delete all linked records
    await DailyEntry.deleteMany({ messId: id });
    await Expense.deleteMany({ messId: id });
    await SideIncome.deleteMany({ messId: id });
    await Holiday.deleteMany({ messId: id });
    await Attendance.deleteMany({ messId: id });
    await Bill.deleteMany({ messId: id });
    await MealRequest.deleteMany({ messId: id });
    await Staff.deleteMany({ messId: id });
    await StaffPayment.deleteMany({ messId: id });

    // Hard delete all users in this mess so they cannot login
    await User.deleteMany({ messId: id });

    // Finally, delete the mess itself
    await Mess.findByIdAndDelete(id);

    res.json({ message: `Mess "${mess.name}" and all related data completely deleted.` });
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

// ========================
// SYSTEM HEALTH
// ========================
const mongoose = require('mongoose');
const os = require('os');

const getSystemHealth = asyncHandler(async (req, res) => {
    const healthData = {};

    // 1. Database Connection
    const dbState = mongoose.connection.readyState;
    const dbStateMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
    healthData.database = {
        status: dbStateMap[dbState] || 'Unknown',
        healthy: dbState === 1,
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A',
    };

    // 2. DB Ping (latency test)
    try {
        const pingStart = Date.now();
        await mongoose.connection.db.admin().ping();
        healthData.database.pingMs = Date.now() - pingStart;
    } catch (err) {
        healthData.database.pingMs = null;
        healthData.database.pingError = err.message;
    }

    // 3. Collection Stats
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionStats = [];
        for (const col of collections) {
            try {
                const stats = await mongoose.connection.db.collection(col.name).estimatedDocumentCount();
                const dataSize = await mongoose.connection.db.collection(col.name).aggregate([
                    { $group: { _id: null, size: { $sum: { $bsonSize: '$$ROOT' } } } }
                ]).toArray();
                collectionStats.push({
                    name: col.name,
                    documentCount: stats,
                    sizeBytes: dataSize[0]?.size || 0,
                });
            } catch {
                collectionStats.push({ name: col.name, documentCount: 'Error', sizeBytes: 0 });
            }
        }
        healthData.collections = collectionStats;
        healthData.totalCollections = collections.length;
    } catch (err) {
        healthData.collections = [];
        healthData.collectionsError = err.message;
    }

    // 4. Server Info
    const memUsage = process.memoryUsage();
    healthData.server = {
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: `${os.platform()} ${os.arch()}`,
        mongooseVersion: mongoose.version,
        memory: {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            rss: memUsage.rss,
            external: memUsage.external,
        },
        cpuCount: os.cpus().length,
        totalSystemMemory: os.totalmem(),
        freeSystemMemory: os.freemem(),
        loadAvg: os.loadavg(),
    };

    // 5. Environment Checks
    healthData.environment = {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        port: process.env.PORT || 5000,
        isVercel: !!process.env.VERCEL,
    };

    // 6. Overall Status
    healthData.status = healthData.database.healthy ? 'healthy' : 'degraded';
    healthData.timestamp = new Date().toISOString();

    res.json(healthData);
});

module.exports = {
    listMesses,
    createMessWithOwner,
    editMess,
    deleteMess,
    listOwners,
    removeOwner,
    getPlatformStats,
    getSystemHealth
};
