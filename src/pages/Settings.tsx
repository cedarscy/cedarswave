import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useScannerStore } from '../store/scannerStore'

export function Settings() {
  const { user, logout } = useAuth()
  const { tier, subscription, getDaysRemaining } = useSubscription()
  const { symbols, settings, setSymbols, updateSettings } = useScannerStore()
  const [symbolsText, setSymbolsText] = useState(symbols.join(', '))
  const [saved, setSaved] = useState(false)

  function handleSaveSymbols() {
    const parsed = symbolsText
      .split(/[\s,]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
    setSymbols(parsed)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tierColors: Record<string, string> = {
    trial: 'text-[#4fc3f7] border-[#1565c0] bg-[#0d2035]',
    starter: 'text-[#607d9b] border-[#1e3050] bg-[#0b1220]',
    pro: 'text-[#4fc3f7] border-[#1565c0] bg-[#0d2035]',
    elite: 'text-[#ff9800] border-[#ff6d00] bg-[#1a0e00]',
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#e0e6f0] mb-6" style={{ fontFamily: 'Space Grotesk' }}>
        ⚙️ Settings
      </h1>

      {/* Account */}
      <div className="card p-5 mb-4">
        <h2 className="text-[#4fc3f7] font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
          Account
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#1565c0] flex items-center justify-center text-white font-bold">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="text-[#e0e6f0] font-medium">{user?.email}</p>
            <p className="text-[#607d9b] text-xs">Member since {new Date(user?.created_at ?? '').toLocaleDateString()}</p>
          </div>
        </div>

        {/* Subscription */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${tierColors[tier]}`}>
          {tier === 'trial' ? '🎯 Trial' : tier === 'starter' ? '⭐ Starter' : tier === 'pro' ? '🚀 Pro' : '👑 Elite'}
          {tier === 'trial' && (
            <span className="opacity-70">· {getDaysRemaining()} days remaining</span>
          )}
          {subscription?.current_period_end && tier !== 'trial' && (
            <span className="opacity-70 text-xs">
              · Renews {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          )}
        </div>

        {tier !== 'elite' && (
          <div className="mt-3">
            <a href="/pricing" className="btn-primary text-xs py-1.5 px-3 inline-block no-underline">
              Upgrade Plan →
            </a>
          </div>
        )}
      </div>

      {/* Scanner settings */}
      <div className="card p-5 mb-4">
        <h2 className="text-[#4fc3f7] font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
          Scanner Defaults
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[#607d9b] text-xs mb-1.5">Auto-refresh interval (seconds)</label>
            <input
              type="number"
              className="input-base"
              min="10"
              max="300"
              value={settings.refreshInterval}
              onChange={(e) => updateSettings({ refreshInterval: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-[#607d9b] text-xs mb-1.5">Default timeframe</label>
            <select
              className="input-base"
              value={settings.interval}
              onChange={(e) => updateSettings({ interval: e.target.value as any })}
            >
              <option value="5m">5 minutes</option>
              <option value="15m">15 minutes</option>
              <option value="1h">1 hour</option>
              <option value="4h">4 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-[#607d9b] text-xs mb-1.5">
              Default symbols (comma or newline separated)
            </label>
            <textarea
              className="input-base w-full"
              rows={4}
              value={symbolsText}
              onChange={(e) => setSymbolsText(e.target.value)}
              style={{ resize: 'vertical' }}
              placeholder="BTCUSDT, ETHUSDT, SOLUSDT..."
            />
            <p className="text-[#546e7a] text-xs mt-1">
              Supports crypto (USDT pairs), stocks (AAPL), forex (EURUSD)
            </p>
          </div>

          <button onClick={handleSaveSymbols} className="btn-primary self-start text-sm">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-5 border-[#c62828]">
        <h2 className="text-[#ef5350] font-semibold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
          Danger Zone
        </h2>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to sign out?')) {
              logout()
            }
          }}
          className="btn-danger text-sm"
        >
          Sign Out
        </button>
      </div>

      <p className="text-[#37474f] text-xs text-center mt-6">
        © A.K. Cedars CY LTD · Made with Claude Opus 4.6 ✨
      </p>
    </div>
  )
}
