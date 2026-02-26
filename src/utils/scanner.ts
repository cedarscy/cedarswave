import { normalizeSymbol } from './api'

export interface Signal {
  label: string
  ok: boolean | 'warn'
}

export interface ScanResult {
  sym: string
  display: string
  type: 'crypto' | 'forex' | 'stock'
  direction: 'long' | 'short'
  score: number
  longScore: number
  shortScore: number
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

export function countConsecutiveRed(klines: (string | number)[][]): number {
  let count = 0
  for (let i = klines.length - 1; i >= 0; i--) {
    if (parseFloat(String(klines[i][4])) < parseFloat(String(klines[i][1]))) count++
    else break
  }
  return count
}

// ── 10-Signal Scoring System (Long + Short) ──

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
  const atrPct = price > 0 ? (atr / price * 100).toFixed(2) : '0'
  const atrRR = atr > 0 ? (price * 0.03) / (2 * atr) : 0

  // VWAP
  const vwap = calcVWAP(klines)

  // Consecutive candle runs
  const greenCount = countConsecutiveGreen(klines)
  const redCount = countConsecutiveRed(klines)

  // ── LONG score (6 core signals) ──
  let longScore = 0
  const longSigs: Signal[] = []

  // L1: Bullish EMA Stack
  if (e9 > e21 && e21 > e50) { longScore++; longSigs.push({ label: 'EMA9>21>50', ok: true }) }
  else { longSigs.push({ label: 'EMA Stack', ok: false }) }

  // L2: RSI 50-80
  if (rsiNow >= 50 && rsiNow <= 80) { longScore++; longSigs.push({ label: `RSI ${rsiNow} ✓`, ok: true }) }
  else if (rsiNow > 80) { longSigs.push({ label: `RSI ${rsiNow} ⚠`, ok: 'warn' }) }
  else { longSigs.push({ label: `RSI ${rsiNow}`, ok: false }) }

  // L3: RSI Rising
  if (rsiRising) { longScore++; longSigs.push({ label: 'RSI↑ Rising', ok: true }) }
  else { longSigs.push({ label: 'RSI↓ Falling', ok: false }) }

  // L4: Volume Surge
  if (parseFloat(volRatio) >= 1.3) { longScore++; longSigs.push({ label: `Vol ${volRatio}×`, ok: true }) }
  else { longSigs.push({ label: `Vol ${volRatio}×`, ok: false }) }

  // L5: Bullish Trend
  if (e9 > e21) { longScore++; longSigs.push({ label: 'Trend BULL', ok: true }) }
  else { longSigs.push({ label: 'Trend BEAR', ok: false }) }

  // L6: MACD Positive
  if (macd > 0) { longScore++; longSigs.push({ label: 'MACD+', ok: true }) }
  else { longSigs.push({ label: 'MACD−', ok: false }) }

  // ── SHORT score (6 mirrored signals) ──
  let shortScore = 0
  const shortSigs: Signal[] = []

  // S1: Bearish EMA Stack (e9 < e21 < e50)
  if (e9 < e21 && e21 < e50) { shortScore++; shortSigs.push({ label: 'EMA9<21<50', ok: true }) }
  else { shortSigs.push({ label: 'EMA Stack', ok: false }) }

  // S2: RSI 20-50
  if (rsiNow >= 20 && rsiNow <= 50) { shortScore++; shortSigs.push({ label: `RSI ${rsiNow} ✓`, ok: true }) }
  else if (rsiNow < 20) { shortSigs.push({ label: `RSI ${rsiNow} ⚠`, ok: 'warn' }) }
  else { shortSigs.push({ label: `RSI ${rsiNow}`, ok: false }) }

  // S3: RSI Falling
  if (!rsiRising) { shortScore++; shortSigs.push({ label: 'RSI↓ Falling', ok: true }) }
  else { shortSigs.push({ label: 'RSI↑ Rising', ok: false }) }

  // S4: Volume Surge (same threshold)
  if (parseFloat(volRatio) >= 1.3) { shortScore++; shortSigs.push({ label: `Vol ${volRatio}×`, ok: true }) }
  else { shortSigs.push({ label: `Vol ${volRatio}×`, ok: false }) }

  // S5: Bearish Trend (e9 < e21)
  if (e9 < e21) { shortScore++; shortSigs.push({ label: 'Trend BEAR', ok: true }) }
  else { shortSigs.push({ label: 'Trend BULL', ok: false }) }

