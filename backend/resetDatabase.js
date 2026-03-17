/**
 * Database Reset Script
 * This script will DELETE ALL DATA from the database
 * and recreate the default Super Admin account.
 * 
 * Run: node backend/resetDatabase.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models to ensure they are registered and can be cleared
const modelsDir = require('path').join(__dirname, 'models');
const fs = require('fs');

const clearDatabase = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        await mongoose.connect(dbUrl);
        console.log('✅ Connected to database.');

        const collections = await mongoose.connection.db.collections();
        
        console.log('🧹 Clearing all collections...');
        for (let collection of collections) {
            await collection.deleteMany({});
            console.log(`   - Cleared: ${collection.collectionName}`);
        }
        console.log('✅ Database cleared successfully.');

        // Re-seed Super Admin
        console.log('🌱 Creating default Super Admin...');
        const SUPER_ADMIN_MOBILE = '9999999999';
        const SUPER_ADMIN_PASSWORD = 'admin123';
        
        // Define a simple User schema for seeding to avoid complex dependencies
        const userSchema = new mongoose.Schema({
            name: String,
            mobile: String,
            email: String,
            passwordHash: String,
            role: String,
            status: String,
            messId: mongoose.Schema.Types.ObjectId
        }, { strict: false });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, salt);

        await User.create({
            name: 'Super Admin',
            mobile: SUPER_ADMIN_MOBILE,
            email: 'admin@messmanagement.com',
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
            messId: null,
            status: 'ACTIVE'
        });

        console.log('✅ Super Admin created successfully!');
        console.log('========================================');
        console.log(`   Mobile:   ${SUPER_ADMIN_MOBILE}`);
        console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
        console.log('========================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Reset failed:', error.message);
        process.exit(1);
    }
};

clearDatabase();
