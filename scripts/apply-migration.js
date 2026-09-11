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

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260911000001_initial_healthvault_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration SQL...');
    await client.query(sql);
    console.log('Migration executed successfully!');

    // Verify all tables were created
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Created tables in public schema:', res.rows.map(r => r.table_name));

    // Verify storage bucket
    const bucketRes = await client.query(`
      SELECT id, name, public FROM storage.buckets WHERE id = 'health-documents';
    `);
    console.log('Storage bucket status:', bucketRes.rows);

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
