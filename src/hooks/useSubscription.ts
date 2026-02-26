import { useAuthStore } from '../store/authStore'
import { TIER_LIMITS } from '../lib/stripe'
import type { PricingTierId } from '../lib/stripe'

// NOTE: trial has rank 3 (same as elite) — this is intentional.
// During the free trial period, users get full Elite-level access.
const TIER_RANK: Record<PricingTierId, number> = {
  trial: 3,
  starter: 1,
  pro: 2,
  elite: 3,
}

export function useSubscription() {
  const { subscription } = useAuthStore()

  // Default to 'trial' (not 'starter') for new/unloaded users
  const tier: PricingTierId = subscription?.tier ?? 'trial'
  const isActive =
    subscription?.status === 'active' ||
    subscription?.status === 'trialing'
  const isExpired = subscription
    ? new Date(subscription.current_period_end) < new Date()
    : true

  const effectiveTier: PricingTierId = isActive && !isExpired ? tier : 'starter'
  const limits = TIER_LIMITS[effectiveTier]

  function canUsePairs(count: number): boolean {
    return limits.maxPairs === Infinity || count <= limits.maxPairs
  }

  function canAddPair(currentCount: number): boolean {
    return limits.maxPairs === Infinity || currentCount < limits.maxPairs
  }

  function canUseJournal(entryCount: number): boolean {
    return limits.maxJournalEntries === Infinity || entryCount < limits.maxJournalEntries
  }

  function canUseAI(): boolean {
    return limits.aiAnalyses > 0
  }

  function canUseWebhooks(): boolean {
    return limits.webhooks
  }

  function canUseAPI(): boolean {
    return limits.api
  }

  function hasMinTier(required: PricingTierId): boolean {
    return TIER_RANK[effectiveTier] >= TIER_RANK[required]
  }

  function getDaysRemaining(): number {
    if (!subscription) return 0
    const end = new Date(subscription.current_period_end)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }

  return {
    tier: effectiveTier,
    subscription,
    isActive,
    isExpired,
    limits,
    canUsePairs,
    canAddPair,
    canUseJournal,
    canUseAI,
    canUseWebhooks,
    canUseAPI,
    hasMinTier,
    getDaysRemaining,
    isStarter: effectiveTier === 'starter',
    isPro: effectiveTier === 'pro' || effectiveTier === 'elite' || effectiveTier === 'trial',
    isElite: effectiveTier === 'elite' || effectiveTier === 'trial',
    isTrial: tier === 'trial' && isActive,
  }
}
