import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

/**
 * Generate a cryptographically random API key with a recognizable prefix.
 * Format: cw_live_<40 hex chars>
 */
export function generateApiKey(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `cw_live_${hex}`
}

/**
 * Create a new API key for the current authenticated user.
 */
export async function createApiKey(name: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const key = generateApiKey()
  const { data, error } = await supabase
    .from('api_keys')
    .insert({ user_id: user.id, key, name })
    .select()
    .single()

  if (error) throw error
  return { ...data, key }
}

/**
 * List all API keys for the current user.
 * Selects masked version — does NOT expose full key after creation.
 */
export async function listApiKeys() {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key, created_at, last_used_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((k) => {
    // Use key_masked if available; otherwise generate from key
    const masked = k.key
      ? k.key.slice(0, 8) + '...' + k.key.slice(-4)
      : '****...'
    return {
      id: k.id,
      name: k.name,
      created_at: k.created_at,
      last_used_at: k.last_used_at,
      maskedKey: masked,
    }
  })
}

/**
 * Revoke (delete) an API key by its ID.
 */
export async function revokeApiKey(id: string) {
  const { error } = await supabase.from('api_keys').delete().eq('id', id)
  if (error) throw error
}

/**
 * Validate an API key server-side via Edge Function.
 * Uses service-role key to query cross-user — client can't do this safely.
 * Returns { valid, userId, tier } or { valid: false }.
 */
export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string; tier?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/validate-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ apiKey }),
    })
    if (!response.ok) return { valid: false }
    return await response.json()
  } catch {
    return { valid: false }
  }
}

/**
 * Get user info by API key — returns the user_id if the key is valid.
 */
export async function getUserByApiKey(key: string): Promise<{ userId: string } | null> {
  const result = await validateApiKey(key)
  if (!result.valid || !result.userId) return null
  return { userId: result.userId }
}
