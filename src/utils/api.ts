const BINANCE_BASE = 'https://fapi.binance.com'
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'
const CORS_PROXY = 'https://corsproxy.io/?'

export type AssetType = 'crypto' | 'forex' | 'stock'

export function detectSymbolType(raw: string): AssetType {
  const sym = raw.trim().toUpperCase()
  if (/^.+(USDT|BUSD|BTCB|ETHB|BNB)$/.test(sym)) return 'crypto'
  if (/^[A-Z]{6}(=X)?$/.test(sym)) return 'forex'
  return 'stock'
}

export function normalizeSymbol(raw: string): { sym: string; display: string; type: AssetType } {
  const sym = raw.trim().toUpperCase()
  const type = detectSymbolType(sym)
  if (type === 'forex' && !sym.endsWith('=X')) {
    return { sym: sym + '=X', display: sym, type }
  }
  return { sym, display: sym.replace('=X', ''), type }
}

async function fetchBinanceKlines(
  sym: string,
  interval: string,
  limit: number,
  signal?: AbortSignal
): Promise<(string | number)[][]> {
  const url = `${BINANCE_BASE}/fapi/v1/klines?symbol=${sym}&interval=${interval}&limit=${limit}`
  const r = await fetch(url, { signal })
  if (!r.ok) throw new Error(`Binance error: ${r.status}`)
  return r.json()
}

async function fetchYahooKlines(
  sym: string,
  interval: string,
  limit: number,
  signal?: AbortSignal
): Promise<(string | number)[][]> {
  const yInterval =
    interval === '5m' ? '5m'
    : interval === '15m' ? '15m'
    : interval === '1h' ? '60m'
    : '1d'
  const yRange = interval === '4h' || interval === '1d' ? '60d' : '5d'
  const url = `${CORS_PROXY}${encodeURIComponent(
    `${YAHOO_BASE}/${sym}?interval=${yInterval}&range=${yRange}&includePrePost=false`
  )}`

  const r = await fetch(url, { headers: { Accept: 'application/json' }, signal })
  if (!r.ok) throw new Error(`Yahoo error: ${r.status}`)
  const json = await r.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('No Yahoo data')

  const timestamps: number[] = result.timestamps || result.timestamp
  const q = result.indicators?.quote?.[0]
  if (!q || !timestamps) throw new Error('No quote data')

  const klines: (string | number)[][] = []
  for (let i = 0; i < timestamps.length; i++) {
    if (q.open[i] == null || q.close[i] == null) continue
    klines.push([
      timestamps[i] * 1000,
      String(q.open[i]),
      String(q.high[i]),
      String(q.low[i]),
      String(q.close[i]),
      String(q.volume?.[i] || 0),
    ])
  }
  return klines.slice(-limit)
}

export async function fetchKlines(
  sym: string,
  type: AssetType,
  interval: string,
  limit: number,
  signal?: AbortSignal
): Promise<(string | number)[][]> {
  if (type === 'crypto') {
    return fetchBinanceKlines(sym, interval, limit, signal)
  }
  return fetchYahooKlines(sym, interval, limit, signal)
}
