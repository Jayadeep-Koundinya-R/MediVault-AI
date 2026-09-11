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
