import { normalizeSymbol } from './api'

export interface Signal {
  label: string
  ok: boolean | 'warn'
}

export interface ScanResult {
  sym: string
  display: string
  type: 'crypto' | 'forex' | 'stock'
  score: number
  grade: string
  gradeClass: 'fire' | 'valid' | 'weak' | 'skip'
  sigs: Signal[]
  price: number
  rsiNow: number
  rsiPrev: number
  rsiRising: boolean
  e9: number
  e21: number
  e50: number
  macd: string
  volRatio: string
  entryLimit: string
  tp3: string
  tp5: string
  stop: string
  atrStop: string
  atrPct: string
  vwap: string
  greenCount: number
  bb: { upper: number; middle: number; lower: number }
  closes: number[]
  vols: number[]
  times: number[]
  klines: (string | number)[][]
  scanTime: string
}

// ── Technical Indicators ──

export function calcEMA(data: number[], period: number): number {
  const k = 2 / (period + 1)
  let e = data[0]
  for (let i = 1; i < data.length; i++) {
    e = data[i] * k + e * (1 - k)
  }
  return e
}

export function calcEMASeries(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let e = data[0]
  result.push(e)
  for (let i = 1; i < data.length; i++) {
    e = data[i] * k + e * (1 - k)
    result.push(e)
  }
  return result
}

export function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50
  let gains = 0
  let losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) gains += d
    else losses += Math.abs(d)
  }
  if (losses === 0) return 100
  return parseFloat((100 - 100 / (1 + gains / period / (losses / period))).toFixed(1))
}

export function calcRSISeries(closes: number[], period = 14): { idx: number; rsi: number }[] {
  const result: { idx: number; rsi: number }[] = []
  for (let i = period; i < closes.length; i++) {
    result.push({ idx: i, rsi: calcRSI(closes.slice(i - period, i + 1), period) })
  }
  return result
}

export function calcBollingerBands(
  closes: number[],
  period = 20,
  mult = 2
): { upper: number; middle: number; lower: number } {
  const recent = closes.slice(-period)
  const sma = recent.reduce((a, b) => a + b, 0) / recent.length
  const variance = recent.reduce((s, c) => s + Math.pow(c - sma, 2), 0) / recent.length
  const std = Math.sqrt(variance)
  return { upper: sma + mult * std, middle: sma, lower: sma - mult * std }
}

export function calcATR(klines: (string | number)[][], period = 14): number {
  const trs: number[] = []
  for (let i = 1; i < klines.length; i++) {
    const h = parseFloat(String(klines[i][2]))
    const l = parseFloat(String(klines[i][3]))
    const pc = parseFloat(String(klines[i - 1][4]))
    trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)))
  }
  const recent = trs.slice(-period)
  return recent.reduce((a, b) => a + b, 0) / recent.length
}

export function calcVWAP(klines: (string | number)[][]): number {
  let cumTPV = 0
  let cumVol = 0
  for (const k of klines) {
    const tp = (parseFloat(String(k[2])) + parseFloat(String(k[3])) + parseFloat(String(k[4]))) / 3
    const v = parseFloat(String(k[5]))
    cumTPV += tp * v
    cumVol += v
  }
  return cumVol > 0 ? cumTPV / cumVol : 0
}

export function countConsecutiveGreen(klines: (string | number)[][]): number {
  let count = 0
  for (let i = klines.length - 1; i >= 0; i--) {
    if (parseFloat(String(klines[i][4])) > parseFloat(String(klines[i][1]))) count++
    else break
  }
  return count
}

// ── 10-Signal Scoring System ──

