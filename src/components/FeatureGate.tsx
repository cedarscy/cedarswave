import { Link } from 'react-router-dom'
import type { PricingTierId } from '../lib/stripe'
import { useSubscription } from '../hooks/useSubscription'

interface Props {
  requiredTier: PricingTierId
  children: React.ReactNode
  fallback?: React.ReactNode
}

const TIER_NAMES: Record<PricingTierId, string> = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  elite: 'Elite',
}

export function FeatureGate({ requiredTier, children, fallback }: Props) {
  const { hasMinTier, tier } = useSubscription()

  if (hasMinTier(requiredTier)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="card p-6 text-center">
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="font-semibold text-[#e0e6f0] mb-2" style={{ fontFamily: 'Space Grotesk' }}>
        {TIER_NAMES[requiredTier]} Feature
      </h3>
      <p className="text-[#607d9b] text-sm mb-4">
        You're on the <span className="text-[#4fc3f7]">{TIER_NAMES[tier]}</span> plan. 
        Upgrade to {TIER_NAMES[requiredTier]} to unlock this feature.
      </p>
      <Link
        to="/pricing"
        className="inline-block bg-[#1565c0] hover:bg-[#1976d2] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
      >
        Upgrade Now →
      </Link>
    </div>
  )
}
