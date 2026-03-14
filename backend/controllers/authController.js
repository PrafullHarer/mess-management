const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { findUserByMobile, findUserById, createUser, User, deleteUser } = require('../models/userModel');

const login = asyncHandler(async (req, res) => {
    const { mobile, password } = req.body;
    console.log(`[AUTH] Login Attempt: Mobile=${mobile}`);

    const user = await findUserByMobile(mobile);

    // Debugging logs
    if (user) {
        console.log(`[AUTH] User found: ${user._id}`);
        console.log(`[AUTH] User Status: ${user.status}, isDeleted: ${user.isDeleted}`);
        console.log(`[AUTH] Stored Hash starts with: ${user.passwordHash ? user.passwordHash.substring(0, 10) : 'MISSING'}`);
    } else {
        console.log(`[AUTH] User ${mobile} returned NULL from findUserByMobile`);
    }

    // Block if user is deleted or inactive
    if (user && user.isDeleted) {
        console.log(`[AUTH] User ${mobile} is DELETED`);
        res.status(401);
        throw new Error('This account has been deactivated');
    }

    if (user && user.status === 'INACTIVE') {
        console.log(`[AUTH] User ${mobile} is INACTIVE`);
        res.status(401);
        throw new Error('This account is inactive');
    }

    if (!user) {
        console.log(`[AUTH] User ${mobile} NOT FOUND`);
        res.status(401);
        throw new Error('Invalid mobile or password');
    }

    console.log(`[AUTH] User found: ${user._id} (Role: ${user.role})`);
    console.log(`[AUTH] Comparing password...`);
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (isMatch) {
        console.log(`[AUTH] Password Valid. Generating Token...`);
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            user: { id: user._id, name: user.name, role: user.role, mobile: user.mobile },
            token: token
        });
        console.log(`[AUTH] Login Successful for ${mobile}`);
    } else {
        console.log(`[AUTH] Password INVALID for ${mobile}`);
        res.status(401);
        throw new Error('Invalid mobile or password');
    }
});

const getMe = asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.id);
    if (user) {
        res.json({
            id: user.id,
            name: user.name,
            role: user.role,
            mobile: user.mobile,
            email: user.email || ''
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await findUserById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.mobile = req.body.mobile || user.mobile;

        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await findUserById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid current password');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
});

const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Name is required');
    }
    if (!mobile || mobile.replace(/\D/g, '').length !== 10) {
        res.status(400);
        throw new Error('Valid 10-digit mobile number is required');
    }
    if (!password) {
        res.status(400);
        throw new Error('Password is required');
    }

    if (await findUserByMobile(mobile.replace(/\D/g, ''))) {
        res.status(400);
        throw new Error('User with this mobile already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await createUser({
        name: name.trim(),
        email: email || '',
        mobile: mobile.replace(/\D/g, ''),
        passwordHash: hashedPassword,
        role: role || 'OWNER',
        status: 'ACTIVE'
    });

    res.status(201).json({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role
    });
});

const getAdmins = asyncHandler(async (req, res) => {
    const admins = await User.find({
        role: { $in: ['OWNER', 'MANAGER'] },
        isDeleted: false
    }).sort({ createdAt: -1 });

    res.json(admins.map(a => ({
        id: a._id,
        name: a.name,
        email: a.email,
        mobile: a.mobile,
        role: a.role,
        createdAt: a.createdAt
    })));
});

const removeAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent removing self
    if (id === req.user.id.toString()) {
        res.status(400);
        throw new Error('You cannot remove your own administrative access');
    }

    await deleteUser(id);
    res.json({ message: 'Administrative access removed' });
});

module.exports = { login, getMe, updateProfile, updatePassword, registerAdmin, getAdmins, removeAdmin };