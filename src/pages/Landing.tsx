import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRICING_TIERS } from '../lib/stripe'

const FEATURES = [
  {
    icon: '📡',
    title: '10-Signal Scoring',
    desc: 'Every asset scored across EMA Stack, RSI Zone, Volume Surge, MACD, Bollinger Bands, ATR, VWAP, and more. No guesswork.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Data',
    desc: 'Binance Futures for crypto, Yahoo Finance for stocks & forex. Scans update automatically every 60 seconds.',
  },
  {
    icon: '🎯',
    title: 'Grade-Based Signals',
    desc: '🔥 STRONG (8-10) · ✅ VALID (6-7) · ⚠️ WEAK (4-5) · ❌ SKIP (<4). Know exactly what to trade.',
  },
  {
    icon: '📝',
    title: 'Trade Journal',
    desc: 'Log entries with automatic P&L calculation, score at entry, win rate tracking, and CSV export.',
  },
  {
    icon: '🌍',
    title: 'Multi-Asset',
    desc: 'Scan crypto (Binance Futures), stocks, and forex pairs all in one dashboard. Add any custom pair instantly.',
  },
  {
    icon: '📊',
    title: 'Live Charts',
    desc: 'Candlestick charts with EMA overlays, Bollinger Bands, VWAP, and RSI sub-chart — all auto-rendered.',
  },
  {
    icon: '🤖',
    title: 'OpenClaw Native',
    desc: 'Built-in integration with OpenClaw AI. Your AI agent can scan markets, read signals, and trigger alerts automatically — no manual work needed.',
  },
  {
    icon: '🔑',
    title: 'Full API Access',
    desc: 'REST API with X-API-Key authentication — available on the Elite plan. Connect OpenClaw, Zapier, or any tool to automate your trading workflow.',
  },
]

const COMPARISON = [
  { feature: '10-Signal Wave Scoring', cedars: true, snaptrader: false, tradingview: false },
  { feature: 'Auto Grade (STRONG/VALID/WEAK)', cedars: true, snaptrader: false, tradingview: false },
  { feature: 'Crypto Futures (Binance)', cedars: true, snaptrader: true, tradingview: true },
  { feature: 'Stocks & Forex Scanning', cedars: true, snaptrader: '❓', tradingview: true },
  { feature: 'Trade Journal built-in', cedars: true, snaptrader: false, tradingview: false },
  { feature: 'EMA + BB + VWAP charts', cedars: true, snaptrader: '❓', tradingview: true },
  { feature: 'Free 14-day trial', cedars: true, snaptrader: '❓', tradingview: false },
  { feature: 'Starting price', cedars: '€9/mo', snaptrader: '~$29/mo', tradingview: '$12.95/mo' },
  { feature: 'Unlimited pairs (Pro)', cedars: '€29/mo', snaptrader: 'Limited', tradingview: '$24.95/mo' },
  { feature: 'Custom wave formula', cedars: true, snaptrader: false, tradingview: false },
]

const FAQ = [
  {
    q: 'Is there really no credit card required for the trial?',
    a: 'Correct. Sign up with just your email and you get 14 days of full Pro access. No card needed.',
  },
  {
    q: 'Which crypto exchanges are supported?',
    a: 'Cedars Wave uses Binance Futures API for crypto pairs (USDT-margined). Any pair available on Binance Futures works.',
  },
  {
    q: 'Can I scan stocks and forex too?',
    a: 'Yes. Enter any Yahoo Finance symbol (e.g. AAPL, TSLA for stocks, or EURUSD for forex) and the scanner fetches data automatically.',
  },
  {
    q: 'How is this different from TradingView alerts?',
    a: 'TradingView shows raw charts. Cedars Wave automatically scores each asset across 10 signals and tells you STRONG / VALID / WEAK — so you spend 10 seconds per asset instead of 5 minutes.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your settings page with one click. No fees, no gotchas. We also offer a 30-day money-back guarantee.',
  },
  {
    q: 'What is the 10-signal scoring system?',
    a: 'EMA Stack (9>21>50), RSI Zone (50-80), RSI Rising, Volume Surge (>1.3x), 1H Trend, MACD Positive, BB Position, ATR R:R, Price vs VWAP, and Consecutive Green Candles. Each signal = 1 point. 8+ = STRONG setup.',
  },
]

