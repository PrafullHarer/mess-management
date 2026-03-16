const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Fetch full user to get messId
            const user = await User.findById(decoded.id).select('-passwordHash');
            if (!user || user.isDeleted) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            
            req.user = {
                id: user._id.toString(),
                role: user.role,
                messId: user.messId ? user.messId.toString() : null,
                name: user.name
            };
            return next();
        } catch (error) {
            if (!res.headersSent) {
                res.status(401);
                throw new Error('Not authorized, token failed');
            }
        }
    } else if (req.cookies && req.cookies.token) {
        try {
            token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.id).select('-passwordHash');
            if (!user || user.isDeleted) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            
            req.user = {
                id: user._id.toString(),
                role: user.role,
                messId: user.messId ? user.messId.toString() : null,
                name: user.name
            };
            return next();
        } catch (error) {
            if (!res.headersSent) {
                res.status(401);
                throw new Error('Not authorized, token failed');
            }
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Only SUPER_ADMIN
const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized — Super Admin access required');
    }
};

// OWNER or SUPER_ADMIN (mess management level)
const ownerOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'OWNER' || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an owner');
    }
};

// OWNER, MANAGER, or SUPER_ADMIN (anyone who can manage a mess)
const messStaffOnly = (req, res, next) => {
    if (req.user && ['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(req.user.role)) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized — staff access required');
    }
};

module.exports = { protect, superAdminOnly, ownerOnly, messStaffOnly };