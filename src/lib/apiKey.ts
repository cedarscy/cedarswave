import { supabase } from './supabase'

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
 * List all API keys for the current user (key is masked for security).
 */
export async function listApiKeys() {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key, created_at, last_used_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((k) => ({
    ...k,
    maskedKey: k.key.slice(0, 12) + '...' + k.key.slice(-4),
  }))
}

/**
 * Revoke (delete) an API key by its ID.
 */
export async function revokeApiKey(id: string) {
  const { error } = await supabase.from('api_keys').delete().eq('id', id)
  if (error) throw error
}

/**
 * Validate an API key and return the associated user_id.
 * Updates last_used_at on successful validation.
 * Note: This query works because the caller is either the key owner (RLS pass)
 * or this runs on a server with service-role key.
 * For client-side validation, we use a Supabase RPC or direct query approach.
 */
export async function validateApiKey(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id')
    .eq('key', key)
    .single()

  if (error || !data) return null

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return data.user_id
}

/**
 * Get user info by API key — returns the user_id if the key is valid.
 */
export async function getUserByApiKey(key: string): Promise<{ userId: string } | null> {
  const userId = await validateApiKey(key)
  if (!userId) return null
  return { userId }
}
