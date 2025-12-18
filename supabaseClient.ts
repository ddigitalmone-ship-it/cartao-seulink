import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

// Try to get env vars from standard process.env (Create React App) or import.meta.env (Vite)
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  return process.env[key];
}

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || process.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = SUPABASE_URL && SUPABASE_URL !== 'https://your-project.supabase.co' && SUPABASE_ANON_KEY;

// ------------------------------------------------------------------
// MOCK CLIENT IMPLEMENTATION (For Demo/Local purposes)
// ------------------------------------------------------------------
class MockSupabaseClient {
  auth = {
    getSession: async () => {
      const user = JSON.parse(localStorage.getItem('sb-mock-user') || 'null');
      return { data: { session: user ? { user } : null } };
    },
    onAuthStateChange: (callback: any) => {
      // Simple mock subscription
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email }: any) => {
      // Mock login - accepts any password
      const user = { id: 'mock-user-id', email };
      localStorage.setItem('sb-mock-user', JSON.stringify(user));
      window.location.reload(); // Force refresh to pick up session
      return { data: { user, session: { user } }, error: null };
    },
    signUp: async ({ email }: any) => {
      const user = { id: 'mock-user-id', email };
      // Also create a default profile
      const profiles = JSON.parse(localStorage.getItem('sb-mock-profiles') || '[]');
      if (!profiles.find((p: any) => p.id === user.id)) {
        profiles.push({
           id: user.id,
           username: email.split('@')[0],
           full_name: '',
           bio: '',
           links: [],
           theme_color: '#000000'
        });
        localStorage.setItem('sb-mock-profiles', JSON.stringify(profiles));
      }
      return { data: { user }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('sb-mock-user');
      window.location.reload();
      return { error: null };
    }
  };

  from(table: string) {
    return new MockQueryBuilder(table);
  }
}

class MockQueryBuilder {
  table: string;
  data: any[];
  filter: { col: string, val: any } | null = null;

  constructor(table: string) {
    this.table = table;
    this.data = JSON.parse(localStorage.getItem(`sb-mock-${table}`) || '[]');
  }

  select(columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filter = { col: column, val: value };
    return this;
  }

  single() {
    return this.execute(true);
  }

  async upsert(newData: any) {
    // Basic upsert logic for 'profiles' based on ID
    const index = this.data.findIndex((item: any) => item.id === newData.id);
    if (index >= 0) {
      this.data[index] = { ...this.data[index], ...newData };
    } else {
      this.data.push(newData);
    }
    this.commit();
    return { data: newData, error: null };
  }

  async execute(single = false) {
    let result = this.data;
    if (this.filter) {
      result = result.filter((item: any) => item[this.filter!.col] === this.filter!.val);
    }
    
    if (single) {
      if (result.length === 0) return { data: null, error: { code: 'PGRST116', message: 'Row not found' } };
      return { data: result[0], error: null };
    }
    return { data: result, error: null };
  }

  commit() {
    localStorage.setItem(`sb-mock-${this.table}`, JSON.stringify(this.data));
  }
}

// ------------------------------------------------------------------
// EXPORT
// ------------------------------------------------------------------

let client: any;

if (isConfigured) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('⚠️ Supabase URL missing or default. Using MOCK Client (LocalStorage). Data will not persist across devices.');
  client = new MockSupabaseClient();
}

export const supabase = client;
