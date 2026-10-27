import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY = 'psl_supabase_credentials';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConnected: true,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isConnected: true,
        };
      }
    }
  } catch (err) {
    console.error('Error reading stored Supabase config:', err);
  }

  return {
    url: '',
    anonKey: '',
    isConnected: false,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  } catch (err) {
    console.error('Failed to save Supabase config', err);
  }
}

export function clearStoredSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear Supabase config', err);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.isConnected) {
    return null;
  }

  if (!supabaseInstance || (supabaseInstance as any)?.supabaseUrl !== config.url) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.error('Could not initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}
