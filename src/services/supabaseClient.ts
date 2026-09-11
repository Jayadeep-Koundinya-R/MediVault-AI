// MediVault AI — Supabase Client Service
// Ready for live connection with your Supabase Project

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.SUPABASE_URL ||
  '';
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Realtime & Table Helpers
export async function fetchFromSupabase<T>(table: string): Promise<T[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.error(`Supabase fetch error on ${table}:`, error);
    return null;
  }
  return data as T[];
}

export async function insertIntoSupabase<T>(table: string, record: Partial<T>): Promise<T | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert([record as any]).select().single();
  if (error) {
    console.error(`Supabase insert error on ${table}:`, error);
    return null;
  }
  return data as T;
}
