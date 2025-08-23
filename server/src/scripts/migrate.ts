import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Migration Runner
 * Manages and executes database migrations
 */

interface Migration {
  filename: string;
  name: string;
  executed: boolean;
  executedAt?: Date;
}

// Simple migration tracking (in production, you'd use a proper migrations table)
const MIGRATIONS_FILE = join(__dirname, '../../.migrations.json');

function loadMigrationState(): Migration[] {
  try {
    if (fs.existsSync(MIGRATIONS_FILE)) {
      const data = fs.readFileSync(MIGRATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('⚠️  Could not load migration state:', error instanceof Error ? error.message : String(error));
  }
  return [];
}

function saveMigrationState(migrations: Migration[]) {
  try {
    fs.writeFileSync(MIGRATIONS_FILE, JSON.stringify(migrations, null, 2));
  } catch (error) {
    console.error('❌ Could not save migration state:', error);
  }
}

async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = join(__dirname, '../migrations');
  try {
    const files = fs.readdirSync(migrationsDir);
    return files
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .sort(); // Ensure migrations run in order
  } catch (error) {
    console.error('❌ Could not read migrations directory:', error);
    return [];
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Starting migration runner...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-orders');
    console.log('✅ Connected to MongoDB\n');

    // Load migration state
    const migrationState = loadMigrationState();
    const migrationFiles = await getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('📭 No migration files found');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration file(s):`);
    migrationFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');

    // Run pending migrations
    let executedCount = 0;

    for (const filename of migrationFiles) {
      const existingMigration = migrationState.find(m => m.filename === filename);
      
      if (existingMigration?.executed) {
        console.log(`⏭️  Skipping ${filename} - already executed on ${existingMigration.executedAt}`);
        continue;
      }

      console.log(`🔄 Running migration: ${filename}`);
      
      try {
        // Import and execute migration
        const migrationPath = join(__dirname, '../migrations', filename);
        const migration = await import(migrationPath);
        
        if (typeof migration.default === 'function') {
          await migration.default();
        } else {
          console.warn(`⚠️  Migration ${filename} does not export a default function`);
          continue;
        }

        // Update migration state
        const migrationIndex = migrationState.findIndex(m => m.filename === filename);
        const migrationRecord: Migration = {
          filename,
          name: filename.replace(/^\d+_/, '').replace(/\.(ts|js)$/, ''),
          executed: true,
          executedAt: new Date()
        };

        if (migrationIndex >= 0) {
          migrationState[migrationIndex] = migrationRecord;
        } else {
          migrationState.push(migrationRecord);
        }

        console.log(`✅ Migration ${filename} completed successfully\n`);
        executedCount++;
        
      } catch (error) {
        console.error(`❌ Migration ${filename} failed:`, error);
        throw error;
      }
    }

    // Save migration state
    saveMigrationState(migrationState);

    console.log('📊 Migration Summary:');
    console.log(`✅ Migrations executed: ${executedCount}`);
    console.log(`⏭️  Migrations skipped: ${migrationFiles.length - executedCount}`);
    console.log(`📋 Total migrations: ${migrationFiles.length}`);
    
    if (executedCount === 0) {
      console.log('\n🎯 All migrations are up to date!');
    } else {
      console.log('\n🎉 All migrations completed successfully!');
    }

  } catch (error) {
    console.error('\n❌ Migration runner failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
export default runMigrations;
