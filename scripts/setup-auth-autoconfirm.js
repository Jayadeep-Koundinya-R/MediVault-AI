import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ucdrhwdyzoateiqlybvh:arisearo7%40123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sql = `
    CREATE OR REPLACE FUNCTION public.auto_confirm_user()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.email_confirmed_at IS NULL THEN
        NEW.email_confirmed_at = now();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
    CREATE TRIGGER auto_confirm_user_trigger
      BEFORE INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.auto_confirm_user();

    UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
  `;

  await client.query(sql);
  console.log('Auto-confirm trigger created and existing users confirmed!');
  await client.end();
}

main().catch(console.error);
