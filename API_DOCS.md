# Cedars Wave Scanner — API Documentation

## Authentication

All API endpoints accept two authentication methods:

### 1. Session Auth (Browser)

Automatically handled via Supabase session cookies when using the web app.

### 2. API Key Auth (Programmatic)

Include your API key in the `X-API-Key` header:

```
X-API-Key: cw_live_your_key_here
```

Generate API keys from **Settings > API Keys** in the web app.

API keys use the prefix `cw_live_` followed by 40 hex characters.

---

## Managing API Keys

### Generate a Key

Navigate to `/settings/api-keys` in the web app, or use the SDK:

```typescript
import { createApiKey } from './src/lib/apiKey'

const key = await createApiKey('My Trading Bot')
// { id: 'uuid', key: 'cw_live_...', name: 'My Trading Bot', ... }
```

### List Keys

```typescript
import { listApiKeys } from './src/lib/apiKey'

const keys = await listApiKeys()
// Returns keys with masked values for display
```

### Revoke a Key

```typescript
import { revokeApiKey } from './src/lib/apiKey'

await revokeApiKey('key-uuid-here')
```

---

## Endpoints

### Scan Symbols

Scan one or more trading symbols using the Cedars Wave 10-signal scoring system.

```typescript
import { scanWithAuth } from './src/api'

const response = await scanWithAuth({
  symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  interval: '15m',     // Optional: '5m' | '15m' | '1h' | '4h' (default: '15m')
  limit: 100,          // Optional: number of klines to fetch (default: 100)
  apiKey: 'cw_live_...', // Required if no active session
})
```

#### Request Parameters

| Parameter  | Type       | Required | Default | Description                          |
|-----------|------------|----------|---------|--------------------------------------|
| `symbols` | `string[]` | Yes      | —       | Array of trading symbols to scan     |
| `interval` | `string`  | No       | `'15m'` | Timeframe: `5m`, `15m`, `1h`, `4h`  |
| `limit`   | `number`   | No       | `100`   | Number of historical candles         |
| `apiKey`  | `string`   | No*      | —       | API key (*required without session)  |

#### Response

```json
{
  "success": true,
  "results": [
    {
      "sym": "BTCUSDT",
      "display": "BTCUSDT",
      "type": "crypto",
      "direction": "long",
      "score": 8,
      "longScore": 8,
      "shortScore": 3,
      "grade": "STRONG",
      "gradeClass": "fire",
      "sigs": [
        { "label": "EMA9>21>50", "ok": true },
        { "label": "RSI 62.4", "ok": true }
      ],
      "price": 67500.00,
      "rsiNow": 62.4,
      "e9": 67450.00,
      "e21": 67200.00,
      "e50": 66800.00,
      "macd": "125.500000",
      "volRatio": "1.85",
      "entryLimit": "67450.0000",
      "tp3": "69525.0000",
      "tp5": "70875.0000",
      "stop": "67200.0000",
      "atrStop": "66200.0000",
      "atrPct": "1.92",
      "vwap": "67300.0000",
      "scanTime": "12:34:56 PM"
    }
  ],
  "meta": {
    "scanned": 3,
    "failed": 0,
    "interval": "15m",
    "timestamp": "2026-02-26T12:34:56.789Z",
    "authMethod": "api_key"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Invalid API key"
}
```

### Fetch Klines (Market Data)

Fetch raw OHLCV candlestick data for a symbol.

```typescript
import { fetchKlines, normalizeSymbol } from './src/utils/api'

const { sym, type } = normalizeSymbol('BTCUSDT')
const klines = await fetchKlines(sym, type, '15m', 100)
// Returns: [timestamp, open, high, low, close, volume][]
```

#### Supported Symbol Types

| Type    | Examples                     | Data Source       |
|---------|------------------------------|-------------------|
| Crypto  | `BTCUSDT`, `ETHUSDT`         | Binance Futures   |
| Stocks  | `AAPL`, `MSFT`, `TSLA`      | Yahoo Finance     |
| Forex   | `EURUSD`, `GBPJPY`          | Yahoo Finance     |

### Score Signal

Run the 10-signal scoring algorithm on kline data.

```typescript
import { scoreSignal } from './src/utils/scanner'

const result = scoreSignal('BTCUSDT', 'crypto', klines)
// Returns: ScanResult with score, direction, signals, TP/SL levels
```

---

## Scoring System

The Cedars Wave scanner uses a 10-signal scoring system:

### Long Signals (6)
1. **EMA Stack** — EMA9 > EMA21 > EMA50
2. **RSI Zone** — RSI between 50-80
3. **RSI Rising** — Current RSI > Previous RSI
4. **Volume Surge** — Current volume >= 1.3x average
5. **Bullish Trend** — EMA9 > EMA21
6. **MACD Positive** — MACD line above zero

### Short Signals (6)
1. **EMA Stack** — EMA9 < EMA21 < EMA50
2. **RSI Zone** — RSI between 20-50
3. **RSI Falling** — Current RSI < Previous RSI
4. **Volume Surge** — Current volume >= 1.3x average
5. **Bearish Trend** — EMA9 < EMA21
6. **MACD Negative** — MACD line below zero

### Shared Signals (4, applied to both)
7. **Bollinger Bands** — Price near lower band (long) or upper band (short)
8. **ATR Risk/Reward** — R:R ratio >= 1:1
9. **VWAP** — Price above VWAP (long) or below VWAP (short)
10. **Candle Run** — 3+ consecutive green (long) or red (short) candles

### Grades
| Score | Grade    | Class  |
|-------|----------|--------|
| 8-10  | STRONG   | fire   |
| 6-7   | VALID    | valid  |
| 4-5   | WEAK     | weak   |
| 0-3   | SKIP     | skip   |

---

## Rate Limits

- Market data is fetched from Binance and Yahoo Finance directly
- Binance: No auth required, standard rate limits apply
- Yahoo Finance: Proxied via CORS proxy, subject to proxy limits
- API key validation: No rate limit (Supabase queries)

---

## Database Schema

### `api_keys` Table

| Column       | Type        | Description                    |
|-------------|-------------|--------------------------------|
| `id`        | `uuid`      | Primary key                    |
| `user_id`   | `uuid`      | FK to `auth.users`             |
| `key`       | `text`      | Unique API key string          |
| `name`      | `text`      | User-given label               |
| `created_at`| `timestamp` | Creation time                  |
| `last_used_at`| `timestamp` | Last successful validation   |

Row-Level Security ensures users can only manage their own keys.
