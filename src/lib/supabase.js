// Dynamic import: uses real Supabase in production (when @supabase/supabase-js installed)
// Falls back to stub for local build without the package

let _supabase = null;

async function getClient() {
  if (_supabase) return _supabase;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    _supabase = createClient(url, key);
  } catch {
    const { createClient } = await import('./supabase-stub/index.js');
    _supabase = createClient();
  }
  return _supabase;
}

// Sync-init for immediate use
let _syncClient = null;
(async () => { _syncClient = await getClient(); })();

export const supabase = new Proxy({}, {
  get(_, prop) {
    if (_syncClient) return _syncClient[prop];
    // Return stub methods if not yet initialized
    if (prop === 'auth') return {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (cb) => { cb('INITIAL_SESSION', null); return { data: { subscription: { unsubscribe: ()=>{} } } }; },
      signInWithPassword: async () => { throw new Error('Supabase initializing...'); },
      signUp: async () => { throw new Error('Supabase initializing...'); },
      signOut: async () => ({})
    };
    return () => Promise.resolve({ data: null, error: null });
  }
});

// ── Auth helpers ─────────────────────────────────────────────────
export async function signUp(email, password) {
  const client = await getClient();
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const client = await getClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = await getClient();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

// ── Profile helpers ──────────────────────────────────────────────
export async function getProfile(userId) {
  const client = await getClient();
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId, updates) {
  const client = await getClient();
  const { data, error } = await client.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

// ── Generation tracking ──────────────────────────────────────────
export async function recordGeneration(userId, type, quality, duration) {
  const client = await getClient();
  const { data, error } = await client.from('video_generations').insert({
    user_id: userId, generation_type: type, quality, duration_seconds: duration, status: 'success'
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getUserGenerations(userId, limit = 20) {
  const client = await getClient();
  const { data } = await client.from('video_generations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

// ── Admin helpers ────────────────────────────────────────────────
export async function getAllUsers(limit = 100) {
  const client = await getClient();
  const { data } = await client.from('profiles').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function setUserRole(userId, role) {
  return updateProfile(userId, { role });
}

export async function setUserVIP(userId, expiresAt) {
  return updateProfile(userId, { role: 'vip', vip_expires_at: expiresAt });
}

export async function getAdminSettings() {
  const client = await getClient();
  const { data } = await client.from('admin_settings').select('*');
  const settings = {};
  (data || []).forEach(r => { settings[r.key] = r.value; });
  return settings;
}

export async function updateAdminSetting(key, value) {
  const client = await getClient();
  const { error } = await client.from('admin_settings').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getRecentGenerations(limit = 50) {
  const client = await getClient();
  const { data } = await client.from('video_generations').select('*, profiles(email, role)').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function getAdminStats() {
  const client = await getClient();
  const today = new Date().toISOString().split('T')[0];
  const [ur, tr, vr] = await Promise.all([
    client.from('profiles').select('*', { count:'exact', head:true }),
    client.from('video_generations').select('*', { count:'exact', head:true }).gte('created_at', `${today}T00:00:00`),
    client.from('profiles').select('*', { count:'exact', head:true }).eq('role', 'vip'),
  ]);
  return { totalUsers: ur.count||0, todayGenerations: tr.count||0, vipUsers: vr.count||0 };
}
