import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// Replace these with your actual Supabase project credentials.
// In a real Vite project, you would use import.meta.env.VITE_SUPABASE_URL
// ------------------------------------------------------------------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (SUPABASE_URL === 'https://your-project.supabase.co') {
  console.warn('Supabase URL is missing. Please configure supabaseClient.ts');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * DATABASE SCHEMA REFERENCE
 * 
 * Table: profiles
 * - id: uuid (primary key, references auth.users.id)
 * - username: text (unique)
 * - full_name: text
 * - bio: text
 * - avatar_url: text
 * - theme_color: text
 * - links: jsonb
 * 
 * RLS Policies:
 * - Select: Enable for public (anon)
 * - Insert/Update: Enable for users based on (auth.uid() = id)
 */
