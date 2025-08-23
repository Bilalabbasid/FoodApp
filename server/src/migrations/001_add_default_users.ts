import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

/**
 * Migration: Add default users for all roles
 * Date: 2025-08-21
 * Description: Creates one user for each role (admin, kitchen, customer, rider)
 */
async function migration_add_default_users() {
  try {
    console.log('🔄 Starting migration: Add default users for all roles');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-orders');
    console.log('✅ Connected to MongoDB');

    // Check if users already exist to avoid duplicates
    const existingUsers = await User.find({
      email: {
        $in: [
          'admin@tastycrave.com',
          'kitchen@tastycrave.com', 
          'customer@example.com',
          'rider@tastycrave.com'
        ]
      }
    });

    const existingEmails = existingUsers.map(user => user.email);
    console.log('📋 Existing users found:', existingEmails);

    // Users to create
    const usersToCreate = [
      {
        email: 'admin@tastycrave.com',
        userData: {
          name: 'System Administrator',
          email: 'admin@tastycrave.com',
          phone: '+1-555-100-0001',
          hashedPassword: 'Admin123!',
          roles: ['admin', 'manager'],
          loyaltyPoints: 0,
          isEmailVerified: true,
          addresses: []
        }
      },
      {
        email: 'kitchen@tastycrave.com',
        userData: {
          name: 'Kitchen Manager',
          email: 'kitchen@tastycrave.com',
          phone: '+1-555-100-0002',
          hashedPassword: 'Kitchen123!',
          roles: ['kitchen', 'staff'],
          loyaltyPoints: 0,
          isEmailVerified: true,
          addresses: [{
            type: 'work',
            street: '456 Restaurant Row',
            city: 'New York',
            state: 'NY',
            zipCode: '10013',
            isDefault: true
          }]
        }
      },
      {
        email: 'customer@example.com',
        userData: {
          name: 'John Customer',
          email: 'customer@example.com',
          phone: '+1-555-100-0003',
          hashedPassword: 'Customer123!',
          roles: ['customer'],
          loyaltyPoints: 250,
          isEmailVerified: true,
          addresses: [{
            type: 'home',
            street: '123 Customer Lane',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            isDefault: true
          }, {
            type: 'work',
            street: '789 Business Plaza',
            city: 'New York',
            state: 'NY',
            zipCode: '10004',
            isDefault: false
          }]
        }
      },
      {
        email: 'rider@tastycrave.com',
        userData: {
          name: 'Delivery Rider',
          email: 'rider@tastycrave.com',
          phone: '+1-555-100-0004',
          hashedPassword: 'Rider123!',
          roles: ['rider'],
          loyaltyPoints: 0,
          isEmailVerified: true,
          addresses: [{
            type: 'home',
            street: '321 Rider Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10002',
            isDefault: true
          }]
        }
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const { email, userData } of usersToCreate) {
      if (existingEmails.includes(email)) {
        console.log(`⏭️  Skipping ${email} - already exists`);
        skippedCount++;
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${email} with roles: ${userData.roles.join(', ')}`);
      createdCount++;
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Users created: ${createdCount}`);
    console.log(`⏭️  Users skipped: ${skippedCount}`);
    console.log(`📋 Total users in system: ${await User.countDocuments()}`);
    
    if (createdCount > 0) {
      console.log('\n🔐 Login Credentials for new users:');
      console.log('👑 Admin: admin@tastycrave.com / Admin123!');
      console.log('👨‍🍳 Kitchen: kitchen@tastycrave.com / Kitchen123!');
      console.log('👤 Customer: customer@example.com / Customer123!');
      console.log('🏍️ Rider: rider@tastycrave.com / Rider123!');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migration_add_default_users();
}

export default migration_add_default_users;
