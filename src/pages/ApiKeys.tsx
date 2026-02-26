import { useState, useEffect, useCallback } from 'react'
import { createApiKey, listApiKeys, revokeApiKey } from '../lib/apiKey'

interface ApiKeyRow {
  id: string
  name: string
  key: string
  maskedKey: string
  created_at: string
  last_used_at: string | null
}

export function ApiKeys() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [revealedKey, setRevealedKey] = useState<string | null>(null)
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadKeys = useCallback(async () => {
    try {
      setError(null)
      const data = await listApiKeys()
      setKeys(data as ApiKeyRow[])
    } catch (err: any) {
      setError(err.message ?? 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadKeys()
  }, [loadKeys])

  async function handleCreate() {
    if (!newKeyName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const created = await createApiKey(newKeyName.trim())
      setJustCreatedKey(created.key)
      setNewKeyName('')
      await loadKeys()
    } catch (err: any) {
      setError(err.message ?? 'Failed to create key')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`Revoke API key "${name}"? This cannot be undone.`)) return
    setError(null)
    try {
      await revokeApiKey(id)
      if (justCreatedKey) setJustCreatedKey(null)
      await loadKeys()
    } catch (err: any) {
      setError(err.message ?? 'Failed to revoke key')
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#e0e6f0] mb-2" style={{ fontFamily: 'Space Grotesk' }}>
        API Keys
      </h1>
      <p className="text-[#607d9b] text-sm mb-6">
        Create API keys to access the Cedars Wave scanner programmatically.
        Include your key in the <code className="text-[#4fc3f7] bg-[#0d2035] px-1.5 py-0.5 rounded text-xs">X-API-Key</code> header.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[#1a0000] border border-[#c62828] text-[#ef5350] text-sm">
          {error}
        </div>
      )}

      {/* Just-created key banner */}
      {justCreatedKey && (
        <div className="mb-4 p-4 rounded-lg bg-[#0d2035] border border-[#1565c0]">
          <p className="text-[#4fc3f7] text-sm font-semibold mb-2">
            New API key created — copy it now, it won't be shown again in full.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[#e0e6f0] bg-[#0a0e1a] px-3 py-2 rounded text-xs font-mono break-all">
              {justCreatedKey}
            </code>
            <button
              onClick={() => handleCopy(justCreatedKey)}
              className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setJustCreatedKey(null)}
            className="text-[#607d9b] text-xs mt-2 hover:text-[#e0e6f0]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="card p-5 mb-4">
        <h2 className="text-[#4fc3f7] font-semibold mb-3" style={{ fontFamily: 'Space Grotesk' }}>
          Create New Key
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-base flex-1"
            placeholder="Key name (e.g. Trading Bot, Webhook...)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            maxLength={50}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim()}
            className="btn-primary text-sm whitespace-nowrap disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Generate Key'}
          </button>
        </div>
      </div>

      {/* Keys list */}
      <div className="card p-5">
        <h2 className="text-[#4fc3f7] font-semibold mb-3" style={{ fontFamily: 'Space Grotesk' }}>
          Your API Keys
        </h2>

        {loading ? (
          <p className="text-[#607d9b] text-sm">Loading...</p>
        ) : keys.length === 0 ? (
          <p className="text-[#607d9b] text-sm">No API keys yet. Create one above to get started.</p>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0a0e1a] border border-[#1e3050]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#e0e6f0] font-medium text-sm">{k.name}</p>
                  <p className="text-[#607d9b] text-xs font-mono mt-0.5">
                    {revealedKey === k.id ? k.key : k.maskedKey}
                  </p>
                  <div className="flex gap-3 mt-1 text-[#546e7a] text-xs">
                    <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                    {k.last_used_at && (
                      <span>Last used {new Date(k.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => setRevealedKey(revealedKey === k.id ? null : k.id)}
                    className="text-[#607d9b] hover:text-[#e0e6f0] text-xs px-2 py-1 rounded border border-[#1e3050] hover:border-[#4fc3f7] transition-colors"
                  >
                    {revealedKey === k.id ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    onClick={() => handleCopy(k.key)}
                    className="text-[#607d9b] hover:text-[#e0e6f0] text-xs px-2 py-1 rounded border border-[#1e3050] hover:border-[#4fc3f7] transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleRevoke(k.id, k.name)}
                    className="text-[#ef5350] hover:text-white text-xs px-2 py-1 rounded border border-[#c62828] hover:bg-[#c62828] transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage example */}
      <div className="card p-5 mt-4">
        <h2 className="text-[#4fc3f7] font-semibold mb-3" style={{ fontFamily: 'Space Grotesk' }}>
          Quick Start
        </h2>
        <p className="text-[#607d9b] text-sm mb-3">
          Use your API key to scan symbols programmatically:
        </p>
        <pre className="bg-[#0a0e1a] border border-[#1e3050] rounded-lg p-4 text-xs text-[#e0e6f0] overflow-x-auto">
{`import { scanWithAuth } from './api'

const response = await scanWithAuth({
  symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  interval: '15m',
  apiKey: 'cw_live_your_key_here',
})

// Or use the X-API-Key header with fetch:
fetch('/api/scan', {
  method: 'POST',
  headers: {
    'X-API-Key': 'cw_live_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    symbols: ['BTCUSDT', 'ETHUSDT'],
    interval: '15m',
  }),
})`}
        </pre>
      </div>

      <p className="text-[#37474f] text-xs text-center mt-6">
        API keys grant full access to your account's scanner. Keep them secret.
      </p>
    </div>
  )
}
