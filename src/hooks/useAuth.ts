import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

/**
 * useAuth — call this ONCE in App.tsx to initialize the auth listener.
 * All other components should read state directly from useAuthStore().
 */
export function useAuth() {
  const { setUser, setSession, setSubscription, setLoading, reset } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadSubscription(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen to auth changes — registered ONCE here
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadSubscription(session.user.id)
        } else {
          setSubscription(null)
          setLoading(false)
        }
      }
    )

    return () => {
      authSub.unsubscribe()
    }
  }, [])

  async function loadSubscription(userId: string) {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setSubscription(data as any)
      } else {
        // No subscription found — create a trial row
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 14)

        const { data: newSub } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              tier: 'trial',
              status: 'trialing',
              current_period_end: trialEnd.toISOString(),
              stripe_customer_id: null,
              stripe_subscription_id: null,
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single()

        if (newSub) setSubscription(newSub as any)
      }
    } catch (err) {
      console.error('Failed to load subscription:', err)
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14)
      setSubscription({
        tier: 'trial',
        status: 'trialing',
        current_period_end: trialEnd.toISOString(),
        stripe_customer_id: null,
        stripe_subscription_id: null,
      })
    } finally {
      setLoading(false)
    }
  }
}

/**
 * Expose loadSubscription for refreshing after upgrade.
 */
export async function loadSubscription(userId: string) {
  const { setSubscription, setLoading } = useAuthStore.getState()
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      setSubscription(data as any)
    }
  } catch (err) {
    console.error('Failed to reload subscription:', err)
  } finally {
    setLoading(false)
  }
}
