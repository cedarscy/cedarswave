import { useState } from 'react'
import { useScanner } from '../../hooks/useScanner'
import { useSubscription } from '../../hooks/useSubscription'

export function AddPairInput() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const { addPair, symbols } = useScanner()
  const { canAddPair, limits } = useSubscription()

  function handleAdd() {
    const sym = value.trim().toUpperCase()
    if (!sym) return
    setError('')
    try {
      addPair(sym)
      setValue('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const canAdd = canAddPair(symbols.length)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="input-base w-44"
          placeholder="BTCUSDT / AAPL / EURUSD"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          disabled={!canAdd}
        />
        <button
          onClick={handleAdd}
          disabled={!canAdd || !value.trim()}
          className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {!canAdd && (
        <p className="text-[#ffd740] text-xs">
          Max {limits.maxPairs} pairs on Starter. <a href="/pricing" className="underline text-[#4fc3f7]">Upgrade</a>
        </p>
      )}
    </div>
  )
}
