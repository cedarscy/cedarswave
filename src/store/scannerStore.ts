import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ScanResult } from '../utils/scanner'

const DEFAULT_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT',
  'AVAXUSDT', 'LINKUSDT', 'DOGEUSDT', 'LTCUSDT', 'DOTUSDT',
]

interface ScannerSettings {
  interval: '5m' | '15m' | '1h' | '4h'
  limit: 60 | 100 | 200
  minScore: 0 | 4 | 6 | 8
  refreshInterval: number
}

interface ScannerState {
  symbols: string[]
  results: ScanResult[]
  favorites: Set<string>
  scanning: boolean
  lastScanTime: string | null
  settings: ScannerSettings
  addSymbol: (symbol: string) => void
  removeSymbol: (symbol: string) => void
  setSymbols: (symbols: string[]) => void
  setResults: (results: ScanResult[]) => void
  toggleFavorite: (symbol: string) => void
  setScanning: (scanning: boolean) => void
  setLastScanTime: (time: string) => void
  updateSettings: (settings: Partial<ScannerSettings>) => void
}

export const useScannerStore = create<ScannerState>()(
  persist(
    (set, get) => ({
      symbols: DEFAULT_SYMBOLS,
      results: [],
      favorites: new Set<string>(),
      scanning: false,
      lastScanTime: null,
      settings: {
        interval: '15m',
        limit: 60,
        minScore: 4,
        refreshInterval: 60,
      },

      addSymbol: (symbol) => {
        const { symbols } = get()
        if (!symbols.includes(symbol)) {
          set({ symbols: [...symbols, symbol] })
        }
      },

      removeSymbol: (symbol) => {
        const { symbols, favorites } = get()
        const newFavs = new Set(favorites)
        newFavs.delete(symbol)
        set({
          symbols: symbols.filter((s) => s !== symbol),
          favorites: newFavs,
        })
      },

      setSymbols: (symbols) => set({ symbols }),

      setResults: (results) => set({ results }),

      toggleFavorite: (symbol) => {
        const { favorites } = get()
        const newFavs = new Set(favorites)
        if (newFavs.has(symbol)) {
          newFavs.delete(symbol)
        } else {
          newFavs.add(symbol)
        }
        set({ favorites: newFavs })
      },

      setScanning: (scanning) => set({ scanning }),

      setLastScanTime: (time) => set({ lastScanTime: time }),

      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),
    }),
    {
      name: 'cedars-wave-scanner',
      partialize: (state) => ({
        symbols: state.symbols,
        favorites: Array.from(state.favorites),
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray((state as any).favorites)) {
          state.favorites = new Set((state as any).favorites)
        }
      },
    }
  )
)
