import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, getProfile } from '../lib/supabase';

const AuthContext = createContext(null);

export const PLAN_LIMITS = {
  free:  { daily_limit:5,    quality:'720p',  watermark:true,  max_duration:120, label:'مجاني' },
  vip:   { daily_limit:50,   quality:'1080p', watermark:false, max_duration:600, label:'VIP'   },
  admin: { daily_limit:9999, quality:'1080p', watermark:false, max_duration:9999,label:'مدير'  },
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);

  const loadProfile = useCallback(async (uid) => {
    if (!uid) { setProfile(null); return; }
    try {
      const p = await getProfile(uid);
      if (p?.role === 'vip' && p.vip_expires_at && new Date(p.vip_expires_at) < new Date()) p.role = 'free';
      setProfile(p || { id:uid, role:'free', daily_limit:5 });
    } catch { setProfile({ id:uid, role:'free', daily_limit:5 }); }
  }, []);

  const loadCount = useCallback(async (uid) => {
    if (!uid) { setTodayCount(0); return; }
    try {
      const today = new Date().toISOString().split('T')[0];
      // Safe call — works even with stub
      const client = supabase;
      const res = await client.from('video_generations').select('*', { count:'exact', head:true }).eq('user_id', uid).gte('created_at', `${today}T00:00:00`);
      setTodayCount(res?.count || 0);
    } catch { setTodayCount(0); }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) { loadProfile(session.user.id); loadCount(session.user.id); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) { loadProfile(session.user.id); loadCount(session.user.id); }
      else { setProfile(null); setTodayCount(0); }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile, loadCount]);

  const role       = profile?.role || 'free';
  const limits     = PLAN_LIMITS[role] || PLAN_LIMITS.free;
  const dailyLimit = profile?.daily_limit ?? limits.daily_limit;
  const remaining  = Math.max(0, dailyLimit - todayCount);
  const canGenerate = remaining > 0;
  const isVIP   = role === 'vip' || role === 'admin';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, profile, loading, todayCount, dailyLimit, remaining, canGenerate,
      isVIP, isAdmin, role, limits,
      refreshProfile:    () => loadProfile(user?.id),
      refreshTodayCount: () => loadCount(user?.id),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
