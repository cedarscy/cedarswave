You are building Cedars Wave Scanner SaaS from scratch. This is a production-grade crypto/stock/forex technical analysis SaaS.

REFERENCE FILES (read these first):
- Existing scanner: C:\Users\rikab\.openclaw\workspace-trading\skill-build\crypto-wave-scanner\assets\wave-scanner.html
- Research report: C:\Users\rikab\.openclaw\workspace-trading\memory\cedars-wave-saas-research.md

BUILD THIS:

## Project: cedars-wave-saas (Vite + React + TypeScript + Supabase + Lemon Squeezy)

### Stack
- Vite + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state
- Supabase (auth + database)
- Lemon Squeezy (payments)
- React Query (TanStack Query v5)
- React Router v6
- TradingView Lightweight Charts v4

### Pricing Tiers
- Starter: 9 EUR/mo (3 pairs, basic scoring, 50 journal entries)
- Pro: 29 EUR/mo (unlimited pairs, AI analysis 25x/mo, full journal, alerts)
- Elite: 59 EUR/mo (everything, unlimited AI, webhooks, API access)
- 14-day free trial, no credit card

### Pages to Build

1. **Landing page** (/) — Hero, features, vs-SnapTrader comparison table, pricing section, FAQ, footer "Built with Claude Opus 4.6"
2. **Auth pages** (/login, /signup, /reset-password) — Clean Supabase auth forms
3. **Dashboard** (/dashboard) — Protected route, shows scanner
4. **Scanner** (/dashboard/scanner) — Full 10-signal scanner ported from wave-scanner.html
5. **Trade Journal** (/dashboard/journal) — CRUD journal with P&L tracking
6. **Settings** (/dashboard/settings) — Profile, subscription management, API key (for AI analysis)
7. **Pricing** (/pricing) — Pricing cards with Lemon Squeezy checkout links
8. **Upgrade prompt** — Modal shown when free user hits paid feature

### Scanner Features to Port (from wave-scanner.html)
- 10-signal scoring: EMA stack, RSI zone+direction, Volume surge, 1H trend, MACD, BB position, ATR R:R, VWAP, consecutive green candles
- Grades: 8-10 STRONG / 6-7 VALID / 4-5 WEAK / <4 SKIP
- Custom pair input with auto-detection (crypto=Binance Futures, stock/forex=Yahoo Finance)
- Live TradingView Lightweight Charts with EMA overlays, RSI subplot, BB, VWAP
- Auto-refresh with countdown
- Export CSV/PNG
- Sound alerts for score >= 8

### Feature Gating
- Free trial: full Pro access for 14 days
- Starter: max 3 pairs, no AI analysis, 50 journal entries
- Pro: unlimited pairs, 25 AI analyses/mo, full journal, email alerts
- Elite: everything unlimited + webhooks + API key

### Supabase Schema (create migration files)
- users (via Supabase auth)
- subscriptions (user_id, tier, status, lemon_squeezy_id, current_period_end)
- trade_journal (id, user_id, symbol, direction, entry_price, exit_price, size, notes, created_at)
- scan_history (id, user_id, symbol, score, signals, timeframe, created_at)
- user_settings (user_id, openai_api_key_encrypted, alert_email, webhook_url, theme)

### Branding
- Colors: bg #0a0e1a, card #0d1526, border #1e3050, accent #4fc3f7, green #69f0ae, orange #ff6d00
- Fonts: Space Grotesk (headings) + Inter (body) from Google Fonts
- Logo: 🌊 Cedars Wave
- Dark theme default, light theme toggle

### Important Notes
- Port ALL scanner logic from the existing wave-scanner.html (read it carefully)
- Supabase keys are placeholders (user will fill in .env)
- Lemon Squeezy product/variant IDs are placeholders
- Add .env.example with all required vars
- Add README.md with setup instructions
- Make it look PREMIUM — this is a paid product

### Project Output Location
C:\Users\rikab\.openclaw\workspace-trading\cedars-wave-saas\

When completely finished, run this command to notify:
openclaw system event --text "Done: Cedars Wave SaaS v1 scaffolded — full React+Supabase+LemonSqueezy app ready" --mode now
