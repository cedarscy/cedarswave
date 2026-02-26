import { fetchKlines, normalizeSymbol } from '../utils/api'
import { scoreSignal, type ScanResult } from '../utils/scanner'
import { resolveAuth } from './auth'

export interface ScanRequest {
  symbols: string[]
  interval?: string
  limit?: number
  apiKey?: string
}

export interface ScanResponse {
  success: boolean
  results?: ScanResult[]
  error?: string
  meta?: {
    scanned: number
    failed: number
    interval: string
    timestamp: string
    authMethod: 'session' | 'api_key'
  }
}

/**
 * Programmatic scan endpoint — accepts either session auth or API key.
 * This wraps the scanner logic for external/API access.
 */
export async function scanWithAuth(req: ScanRequest): Promise<ScanResponse> {
  const auth = await resolveAuth(req.apiKey)
  if (!auth.authenticated) {
    return { success: false, error: auth.error }
  }

  const interval = req.interval ?? '15m'
  const limit = req.limit ?? 100
  const results: ScanResult[] = []
  let failed = 0

  for (const rawSym of req.symbols) {
    try {
      const { sym, type } = normalizeSymbol(rawSym)
      const klines = await fetchKlines(sym, type, interval, limit)
      if (!klines || klines.length < 30) {
        failed++
        continue
      }
      results.push(scoreSignal(rawSym, type, klines))
    } catch {
      failed++
    }
  }

  results.sort((a, b) => b.score - a.score)

  return {
    success: true,
    results,
    meta: {
      scanned: results.length,
      failed,
      interval,
      timestamp: new Date().toISOString(),
      authMethod: auth.method,
    },
  }
}
