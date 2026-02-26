-- =============================================
-- Migration: Add API Keys table
-- Allows users to authenticate via X-API-Key header
-- =============================================

CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Index for fast key lookups
CREATE INDEX idx_api_keys_key ON public.api_keys(key);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only manage their own API keys
CREATE POLICY "Users read own api_keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own api_keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own api_keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users update own api_keys" ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);

-- Service-role policy for API key validation (bypasses RLS via service key)
-- The validate function uses supabase client with the user's own session or service role
