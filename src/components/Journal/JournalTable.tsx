import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { TradeForm } from './TradeForm'
import { useSubscription } from '../../hooks/useSubscription'

interface Trade {
  id: string
  symbol: string
  direction: 'long' | 'short'
  entry_price: number
  exit_price: number | null
  size: number
  score_at_entry: number | null
  notes: string | null
  pnl: number | null
  created_at: string
}

export function JournalTable() {
  const { user } = useAuthStore()
  const { canUseJournal, limits } = useSubscription()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadTrades()
  }, [user])

  async function loadTrades() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('trade_journal')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500)
    setTrades(data as Trade[] ?? [])
    setLoading(false)
  }

  async function deleteTrade(id: string) {
    if (!confirm('Delete this trade?')) return
    await supabase.from('trade_journal').delete().eq('id', id)
    setTrades((prev) => prev.filter((t) => t.id !== id))
  }

  function exportCSV() {
    const headers = ['Date', 'Symbol', 'Direction', 'Entry', 'Exit', 'Size', 'P&L', 'Score', 'Notes']
    const rows = trades.map((t) => [
      new Date(t.created_at).toLocaleDateString(),
      t.symbol,
      t.direction,
      t.entry_price,
      t.exit_price ?? '',
      t.size,
      t.pnl?.toFixed(2) ?? '',
      t.score_at_entry ?? '',
      t.notes ?? '',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cedars-wave-journal.csv'
    a.click()
  }

  const totalPnl = trades.filter((t) => t.pnl !== null).reduce((s, t) => s + (t.pnl ?? 0), 0)
  const winTrades = trades.filter((t) => (t.pnl ?? 0) > 0)
  const winRate = trades.filter((t) => t.pnl !== null).length > 0
    ? ((winTrades.length / trades.filter((t) => t.pnl !== null).length) * 100).toFixed(0)
    : '—'

  const canAdd = canUseJournal(trades.length)

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-[#4fc3f7] font-bold text-xl" style={{ fontFamily: 'Space Grotesk' }}>
          📝 Trade Journal
        </h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-ghost text-xs py-1.5 px-3">⬇ Export CSV</button>
          {canAdd ? (
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs py-1.5 px-3">
              + Log Trade
            </button>
          ) : (
            <span className="text-[#ffd740] text-xs self-center">
              Limit: {limits.maxJournalEntries} entries. <a href="/pricing" className="underline text-[#4fc3f7]">Upgrade</a>
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {[
          { label: 'Total Trades', value: trades.length, color: 'text-[#4fc3f7]' },
          { label: 'Total P&L', value: `$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-[#69f0ae]' : 'text-[#ef5350]' },
          { label: 'Win Rate', value: `${winRate}%`, color: 'text-[#4fc3f7]' },
          { label: 'Winners', value: winTrades.length, color: 'text-[#69f0ae]' },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 min-w-[100px]">
            <div className="text-[10px] text-[#546e7a] uppercase tracking-wide">{stat.label}</div>
            <div className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Add trade form */}
      {showForm && (
        <div className="card p-4 mb-4">
          <h3 className="text-[#4fc3f7] font-semibold mb-3" style={{ fontFamily: 'Space Grotesk' }}>New Trade</h3>
          <TradeForm
            onSaved={() => { setShowForm(false); loadTrades() }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#1e3050]">
        {loading ? (
          <div className="p-8 text-center text-[#607d9b]">
            <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 8px' }} />
            Loading trades...
          </div>
        ) : trades.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-[#607d9b]">No trades yet. Log your first trade!</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                {['Date', 'Symbol', 'Dir', 'Entry', 'Exit', 'Size', 'P&L', 'Score', 'Notes', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[#607d9b] font-bold border-b border-[#1e3050] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-[#1a2d45] hover:bg-[#0b1220] transition-colors">
                  <td className="px-3 py-2 text-[#607d9b] whitespace-nowrap">
                    {new Date(trade.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 font-bold text-[#e0e6f0] whitespace-nowrap">
                    {trade.symbol.replace('USDT', '')}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${trade.direction === 'long' ? 'bg-[#003300] text-[#69f0ae]' : 'bg-[#3a0000] text-[#ef9a9a]'}`}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[#e0e6f0] font-mono whitespace-nowrap">{trade.entry_price}</td>
                  <td className="px-3 py-2 text-[#e0e6f0] font-mono whitespace-nowrap">{trade.exit_price ?? '—'}</td>
                  <td className="px-3 py-2 text-[#607d9b]">{trade.size}</td>
                  <td className={`px-3 py-2 font-bold whitespace-nowrap ${trade.pnl === null ? 'text-[#546e7a]' : trade.pnl >= 0 ? 'text-[#69f0ae]' : 'text-[#ef5350]'}`}>
                    {trade.pnl === null ? 'Open' : `$${trade.pnl.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-2 text-[#4fc3f7]">{trade.score_at_entry ?? '—'}</td>
                  <td className="px-3 py-2 text-[#607d9b] max-w-[150px] truncate">{trade.notes ?? '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => deleteTrade(trade.id)}
                      className="text-[#546e7a] hover:text-[#ef5350] transition-colors bg-transparent border-none cursor-pointer text-sm"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
