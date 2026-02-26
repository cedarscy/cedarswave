import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

interface Props {
  onSaved: () => void
  onCancel: () => void
  defaultSym?: string
  defaultPrice?: number
  defaultScore?: number
}

export function TradeForm({ onSaved, onCancel, defaultSym = '', defaultPrice, defaultScore }: Props) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    symbol: defaultSym,
    direction: 'long' as 'long' | 'short',
    entry_price: defaultPrice?.toString() ?? '',
    exit_price: '',
    size: '',
    score_at_entry: defaultScore?.toString() ?? '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!user) return
    if (!form.symbol || !form.entry_price || !form.size) {
      setError('Symbol, entry price, and size are required.')
      return
    }

    setSaving(true)
    setError('')

    const entryPrice = parseFloat(form.entry_price)
    const exitPrice = form.exit_price ? parseFloat(form.exit_price) : null
    const size = parseFloat(form.size)

    let pnl: number | null = null
    if (exitPrice !== null) {
      pnl = form.direction === 'long'
        ? (exitPrice - entryPrice) * size
        : (entryPrice - exitPrice) * size
    }

    const { error: err } = await supabase.from('trade_journal').insert({
      user_id: user.id,
      symbol: form.symbol.toUpperCase(),
      direction: form.direction,
      entry_price: entryPrice,
      exit_price: exitPrice,
      size,
      score_at_entry: form.score_at_entry ? parseInt(form.score_at_entry) : null,
      notes: form.notes || null,
      pnl,
    })

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      onSaved()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#607d9b] text-xs mb-1">Symbol</label>
          <input
            type="text"
            className="input-base w-full"
            placeholder="BTCUSDT"
            value={form.symbol}
            onChange={(e) => update('symbol', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[#607d9b] text-xs mb-1">Direction</label>
          <select
            className="input-base w-full"
            value={form.direction}
            onChange={(e) => update('direction', e.target.value)}
          >
            <option value="long">Long 📈</option>
            <option value="short">Short 📉</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#607d9b] text-xs mb-1">Entry Price</label>
          <input
            type="number"
            className="input-base w-full"
            placeholder="0.00"
            step="any"
            value={form.entry_price}
            onChange={(e) => update('entry_price', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[#607d9b] text-xs mb-1">Exit Price (optional)</label>
          <input
            type="number"
            className="input-base w-full"
            placeholder="0.00"
            step="any"
            value={form.exit_price}
            onChange={(e) => update('exit_price', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[#607d9b] text-xs mb-1">Size / Qty</label>
          <input
            type="number"
            className="input-base w-full"
            placeholder="0"
            step="any"
            value={form.size}
            onChange={(e) => update('size', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[#607d9b] text-xs mb-1">Score at Entry</label>
          <input
            type="number"
            className="input-base w-full"
            placeholder="0-10"
            min="0"
            max="10"
            value={form.score_at_entry}
            onChange={(e) => update('score_at_entry', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-[#607d9b] text-xs mb-1">Notes</label>
        <textarea
          className="input-base w-full"
          rows={3}
          placeholder="Setup notes, market context..."
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? 'Saving...' : '💾 Save Trade'}
        </button>
        <button onClick={onCancel} className="btn-ghost flex-1">Cancel</button>
      </div>
    </div>
  )
}
