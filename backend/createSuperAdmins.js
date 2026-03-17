/**
 * Script to create specific Super Admin accounts
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const admins = [
    {
        name: 'Prafull Harer',
        mobile: '7387533549',
        email: 'prafullharer@gmail.com',
        password: 'prafull@2025'
    },
    {
        name: 'Aadityaa Sharma',
        mobile: '8888888888',
        email: 'aaditya@messmanagement.com',
        password: 'aaditya@2025'
    }
];

const seedAdmins = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        
        const userSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', userSchema);

        console.log('🌱 Creating Super Admins...');
        for (let admin of admins) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(admin.password, salt);

            // Check if exists
            const existing = await User.findOne({ mobile: admin.mobile });
            if (existing) {
                console.log(`⚠️  Admin with mobile ${admin.mobile} already exists. Updating role and password...`);
                existing.role = 'SUPER_ADMIN';
                existing.passwordHash = hashedPassword;
                existing.name = admin.name;
                await existing.save();
            } else {
                await User.create({
                    name: admin.name,
                    mobile: admin.mobile,
                    email: admin.email,
                    passwordHash: hashedPassword,
                    role: 'SUPER_ADMIN',
                    status: 'ACTIVE',
                    messId: null
                });
                console.log(`✅ Created Super Admin: ${admin.name}`);
            }
        }

        console.log('========================================');
        admins.forEach(a => {
            console.log(`   Name:     ${a.name}`);
            console.log(`   Mobile:   ${a.mobile}`);
            console.log(`   Password: ${a.password}`);
            console.log('----------------------------------------');
        });
        console.log('========================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
};

seedAdmins();