export function Landing() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ background: 'var(--bg-primary)' }} className="min-h-screen">
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-[#1e3050]"
        style={{ background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🌊</span>
          <span className="font-bold text-[#e0e6f0] text-lg" style={{ fontFamily: 'Space Grotesk' }}>
            Cedars Wave
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <a href="#pricing" className="text-[#607d9b] hover:text-[#e0e6f0] text-sm transition-colors">
            Pricing
          </a>
          <Link to="/login" className="text-[#607d9b] hover:text-[#e0e6f0] text-sm transition-colors no-underline">
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary text-sm py-1.5 px-4 no-underline">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-5"
              style={{
                width: Math.random() * 400 + 100,
                height: Math.random() * 400 + 100,
                background: i % 2 === 0 ? '#4fc3f7' : '#1565c0',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: 'translate(-50%, -50%)',
                animation: `float ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#0d2035] border border-[#1e3050] text-[#4fc3f7] text-xs px-4 py-1.5 rounded-full mb-6">
            🎯 14-day free trial · No credit card required
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Space Grotesk' }}
          >
            <span className="text-[#e0e6f0]">Scan Any Market.</span>
            <br />
            <span className="gradient-text">Score Every Setup.</span>
          </h1>

          <p className="text-[#607d9b] text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Cedars Wave scores every crypto, stock, and forex pair across{' '}
            <span className="text-[#e0e6f0]">10 proven signals</span> and tells you exactly what to trade.
            No noise. Just grades.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/signup"
              className="btn-primary text-base py-3 px-8 no-underline"
              style={{ fontSize: 16 }}
            >
              🚀 Start Free Trial
            </Link>
            <Link
              to="/login"
              className="btn-ghost text-base py-3 px-8 no-underline"
              style={{ fontSize: 16 }}
            >
              Sign In →
            </Link>
          </div>

          {/* Grade preview */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { cls: 'grade-fire', label: '🔥 STRONG', score: '8-10/10' },
              { cls: 'grade-valid', label: '✅ VALID', score: '6-7/10' },
              { cls: 'grade-weak', label: '⚠️ WEAK', score: '4-5/10' },
              { cls: 'grade-skip', label: '❌ SKIP', score: '<4/10' },
            ].map((g) => (
              <div key={g.label} className={`${g.cls} px-4 py-2 rounded-full font-bold text-sm`}>
                {g.label} <span className="opacity-60 font-normal text-xs ml-1">{g.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Signals Section */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#e0e6f0] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              The 10-Signal Scoring System
            </h2>
            <p className="text-[#607d9b] text-lg">Every asset scored automatically in seconds</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { n: 1, label: 'EMA Stack', sub: '9 > 21 > 50' },
              { n: 2, label: 'RSI Zone', sub: '50–80 range' },
              { n: 3, label: 'RSI Rising', sub: 'Momentum up' },
              { n: 4, label: 'Volume Surge', sub: '>1.3× average' },
              { n: 5, label: '1H Trend', sub: 'EMA9 > EMA21' },
              { n: 6, label: 'MACD+', sub: 'Positive cross' },
              { n: 7, label: 'BB Position', sub: 'Near lower band' },
              { n: 8, label: 'ATR R:R', sub: 'Quality stop' },
              { n: 9, label: 'Price vs VWAP', sub: 'Above VWAP' },
              { n: 10, label: 'Green Candles', sub: '3+ consecutive' },
            ].map((sig) => (
              <div key={sig.n} className="card p-3 text-center">
                <div className="text-[#4fc3f7] font-bold text-2xl mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                  {sig.n}
                </div>
                <div className="text-[#e0e6f0] text-xs font-semibold mb-0.5">{sig.label}</div>
                <div className="text-[#546e7a] text-[10px]">{sig.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#e0e6f0] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              Everything You Need
            </h2>
            <p className="text-[#607d9b] text-lg">Built by traders, for traders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-5 hover:border-[#4fc3f7] transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3
                  className="text-[#e0e6f0] font-semibold mb-2"
                  style={{ fontFamily: 'Space Grotesk' }}
                >
                  {f.title}
                </h3>
                <p className="text-[#607d9b] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OpenClaw AI Integration */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#e0e6f0] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              🤖 Works With OpenClaw Natively
            </h2>
            <p className="text-[#607d9b] text-lg">
              CedarsWave is the first wave scanner built for AI-first workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-5 hover:border-[#4fc3f7] transition-colors">
              <div className="text-3xl mb-3">⚡</div>
              <h3
                className="text-[#e0e6f0] font-semibold mb-2"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Agent-Ready API
              </h3>
              <p className="text-[#607d9b] text-sm leading-relaxed">
                Elite subscribers get a personal API key. Your OpenClaw agent can query signals, get scored setups, and export data 24/7 automatically.
              </p>
            </div>
            <div className="card p-5 hover:border-[#4fc3f7] transition-colors">
              <div className="text-3xl mb-3">🔄</div>
              <h3
                className="text-[#e0e6f0] font-semibold mb-2"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Automated Scanning
              </h3>
              <p className="text-[#607d9b] text-sm leading-relaxed">
                Set up crons in OpenClaw to scan markets every hour and alert you only when strong setups appear.
              </p>
            </div>
            <div className="card p-5 hover:border-[#4fc3f7] transition-colors">
              <div className="text-3xl mb-3">✨</div>
              <h3
                className="text-[#e0e6f0] font-semibold mb-2"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                Zero Manual Work
              </h3>
              <p className="text-[#607d9b] text-sm leading-relaxed">
                From signal detection to trade logging, OpenClaw handles it all. You just approve the trades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison vs SnapTrader */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#e0e6f0] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              Why Cedars Wave?
            </h2>
            <p className="text-[#607d9b] text-lg">How we compare to the alternatives</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1e3050]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <th className="px-4 py-3 text-left text-[#607d9b] font-semibold">Feature</th>
                  <th className="px-4 py-3 text-center text-[#4fc3f7] font-bold">🌊 Cedars Wave</th>
                  <th className="px-4 py-3 text-center text-[#607d9b] font-semibold">SnapTrader AI</th>
                  <th className="px-4 py-3 text-center text-[#607d9b] font-semibold">TradingView</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className="border-t border-[#1a2d45] hover:bg-[#0b1220] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#e0e6f0]">{row.feature}</td>
                    {(['cedars', 'snaptrader', 'tradingview'] as const).map((col) => (
                      <td key={col} className="px-4 py-3 text-center">
                        {row[col] === true ? (
                          <span className="text-[#69f0ae]">✓</span>
                        ) : row[col] === false ? (
                          <span className="text-[#546e7a]">✗</span>
                        ) : (
                          <span className={col === 'cedars' ? 'text-[#4fc3f7] font-semibold' : 'text-[#607d9b]'}>
                            {String(row[col])}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#e0e6f0] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              Simple Pricing
            </h2>
            <p className="text-[#607d9b] text-lg">Start free. Upgrade when you're ready.</p>

            {/* Annual toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm ${!annual ? 'text-[#e0e6f0]' : 'text-[#607d9b]'}`}>Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-colors border-none cursor-pointer ${annual ? 'bg-[#1565c0]' : 'bg-[#1e3050]'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
              <span className={`text-sm ${annual ? 'text-[#e0e6f0]' : 'text-[#607d9b]'}`}>
                Annual <span className="text-[#69f0ae] font-semibold ml-1">Save 33%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {PRICING_TIERS.map((plan) => (
              <div
                key={plan.id}
                className={`card p-6 flex flex-col relative transition-all ${
                  plan.popular ? 'border-[#4fc3f7] shadow-[0_0_30px_rgba(79,195,247,0.1)]' : plan.color
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1565c0] text-white text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#e0e6f0] mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                  {plan.name}
                </h3>
                <p className="text-[#607d9b] text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#e0e6f0]" style={{ fontFamily: 'Space Grotesk' }}>
                    €{annual ? plan.annualMonthly.toFixed(0) : plan.monthlyPrice}
                  </span>
                  <span className="text-[#607d9b] text-sm">/mo</span>
                  {annual && (
                    <p className="text-[#546e7a] text-xs mt-1">Billed €{plan.annualPrice}/year</p>
                  )}
                </div>
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-[#69f0ae] mt-0.5">✓</span>
                      <span className="text-[#607d9b]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center no-underline py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-[#1565c0] hover:bg-[#1976d2] text-white'
                      : 'border border-[#1e3050] text-[#e0e6f0] hover:bg-[#1a2d45]'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-[#546e7a] text-sm">
            14-day free trial · No credit card required · Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }} id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#e0e6f0] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  className="w-full px-5 py-4 text-left flex items-center justify-between bg-transparent border-none cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-[#e0e6f0] font-medium text-sm">{item.q}</span>
                  <span className="text-[#607d9b] text-lg flex-shrink-0 ml-3">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[#607d9b] text-sm leading-relaxed border-t border-[#1a2d45]" style={{ paddingTop: 12 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-4 float-anim inline-block">🌊</div>
          <h2 className="text-4xl font-bold text-[#e0e6f0] mb-4" style={{ fontFamily: 'Space Grotesk' }}>
            Ready to scan smarter?
          </h2>
          <p className="text-[#607d9b] text-lg mb-8">
            Join traders using Cedars Wave to find setups in seconds, not hours.
          </p>
          <Link to="/signup" className="btn-primary text-base py-3 px-10 no-underline inline-block">
            🚀 Start Your Free 14-Day Trial
          </Link>
          <p className="text-[#546e7a] text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-[#1e3050] px-6 py-8 text-center"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">🌊</span>
          <span className="text-[#607d9b] font-medium" style={{ fontFamily: 'Space Grotesk' }}>
            Cedars Wave
          </span>
        </div>
        <p className="text-[#546e7a] text-xs mb-2">
          © 2026 A.K. Cedars CY LTD · Glyfadas 7a, Kamares, Larnaca 6040, Cyprus
        </p>
        <p className="text-[#37474f] text-xs">Made with Claude Opus 4.6 ✨</p>
      </footer>
    </div>
  )
}
