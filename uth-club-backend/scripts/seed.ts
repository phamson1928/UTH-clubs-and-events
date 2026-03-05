import { AppDataSource } from '../src/data-source';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');

        // Initialize the data source
        await AppDataSource.initialize();
        console.log('✅ Database connected.');

        // Path to the seed.sql file (assuming it's in the project root / database / seed.sql)
        // Adjust path based on relative position
        const seedFilePath = path.join(__dirname, '../../database/seed.sql');

        if (!fs.existsSync(seedFilePath)) {
            console.error(`❌ Seed file not found at: ${seedFilePath}`);
            process.exit(1);
        }

        const sql = fs.readFileSync(seedFilePath, 'utf8');

        console.log('🚀 Executing SQL...');
        await AppDataSource.query(sql);

        console.log('✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seed();
