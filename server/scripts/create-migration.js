#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Creates a new migration file with a timestamp prefix
 */

function createMigration() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: Migration name is required');
    console.log('Usage: npm run migrate:create <migration_name>');
    console.log('Example: npm run migrate:create add_user_preferences');
    process.exit(1);
  }

  const migrationName = args[0];
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').slice(0, 14);
  const filename = `${timestamp}_${migrationName}.ts`;
  
  const migrationsDir = path.join(__dirname, '../src/migrations');
  const migrationPath = path.join(migrationsDir, filename);

  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const template = `import mongoose from 'mongoose';

/**
 * Migration: ${migrationName}
 * Created: ${new Date().toISOString()}
 */

export default async function migration() {
  console.log('🔄 Running migration: ${migrationName}');
  
  try {
    // Add your migration logic here
    // Example:
    // const User = mongoose.model('User');
    // await User.updateMany({}, { newField: 'defaultValue' });
    
    console.log('✅ Migration ${migrationName} completed successfully');
  } catch (error) {
    console.error('❌ Migration ${migrationName} failed:', error);
    throw error;
  }
}
`;

  try {
    fs.writeFileSync(migrationPath, template);
    console.log('✅ Migration file created successfully!');
    console.log(`📁 File: ${migrationPath}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Edit the migration file to add your migration logic');
    console.log('2. Run: npm run migrate');
  } catch (error) {
    console.error('❌ Error creating migration file:', error);
    process.exit(1);
  }
}

createMigration();
