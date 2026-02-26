import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          user_id: string
          tier: 'trial' | 'starter' | 'pro' | 'elite'
          status: 'active' | 'cancelled' | 'expired' | 'trialing'
          current_period_end: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      trade_journal: {
        Row: {
          id: string
          user_id: string
          symbol: string
          direction: 'long' | 'short'
          entry_price: number
          exit_price: number | null
          size: number
          score_at_entry: number | null
          notes: string | null
          pnl: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['trade_journal']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['trade_journal']['Insert']>
      }
      user_settings: {
        Row: {
          user_id: string
          symbols: string[]
          refresh_interval: number
          min_score: number
          interval: string
          limit: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key: string
          name: string
          created_at: string
          last_used_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['api_keys']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['api_keys']['Insert']>
      }
    }
  }
}