export function scoreSignal(
  symRaw: string,
  type: 'crypto' | 'forex' | 'stock',
  klines: (string | number)[][]
): ScanResult {
  const { display } = normalizeSymbol(symRaw)
  const closes = klines.map((k) => parseFloat(String(k[4])))
  const vols = klines.map((k) => parseFloat(String(k[5])))
  const price = closes[closes.length - 1]

  // EMAs
  const e9 = calcEMA(closes.slice(-20), 9)
  const e21 = calcEMA(closes.slice(-30), 21)
  const e50 = calcEMA(closes.slice(-60), 50)

  // RSI
  const rsiNow = calcRSI(closes.slice(-16))
  const rsiPrev = calcRSI(closes.slice(-17, -1))
  const rsiRising = rsiNow > rsiPrev

  // Volume
  const lastVol = vols[vols.length - 1]
  const avgVol = vols.slice(-11, -1).reduce((a, b) => a + b, 0) / 10
  const volRatio = avgVol > 0 ? (lastVol / avgVol).toFixed(2) : '1.00'

  // MACD
  const e12 = calcEMA(closes.slice(-30), 12)
  const e26 = calcEMA(closes.slice(-40), 26)
  const macd = e12 - e26

  // Bollinger Bands
  const bb = calcBollingerBands(closes, Math.min(20, closes.length))
  const bbWidth = bb.upper - bb.lower
  const bbPos = bbWidth > 0 ? (price - bb.lower) / bbWidth : 0.5

  // ATR
  const atr = calcATR(klines)
  const atrStop = (price - 2 * atr).toFixed(4)
  const atrPct = price > 0 ? (atr / price * 100).toFixed(2) : '0'
  const atrRR = atr > 0 ? (price * 0.03) / (2 * atr) : 0

  // VWAP
  const vwap = calcVWAP(klines)

  // Consecutive green candles
  const greenCount = countConsecutiveGreen(klines)

  let score = 0
  const sigs: Signal[] = []

  // Signal 1: EMA Stack (EMA9 > EMA21 > EMA50)
  if (e9 > e21 && e21 > e50) {
    score++
    sigs.push({ label: 'EMA9>21>50', ok: true })
  } else {
    sigs.push({ label: 'EMA Stack', ok: false })
  }

  // Signal 2: RSI Zone (50-80)
  if (rsiNow >= 50 && rsiNow <= 80) {
    score++
    sigs.push({ label: `RSI ${rsiNow} ✓`, ok: true })
  } else if (rsiNow > 80) {
    sigs.push({ label: `RSI ${rsiNow} ⚠`, ok: 'warn' })
  } else {
    sigs.push({ label: `RSI ${rsiNow}`, ok: false })
  }

  // Signal 3: RSI Direction (rising)
  if (rsiRising) {
    score++
    sigs.push({ label: 'RSI↑ Rising', ok: true })
  } else {
    sigs.push({ label: 'RSI↓ Falling', ok: false })
  }

  // Signal 4: Volume Surge (>1.3x avg)
  if (parseFloat(volRatio) >= 1.3) {
    score++
    sigs.push({ label: `Vol ${volRatio}×`, ok: true })
  } else {
    sigs.push({ label: `Vol ${volRatio}×`, ok: false })
  }

  // Signal 5: 1H Trend (EMA9 > EMA21)
  if (e9 > e21) {
    score++
    sigs.push({ label: 'Trend BULL', ok: true })
  } else {
    sigs.push({ label: 'Trend BEAR', ok: false })
  }

  // Signal 6: MACD Positive
  if (macd > 0) {
    score++
    sigs.push({ label: 'MACD+', ok: true })
  } else {
    sigs.push({ label: 'MACD−', ok: false })
  }

  // Signal 7: Bollinger Band position (near lower = bullish oversold)
  if (bbPos < 0.35) {
    score++
    sigs.push({ label: `BB Lower (${(bbPos * 100).toFixed(0)}%)`, ok: true })
  } else if (bbPos > 0.8) {
    sigs.push({ label: `BB Upper (${(bbPos * 100).toFixed(0)}%)`, ok: 'warn' })
  } else {
    sigs.push({ label: `BB Mid (${(bbPos * 100).toFixed(0)}%)`, ok: false })
  }

  // Signal 8: ATR R:R quality
  if (atrRR >= 1.0) {
    score++
    sigs.push({ label: 'ATR RR ≥1:1', ok: true })
  } else {
    sigs.push({ label: 'ATR RR <1:1', ok: false })
  }

  // Signal 9: Price vs VWAP
  if (vwap > 0 && price > vwap) {
    score++
    sigs.push({ label: 'Above VWAP', ok: true })
  } else {
    sigs.push({ label: 'Below VWAP', ok: false })
  }

  // Signal 10: Consecutive green candles (3+)
  if (greenCount >= 3) {
    score++
    sigs.push({ label: `${greenCount} Green Candles`, ok: true })
  } else {
    sigs.push({ label: greenCount === 0 ? 'No Green Run' : `${greenCount} Green`, ok: false })
  }

  // Grade
  let grade: string
  let gradeClass: 'fire' | 'valid' | 'weak' | 'skip'
  if (score >= 8) { grade = '🔥 STRONG'; gradeClass = 'fire' }
  else if (score >= 6) { grade = '✅ VALID'; gradeClass = 'valid' }
  else if (score >= 4) { grade = '⚠️ WEAK'; gradeClass = 'weak' }
  else { grade = '❌ SKIP'; gradeClass = 'skip' }

  const tp3 = (price * 1.03).toFixed(4)
  const tp5 = (price * 1.05).toFixed(4)
  const entryLimit = e9.toFixed(4)
  const stop = e21.toFixed(4)

  return {
    sym: symRaw,
    display,
    type,
    score,
    grade,
    gradeClass,
    sigs,
    price,
    rsiNow,
    rsiPrev,
    rsiRising,
    e9,
    e21,
    e50,
    macd: macd.toFixed(6),
    volRatio,
    entryLimit,
    tp3,
    tp5,
    stop,
    atrStop,
    atrPct,
    vwap: vwap.toFixed(4),
    greenCount,
    bb,
    closes,
    vols,
    times: klines.map((k) => k[0] as number),
    klines,
    scanTime: new Date().toLocaleTimeString(),
  }
}