  // S6: MACD Negative
  if (macd < 0) { shortScore++; shortSigs.push({ label: 'MACD−', ok: true }) }
  else { shortSigs.push({ label: 'MACD+', ok: false }) }

  // ── Shared signals (4) applied to both sides ──
  // Signal 7: BB position
  const bbLongOk = bbPos < 0.35
  const bbShortOk = bbPos > 0.65
  if (bbLongOk) longScore++
  if (bbShortOk) shortScore++
longSigs.push({ label: bbPos < 0.35 ? `BB Lower (${(bbPos * 100).toFixed(0)}%)` : bbPos > 0.8 ? `BB Upper (${(bbPos * 100).toFixed(0)}%)` : `BB Mid (${(bbPos * 100).toFixed(0)}%)`, ok: bbLongOk ? true : bbPos > 0.8 ? 'warn' : false })
  shortSigs.push({ label: bbPos > 0.65 ? `BB Upper (${(bbPos * 100).toFixed(0)}%)` : bbPos < 0.2 ? `BB Lower (${(bbPos * 100).toFixed(0)}%)` : `BB Mid (${(bbPos * 100).toFixed(0)}%)`, ok: bbShortOk ? true : bbPos < 0.2 ? 'warn' : false })

  // Signal 8: ATR R:R
  if (atrRR >= 1.0) { longScore++; shortScore++ }
  longSigs.push({ label: atrRR >= 1.0 ? 'ATR RR ≥1:1' : 'ATR RR <1:1', ok: atrRR >= 1.0 })
  shortSigs.push({ label: atrRR >= 1.0 ? 'ATR RR ≥1:1' : 'ATR RR <1:1', ok: atrRR >= 1.0 })

  // Signal 9: VWAP (long = above, short = below)
  if (vwap > 0 && price > vwap) { longScore++ }
  if (vwap > 0 && price < vwap) { shortScore++ }
  longSigs.push({ label: price > vwap ? 'Above VWAP' : 'Below VWAP', ok: vwap > 0 && price > vwap })
  shortSigs.push({ label: price < vwap ? 'Below VWAP' : 'Above VWAP', ok: vwap > 0 && price < vwap })

  // Signal 10: Candle runs (long = green, short = red)
  if (greenCount >= 3) longScore++
  if (redCount >= 3) shortScore++
  longSigs.push({ label: greenCount >= 3 ? `${greenCount} Green Candles` : greenCount === 0 ? 'No Green Run' : `${greenCount} Green`, ok: greenCount >= 3 })
  shortSigs.push({ label: redCount >= 3 ? `${redCount} Red Candles` : redCount === 0 ? 'No Red Run' : `${redCount} Red`, ok: redCount >= 3 })

  // ── Pick dominant direction ──
  const direction: 'long' | 'short' = longScore >= shortScore ? 'long' : 'short'
  const score = direction === 'long' ? longScore : shortScore
  const sigs = direction === 'long' ? longSigs : shortSigs

  // Grade
  let grade: string
  let gradeClass: 'fire' | 'valid' | 'weak' | 'skip'
  if (score >= 8) { grade = '🔥 STRONG'; gradeClass = 'fire' }
  else if (score >= 6) { grade = '✅ VALID'; gradeClass = 'valid' }
  else if (score >= 4) { grade = '⚠️ WEAK'; gradeClass = 'weak' }
  else { grade = '❌ SKIP'; gradeClass = 'skip' }

  // TP / Stop depend on direction
  let tp3: string, tp5: string, entryLimit: string, stop: string, atrStop: string
  if (direction === 'long') {
    tp3 = (price * 1.03).toFixed(4)
    tp5 = (price * 1.05).toFixed(4)
    entryLimit = e9.toFixed(4)
    stop = e21.toFixed(4)
    atrStop = (price - 2 * atr).toFixed(4)
  } else {
    tp3 = (price * 0.97).toFixed(4)
    tp5 = (price * 0.95).toFixed(4)
    entryLimit = e9.toFixed(4)
    stop = e21.toFixed(4)
    atrStop = (price + 2 * atr).toFixed(4)
  }

  return {
    sym: symRaw,
    display,
    type,
    direction,
    score,
    longScore,
    shortScore,
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
