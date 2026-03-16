/**
 * Seed script: Creates the default Super Admin account
 * Run: node backend/seedSuperAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const { User, findUserByMobile } = require('./models/userModel');

const SUPER_ADMIN_MOBILE = '9999999999';
const SUPER_ADMIN_PASSWORD = 'admin123';
const SUPER_ADMIN_NAME = 'Super Admin';

const seed = async () => {
    try {
        await connectDB();

        // Check if super admin already exists
        const existing = await findUserByMobile(SUPER_ADMIN_MOBILE);
        if (existing) {
            console.log('✅ Super Admin already exists:');
            console.log(`   Mobile: ${SUPER_ADMIN_MOBILE}`);
            console.log(`   Role: ${existing.role}`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, salt);

        const superAdmin = await User.create({
            name: SUPER_ADMIN_NAME,
            mobile: SUPER_ADMIN_MOBILE,
            email: 'admin@messmanagement.com',
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
            messId: null, // Super admin is not scoped to any mess
            status: 'ACTIVE'
        });

        console.log('✅ Super Admin created successfully!');
        console.log('========================================');
        console.log(`   Name:     ${SUPER_ADMIN_NAME}`);
        console.log(`   Mobile:   ${SUPER_ADMIN_MOBILE}`);
        console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
        console.log(`   Role:     SUPER_ADMIN`);
        console.log('========================================');
        console.log('⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seed();
