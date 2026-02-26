import { useState, useEffect, useRef } from 'react'
import { useScanner } from '../../hooks/useScanner'
import { CoinCard } from './CoinCard'
import { AddPairInput } from './AddPairInput'

interface TradeModalData {
  sym: string
  price: number
  score: number
}

export function ScannerGrid() {
  const {
    results,
    allResults,
    favorites,
    scanning,
    lastScanTime,
    settings,
    summary,
    runScan,
    removePair,
    toggleFavorite,
    updateSettings,
  } = useScanner()

  const [countdown, setCountdown] = useState(settings.refreshInterval)
  const [tradeModal, setTradeModal] = useState<TradeModalData | null>(null)
  const [directionFilter, setDirectionFilter] = useState<'all' | 'long' | 'short'>('all')
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-refresh
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(settings.refreshInterval)

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          runScan()
          return settings.refreshInterval
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [settings.refreshInterval, lastScanTime])

  // Initial scan
  useEffect(() => {
    runScan()
  }, [])

  function handleLogTrade(sym: string, price: number, score: number) {
    setTradeModal({ sym, price, score })
  }

  return (
    <div>
      {/* Controls bar */}
      <div
        className="sticky top-0 z-10 px-4 py-2 flex flex-wrap gap-2 items-center border-b border-[#1e3050]"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <select
          className="input-base py-1.5 text-xs"
          value={settings.interval}
          onChange={(e) => updateSettings({ interval: e.target.value as any })}
        >
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
        </select>

        <select
          className="input-base py-1.5 text-xs"
          value={settings.limit}
          onChange={(e) => updateSettings({ limit: parseInt(e.target.value) as any })}
        >
          <option value="60">60 candles</option>
          <option value="100">100 candles</option>
          <option value="200">200 candles</option>
        </select>

        <select
          className="input-base py-1.5 text-xs"
          value={settings.minScore}
          onChange={(e) => updateSettings({ minScore: parseInt(e.target.value) as any })}
        >
          <option value="0">Show All</option>
          <option value="4">Score ≥ 4</option>
          <option value="6">Score ≥ 6</option>
          <option value="8">Score ≥ 8 (STRONG)</option>
        </select>

        <button
          onClick={() => { runScan(); setCountdown(settings.refreshInterval) }}
          disabled={scanning}
          className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
        >
          {scanning ? <><span className="spinner mr-1" /> Scanning...</> : '⟳ Refresh'}
        </button>

        <div className="h-5 w-px bg-[#1e3050]" />

        <div className="flex items-center gap-1">
          {(['all', 'long', 'short'] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => setDirectionFilter(dir)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                directionFilter === dir
                  ? dir === 'long'
                    ? 'bg-[#00c853]/20 text-[#00e676] border-[#00c853]/40'
                    : dir === 'short'
                      ? 'bg-[#ff1744]/20 text-[#ff5252] border-[#ff1744]/40'
                      : 'bg-[#4fc3f7]/20 text-[#4fc3f7] border-[#4fc3f7]/40'
                  : 'bg-transparent text-[#546e7a] border-[#1e3050] hover:text-[#90a4ae]'
              }`}
            >
              {dir === 'all' ? 'All' : dir === 'long' ? '▲ Long' : '▼ Short'}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-[#1e3050]" />

        <AddPairInput />

        <div className="ml-auto text-[11px] text-[#546e7a]">
          {scanning ? (
            <><span className="spinner mr-1" /> Scanning...</>
          ) : (
            lastScanTime ? `Auto-refresh in ${countdown}s · Updated ${lastScanTime}` : 'Initializing...'
          )}
        </div>
      </div>

      {/* Summary bar */}
      {allResults.length > 0 && (
        <div
          className="px-4 py-2 flex flex-wrap gap-2 items-center border-b border-[#1a2d45] text-xs"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <span className="px-2 py-0.5 rounded-full font-bold grade-fire">🔥 STRONG: {summary.strong}</span>
          <span className="px-2 py-0.5 rounded-full font-bold grade-valid">✅ VALID: {summary.valid}</span>
          <span className="px-2 py-0.5 rounded-full font-bold grade-weak">⚠️ WEAK: {summary.weak}</span>
          <span className="px-2 py-0.5 rounded-full font-bold grade-skip">❌ SKIP: {summary.skip}</span>
          <div className="h-4 w-px bg-[#1e3050]" />
          <span className="px-2 py-0.5 rounded-full font-bold bg-[#00c853]/15 text-[#00e676]">▲ Long Strong: {summary.longStrong}</span>
          <span className="px-2 py-0.5 rounded-full font-bold bg-[#00c853]/10 text-[#69f0ae]">▲ Long Valid: {summary.longValid}</span>
          <span className="px-2 py-0.5 rounded-full font-bold bg-[#ff1744]/15 text-[#ff5252]">▼ Short Strong: {summary.shortStrong}</span>
          <span className="px-2 py-0.5 rounded-full font-bold bg-[#ff1744]/10 text-[#ff8a80]">▼ Short Valid: {summary.shortValid}</span>
          {summary.best && (
            <span className="ml-2 text-[#607d9b]">
              Best: <b className="text-[#e0e6f0]">{summary.best.display.replace('USDT', '')}</b> {summary.best.direction === 'short' ? '▼' : '▲'} {summary.best.score}/10 · RSI {summary.best.rsiNow}
            </span>
          )}
        </div>
      )}

      {/* Watchlist strip */}
      {favorites.size > 0 && (
        <div
          className="px-4 py-2 flex items-center gap-2 flex-wrap border-b border-[#1a2d45] text-xs"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <span className="text-[#607d9b] font-semibold">⭐ Watchlist:</span>
          {Array.from(favorites).map((sym) => {
            const r = allResults.find((x) => x.sym === sym)
            return (
              <button
                key={sym}
                onClick={() => {
                  document.getElementById(`card-${sym}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                className={`px-2 py-0.5 rounded-full border cursor-pointer text-[10px] transition-colors ${
                  r ? `grade-${r.gradeClass}` : 'text-[#607d9b] border-[#1e3050]'
                }`}
              >
                {sym.replace('USDT', '').replace('=X', '')} {r ? `${r.score}/10` : ''}
              </button>
            )
          })}
        </div>
      )}

      {/* Cards grid */}
      <div className="p-4 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))' }}>
        {results.filter((r) => directionFilter === 'all' || r.direction === directionFilter).length === 0 && !scanning && (
          <div className="col-span-full text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[#607d9b]">No setups found with score ≥ {settings.minScore}{directionFilter !== 'all' ? ` (${directionFilter})` : ''}.</p>
            <p className="text-[#546e7a] text-sm mt-1">Lower the filter or click Refresh.</p>
          </div>
        )}
        {scanning && results.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
            <p className="text-[#607d9b]">Scanning markets...</p>
          </div>
        )}
        {results.filter((r) => directionFilter === 'all' || r.direction === directionFilter).map((result) => (
          <div key={result.sym} id={`card-${result.sym}`}>
            <CoinCard
              data={result}
              isFavorite={favorites.has(result.sym)}
              onToggleFavorite={toggleFavorite}
              onRemove={removePair}
              onLogTrade={handleLogTrade}
            />
          </div>
        ))}
      </div>

      {/* Log Trade Modal */}
      {tradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setTradeModal(null)}
        >
          <div
            className="card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#4fc3f7] font-bold" style={{ fontFamily: 'Space Grotesk' }}>
                📝 Log Trade — {tradeModal.sym.replace('USDT', '')}
              </h3>
              <button
                onClick={() => setTradeModal(null)}
                className="text-[#607d9b] hover:text-[#e0e6f0] bg-transparent border-none cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-[#607d9b] text-sm">
              Use the Journal page to log trades with full details.
            </p>
            <p className="text-[#e0e6f0] text-sm mt-2">
              Pre-fill: <b>${tradeModal.price.toFixed(4)}</b> · Score: <b>{tradeModal.score}/10</b>
            </p>
            <a
              href="/journal"
              className="btn-primary block text-center mt-4 no-underline"
            >
              Go to Journal →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
