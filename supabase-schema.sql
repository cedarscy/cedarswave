-- =============================================
-- CEDARS WAVE SCANNER SaaS — Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'trial' CHECK (tier IN ('trial', 'starter', 'pro', 'elite')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade journal
CREATE TABLE public.trade_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  entry_price DECIMAL NOT NULL,
  exit_price DECIMAL,
  size DECIMAL NOT NULL,
  score INTEGER,
  timeframe TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Scan history
CREATE TABLE public.scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  score INTEGER NOT NULL,
  signals JSONB NOT NULL DEFAULT '{}',
  timeframe TEXT NOT NULL,
  price DECIMAL,
  entry_limit DECIMAL,
  stop_loss DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  openai_api_key TEXT,
  alert_email TEXT,
  webhook_url TEXT,
  theme TEXT DEFAULT 'dark',
  default_timeframe TEXT DEFAULT '15m',
  default_pairs TEXT[] DEFAULT ARRAY['BTCUSDT','ETHUSDT','SOLUSDT','XRPUSDT','BNBUSDT'],
  sound_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis usage tracking
CREATE TABLE public.ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own trades" ON public.trade_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own trades" ON public.trade_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own trades" ON public.trade_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own trades" ON public.trade_journal FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users read own scans" ON public.scan_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scans" ON public.scan_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users read own ai_usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own ai_usage" ON public.ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai_usage" ON public.ai_usage FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create subscription + settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status, trial_end)
  VALUES (NEW.id, 'trial', 'active', NOW() + INTERVAL '14 days');
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_trade_journal_user ON public.trade_journal(user_id);
CREATE INDEX idx_scan_history_user ON public.scan_history(user_id);
CREATE INDEX idx_scan_history_symbol ON public.scan_history(symbol);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_customer_id);
