import { supabase } from '../lib/supabase'
import { validateApiKey } from '../lib/apiKey'

export type AuthResult =
  | { authenticated: true; userId: string; method: 'session' | 'api_key' }
  | { authenticated: false; error: string }

/**
 * Resolve authentication from either an active Supabase session or an X-API-Key header value.
 * Used by all API-accessible endpoints to support dual auth.
 */
export async function resolveAuth(apiKey?: string | null): Promise<AuthResult> {
  // 1. Try API key first if provided
  if (apiKey) {
    const userId = await validateApiKey(apiKey)
    if (userId) {
      return { authenticated: true, userId, method: 'api_key' }
    }
    return { authenticated: false, error: 'Invalid API key' }
  }

  // 2. Fall back to Supabase session
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return { authenticated: true, userId: user.id, method: 'session' }
  }

  return { authenticated: false, error: 'Not authenticated. Provide a valid session or X-API-Key header.' }
}
