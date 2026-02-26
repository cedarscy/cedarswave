import { useCallback, useRef } from 'react'
import { useScannerStore } from '../store/scannerStore'
import { useSubscription } from './useSubscription'
import { scoreSignal } from '../utils/scanner'
import { fetchKlines, normalizeSymbol } from '../utils/api'

export function useScanner() {
  const {
    symbols,
    results,
    scanning,
    lastScanTime,
    settings,
    addSymbol,
    removeSymbol,
    setResults,
    toggleFavorite,
    setScanning,
    setLastScanTime,
    updateSettings,
    favorites,
  } = useScannerStore()

  const { canAddPair } = useSubscription()
  const abortRef = useRef<AbortController | null>(null)

  const runScan = useCallback(async () => {
    if (scanning) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setScanning(true)
    const scanResults = []

    for (const rawSym of symbols) {
      try {
        const { sym, type } = normalizeSymbol(rawSym)
        const klines = await fetchKlines(sym, type, settings.interval, settings.limit, abortRef.current?.signal)
        if (!klines || klines.length < 30) continue
        const result = scoreSignal(rawSym, type, klines)
        scanResults.push(result)
      } catch (err) {
        console.error(`Failed to scan ${rawSym}:`, err)
      }
    }

    scanResults.sort((a, b) => b.score - a.score)
    setResults(scanResults)
    setLastScanTime(new Date().toLocaleTimeString())
    setScanning(false)
  }, [symbols, scanning, settings])

  const addPair = useCallback(
    (rawSymbol: string) => {
      const { sym } = normalizeSymbol(rawSymbol.trim().toUpperCase())
      if (symbols.includes(sym)) {
        throw new Error(`${sym} is already in the list`)
      }
      if (!canAddPair(symbols.length)) {
        throw new Error('Upgrade to Pro to add more pairs')
      }
      addSymbol(sym)
    },
    [symbols, canAddPair, addSymbol]
  )

  const removePair = useCallback(
    (symbol: string) => {
      removeSymbol(symbol)
    },
    [removeSymbol]
  )

  const filteredResults = results.filter((r) => r.score >= settings.minScore)

  const summary = {
    strong: results.filter((r) => r.score >= 8).length,
    valid: results.filter((r) => r.score >= 6 && r.score < 8).length,
    weak: results.filter((r) => r.score >= 4 && r.score < 6).length,
    skip: results.filter((r) => r.score < 4).length,
    longStrong: results.filter((r) => r.direction === 'long' && r.score >= 8).length,
    longValid: results.filter((r) => r.direction === 'long' && r.score >= 6 && r.score < 8).length,
    shortStrong: results.filter((r) => r.direction === 'short' && r.score >= 8).length,
    shortValid: results.filter((r) => r.direction === 'short' && r.score >= 6 && r.score < 8).length,
    total: results.length,
    best: results[0] ?? null,
  }

  return {
    symbols,
    results: filteredResults,
    allResults: results,
    favorites,
    scanning,
    lastScanTime,
    settings,
    summary,
    runScan,
    addPair,
    removePair,
    toggleFavorite,
    updateSettings,
  }
}
