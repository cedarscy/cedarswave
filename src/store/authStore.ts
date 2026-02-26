import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { PricingTierId } from '../lib/stripe'

interface Subscription {
  tier: PricingTierId
  status: 'active' | 'cancelled' | 'expired' | 'trialing'
  current_period_end: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

interface AuthState {
  user: User | null
  session: Session | null
  subscription: Subscription | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setSubscription: (subscription: Subscription | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  subscription: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, session: null, subscription: null, loading: false }),
}))
