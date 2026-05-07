-- ============================================================
-- Quran Video Platform — Supabase Database Setup
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  role            TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free','vip','admin')),
  daily_limit     INTEGER DEFAULT 5,
  vip_expires_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, daily_limit)
  VALUES (NEW.id, NEW.email, 'free', 5)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. VIDEO GENERATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS video_generations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  generation_type  TEXT NOT NULL DEFAULT 'quran' CHECK (generation_type IN ('quran','sunnah','custom')),
  status           TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('pending','success','failed')),
  quality          TEXT,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Index for daily count queries
CREATE INDEX IF NOT EXISTS idx_gen_user_date
  ON video_generations(user_id, created_at);

-- ============================================================
-- 3. ADMIN SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO admin_settings (key, value) VALUES
  ('free_daily_limit',  '5'),
  ('vip_daily_limit',   '50'),
  ('watermark_enabled', 'true'),
  ('maintenance_mode',  'false')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

-- Profiles: users see own profile, admins see all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Video generations: users see own
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gen_insert_own" ON video_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gen_select_own" ON video_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "gen_admin_all" ON video_generations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin settings: authenticated users can read, admins can write
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_read_all" ON admin_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "settings_admin_write" ON admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 5. MAKE FIRST USER ADMIN (run manually after signup)
-- Replace 'your@email.com' with your email
-- ============================================================
-- UPDATE profiles SET role = 'admin', daily_limit = 9999
-- WHERE email = 'your@email.com';

-- ============================================================
-- Done! Check tables in Supabase Table Editor.
-- ============================================================
