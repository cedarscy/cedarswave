import { PricingCards } from '../components/Pricing/PricingCards'
import { useSubscription } from '../hooks/useSubscription'

export function Pricing() {
  const { tier, isTrial, getDaysRemaining } = useSubscription()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#e0e6f0] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
          Simple Pricing
        </h1>
        <p className="text-[#607d9b] text-lg">No hidden fees. Cancel anytime.</p>
        {isTrial && (
          <div className="inline-flex items-center gap-2 mt-3 bg-[#0d2035] border border-[#1565c0] text-[#4fc3f7] text-sm px-4 py-2 rounded-full">
            🎯 You have {getDaysRemaining()} days left on your free trial
          </div>
        )}
      </div>
      <PricingCards />
    </div>
  )
}
