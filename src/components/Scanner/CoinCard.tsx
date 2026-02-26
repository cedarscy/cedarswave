import { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'
import type { ScanResult } from '../../utils/scanner'
import { calcEMASeries, calcRSISeries, calcBollingerBands } from '../../utils/scanner'
import { SignalBadge } from './SignalBadge'

interface Props {
  data: ScanResult
  isFavorite: boolean
  onToggleFavorite: (sym: string) => void
  onRemove: (sym: string) => void
  onLogTrade: (sym: string, price: number, score: number) => void
}

const GRADE_BORDER: Record<string, string> = {
  fire: 'border-[#e65100] shadow-[0_0_12px_rgba(230,81,0,0.15)]',
  valid: 'border-[#00c853]',
  weak: 'border-[#ffab00]',
  skip: 'border-[#37474f] opacity-70',
}

const GRADE_FILL: Record<string, string> = {
  fire: '#ff6d00',
  valid: '#69f0ae',
  weak: '#ffd740',
  skip: '#546e7a',
}

export function CoinCard({ data, isFavorite, onToggleFavorite, onRemove, onLogTrade }: Props) {
  const chartRef = useRef<HTMLDivElement>(null)
  const rsiRef = useRef<HTMLDivElement>(null)
  const [chartsReady, setChartsReady] = useState(false)

  const priceStr = data.price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })

  const typeLabel =
    data.type === 'crypto' ? 'CRYPTO' : data.type === 'forex' ? 'FOREX' : 'STOCK'

  useEffect(() => {
    if (!chartRef.current || !rsiRef.current) return

    const chartBg = '#0d1526'
    const gridCol = '#1a2d45'
    const textCol = '#607d9b'
    const rsiBg = '#0a0e1a'

    // Main chart
    const mainChart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 200,
      layout: { background: { color: chartBg }, textColor: textCol },
      grid: { vertLines: { color: gridCol }, horzLines: { color: gridCol } },
      timeScale: { borderColor: gridCol, timeVisible: true },
      rightPriceScale: { borderColor: gridCol },
      crosshair: { mode: 1 },
      handleScroll: false,
      handleScale: false,
    })

    const candleSeries = mainChart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    const candles = data.klines.slice(-60).map((k) => ({
      time: Math.floor((k[0] as number) / 1000) as any,
      open: parseFloat(String(k[1])),
      high: parseFloat(String(k[2])),
      low: parseFloat(String(k[3])),
      close: parseFloat(String(k[4])),
    }))
    candleSeries.setData(candles)

    const closes = data.klines.slice(-60).map((k) => parseFloat(String(k[4])))
    const times = data.klines.slice(-60).map((k) => Math.floor((k[0] as number) / 1000) as any)

    const e9s = calcEMASeries(closes, 9)
    const e21s = calcEMASeries(closes, 21)
    const e50s = calcEMASeries(closes, 50)

    const ema9Series = mainChart.addLineSeries({ color: '#ff9800', lineWidth: 1 })
    ema9Series.setData(e9s.map((v, i) => ({ time: times[i], value: v })))

    const ema21Series = mainChart.addLineSeries({ color: '#2196f3', lineWidth: 1 })
    ema21Series.setData(e21s.map((v, i) => ({ time: times[i], value: v })))

    const ema50Series = mainChart.addLineSeries({ color: '#9c27b0', lineWidth: 1 })
    ema50Series.setData(e50s.map((v, i) => ({ time: times[i], value: v })))

    // Bollinger Bands
    const bbUpper = mainChart.addLineSeries({
      color: 'rgba(150,150,255,0.5)',
      lineWidth: 1,
      lineStyle: 2,
    })
    const bbLower = mainChart.addLineSeries({
      color: 'rgba(150,150,255,0.5)',
      lineWidth: 1,
      lineStyle: 2,
    })

    const bbData = closes.map((_, i) => {
      if (i < 19) return null
      const slice = closes.slice(i - 19, i + 1)
      return calcBollingerBands(slice)
    })

    bbUpper.setData(
      bbData
        .map((b, i) => (b ? { time: times[i], value: b.upper } : null))
        .filter(Boolean) as any
    )
    bbLower.setData(
      bbData
        .map((b, i) => (b ? { time: times[i], value: b.lower } : null))
        .filter(Boolean) as any
    )

    // VWAP line
    const vwapLine = mainChart.addLineSeries({
      color: '#ffd740',
      lineWidth: 1,
      lineStyle: 2,
    })
    vwapLine.setData(
      times.slice(-5).map((t) => ({ time: t, value: parseFloat(data.vwap) }))
    )

    mainChart.timeScale().fitContent()

    // RSI chart
    const rsiChart = createChart(rsiRef.current, {
      width: rsiRef.current.clientWidth,
      height: 70,
      layout: { background: { color: rsiBg }, textColor: textCol },
      grid: { vertLines: { color: gridCol }, horzLines: { color: gridCol } },
      timeScale: { borderColor: gridCol, timeVisible: false, visible: false },
      rightPriceScale: { borderColor: gridCol, scaleMargins: { top: 0.1, bottom: 0.1 } },
      handleScroll: false,
      handleScale: false,
    })

    const rsiSeries = rsiChart.addLineSeries({ color: '#e040fb', lineWidth: 1 })
    const rsiData = calcRSISeries(closes, 14).map((r) => ({ time: times[r.idx], value: r.rsi }))
    rsiSeries.setData(rsiData)

    const tRange = times.slice(-20)
    const r70 = rsiChart.addLineSeries({ color: '#ef5350', lineWidth: 1, lineStyle: 2 })
    r70.setData(tRange.map((t) => ({ time: t, value: 70 })))
    const r50 = rsiChart.addLineSeries({ color: '#78909c', lineWidth: 1, lineStyle: 2 })
    r50.setData(tRange.map((t) => ({ time: t, value: 50 })))
    const r30 = rsiChart.addLineSeries({ color: '#26a69a', lineWidth: 1, lineStyle: 2 })
    r30.setData(tRange.map((t) => ({ time: t, value: 30 })))

    rsiChart.timeScale().fitContent()
    setChartsReady(true)

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) mainChart.applyOptions({ width: chartRef.current.clientWidth })
      if (rsiRef.current) rsiChart.applyOptions({ width: rsiRef.current.clientWidth })
    })
    if (chartRef.current) resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      mainChart.remove()
      rsiChart.remove()
    }
  }, [data.sym, data.scanTime])

  return (
    <div
      className={`card border overflow-hidden transition-all duration-200 ${GRADE_BORDER[data.gradeClass]}`}
    >
      {/* Score progress bar */}
      <div className="h-[3px] bg-[#1a2d45]">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${(data.score / 10) * 100}%`,
            background: GRADE_FILL[data.gradeClass],
          }}
        />
      </div>

      {/* Card header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-[#1a2d45]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-bold text-[#e0e6f0] text-sm" style={{ fontFamily: 'Space Grotesk' }}>
            {data.display.replace('USDT', '')}
          </span>
          <span className="text-[9px] text-[#546e7a] bg-[#0b1220] rounded px-1 py-0.5">{typeLabel}</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full grade-${data.gradeClass}`}
          >
            {data.grade} {data.score}/10
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[#90caf9] text-xs font-mono">${priceStr}</span>
          <button
            onClick={() => onToggleFavorite(data.sym)}
            className={`text-sm px-1 py-0.5 bg-transparent border-none cursor-pointer transition-colors ${
              isFavorite ? 'text-[#ffd740]' : 'text-[#546e7a] hover:text-[#ffd740]'
            }`}
            title="Add to watchlist"
          >
            ⭐
          </button>
          <button
            onClick={() => onRemove(data.sym)}
            className="text-sm px-1 py-0.5 bg-transparent border-none cursor-pointer text-[#546e7a] hover:text-[#ef5350] transition-colors"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="h-[200px]" />
      {/* RSI */}
      <div ref={rsiRef} className="h-[70px] border-t border-[#1a2d45]" />

      {/* Signals */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-[#1a2d45]">
        {data.sigs.map((sig, i) => (
          <SignalBadge key={i} signal={sig} />
        ))}
      </div>

      {/* Entry info */}
      <div className="px-3 py-2 text-[11px] text-[#546e7a] border-t border-[#1a2d45] flex flex-wrap gap-x-3 gap-y-1">
        <span>📍 Limit: <b className="text-[#4fc3f7]">${data.entryLimit}</b></span>
        <span>🎯 TP3: <b className="text-[#4fc3f7]">${data.tp3}</b></span>
        <span>🎯 TP5: <b className="text-[#4fc3f7]">${data.tp5}</b></span>
        <span>🛑 Stop: <b className="text-[#4fc3f7]">${data.stop}</b></span>
        <span>VWAP: <b className="text-[#4fc3f7]">${data.vwap}</b></span>
        <span>ATR: <b className="text-[#4fc3f7]">{data.atrPct}%</b></span>
        <span className="ml-auto text-[9px] text-[#37474f]">🕐 {data.scanTime}</span>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 border-t border-[#1a2d45] flex gap-2 items-center flex-wrap">
        <button
          onClick={() => onLogTrade(data.sym, data.price, data.score)}
          className="btn-ghost text-[10px] py-1 px-2"
        >
          📝 Log Trade
        </button>
        <span className="text-[9px] text-[#546e7a] bg-[#0b1220] border border-[#1e3050] rounded-full px-2 py-0.5">
          RSI: {data.rsiNow} {data.rsiRising ? '↑' : '↓'}
        </span>
        <span className="text-[9px] text-[#546e7a] bg-[#0b1220] border border-[#1e3050] rounded-full px-2 py-0.5">
          Vol: {data.volRatio}×
        </span>
        <span className="text-[9px] text-[#546e7a] bg-[#0b1220] border border-[#1e3050] rounded-full px-2 py-0.5">
          🟢 {data.greenCount}
        </span>
      </div>
    </div>
  )
}
