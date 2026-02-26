import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { user, session, subscription, loading, setUser, setSession, setSubscription, setLoading, reset } =
    useAuthStore()

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

    // Listen to auth changes
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
        // No subscription found — create a trial
        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 14)
        
        const { data: newSub } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            tier: 'trial',
            status: 'trialing',
            current_period_end: trialEnd.toISOString(),
            stripe_customer_id: null,
            stripe_subscription_id: null,
          })
          .select()
          .single()

        if (newSub) setSubscription(newSub as any)
      }
    } catch (err) {
      console.error('Failed to load subscription:', err)
      // Default to trial if subscription table doesn't exist yet
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

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    reset()
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  }

  async function signInWithGithub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  }

  return {
    user,
    session,
    subscription,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    signInWithGithub,
    isAuthenticated: !!user,
  }
}
