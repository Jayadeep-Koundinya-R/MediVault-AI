import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ucdrhwdyzoateiqlybvh:arisearo7%40123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function main() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260911000002_healthvault_2_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing Migration 2 SQL...');
    await client.query(sql);
    console.log('Migration 2 executed successfully!');

    // Verify all tables were created
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('All Public Tables now in database:', res.rows.map(r => r.table_name));

    // Verify columns on profiles
    const profCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND table_schema = 'public';
    `);
    console.log('Profiles table columns:', profCols.rows);

  } catch (err) {
    console.error('Migration 2 failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
