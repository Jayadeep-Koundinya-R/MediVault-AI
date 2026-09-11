import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ucdrhwdyzoateiqlybvh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wnQzeGBtymVm9XuqmPLjAA_LUzO1QZJ';
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ucdrhwdyzoateiqlybvh:arisearo7%40123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres';

// Pool for server-side SQL operations
let pool: pg.Pool | null = null;

export function getPgPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', (err) => {
      console.error('Unexpected error on idle pg client', err);
    });
  }
  return pool;
}

/**
 * Creates an authenticated Supabase client for Route Handlers
 * extracts bearer token from Authorization header or cookie
 */
export function createServerSupabaseClient(accessToken?: string) {
  const options: Parameters<typeof createClient>[2] = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  };

  return createClient(supabaseUrl, supabaseAnonKey, options);
}

/**
 * Authenticates a user from request headers
 */
export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

  if (!token) {
    // Try reading sb-access-token from Cookie header
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/sb-access-token=([^;]+)/) || cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/);
    if (match && match[1]) {
      try {
        const decoded = decodeURIComponent(match[1]);
        if (decoded.startsWith('[') || decoded.startsWith('{')) {
          const parsed = JSON.parse(decoded);
          token = Array.isArray(parsed) ? parsed[0] : parsed.access_token;
        } else {
          token = decoded;
        }
      } catch {
        token = match[1];
      }
    }
  }

  if (!token) {
    return { user: null, token: null, error: 'Unauthorized: missing access token' };
  }

  const supabase = createServerSupabaseClient(token);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, token: null, error: error?.message || 'Unauthorized: invalid token' };
  }

  return { user, token, error: null };
}

/**
 * Authenticates a doctor and verifies their account_type and doctor profile
 */
export async function getAuthenticatedDoctor(request: Request) {
  const { user, token, error } = await getAuthenticatedUser(request);
  if (!user) {
    return { user: null, doctorProfile: null, token: null, error: error || 'Unauthorized' };
  }

  const pool = getPgPool();
  const res = await pool.query(
    `SELECT p.account_type, dp.* 
     FROM profiles p 
     LEFT JOIN doctor_profiles dp ON dp.user_id = p.id 
     WHERE p.id = $1`,
    [user.id]
  );

  const row = res.rows[0];
  if (!row || row.account_type !== 'doctor') {
    return { user: null, doctorProfile: null, token: null, error: 'Forbidden: Doctor account required' };
  }

  return { user, doctorProfile: row, token, error: null };
}

/**
 * Logs data access for auditing purposes
 */
export async function logAccess(params: {
  actorUserId: string;
  patientUserId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
}) {
  try {
    const pool = getPgPool();
    await pool.query(
      `INSERT INTO access_logs (actor_user_id, patient_user_id, action, resource_type, resource_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [params.actorUserId, params.patientUserId, params.action, params.resourceType, params.resourceId || null]
    );
  } catch (err) {
    console.warn('Failed to record access log:', err);
  }
}
