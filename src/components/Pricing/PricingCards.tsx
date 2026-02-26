import { useState } from 'react'
import { PRICING_TIERS } from '../../lib/stripe'
import { useSubscription } from '../../hooks/useSubscription'

export function PricingCards() {
  const [annual, setAnnual] = useState(false)
  const { tier: currentTier } = useSubscription()

  return (
    <div>
      {/* Annual toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm ${!annual ? 'text-[#e0e6f0]' : 'text-[#607d9b]'}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors border-none cursor-pointer ${annual ? 'bg-[#1565c0]' : 'bg-[#1e3050]'}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`}
          />
        </button>
        <span className={`text-sm ${annual ? 'text-[#e0e6f0]' : 'text-[#607d9b]'}`}>
          Annual <span className="text-[#69f0ae] font-semibold ml-1">Save 33%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_TIERS.map((plan) => (
          <div
            key={plan.id}
            className={`card p-6 flex flex-col relative transition-all duration-200 ${
              plan.popular ? 'border-[#4fc3f7] shadow-[0_0_20px_rgba(79,195,247,0.1)]' : plan.color
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#1565c0] text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ Most Popular
                </span>
              </div>
            )}

            <h3 className="text-lg font-bold text-[#e0e6f0] mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              {plan.name}
            </h3>
            <p className="text-[#607d9b] text-sm mb-4">{plan.description}</p>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-[#e0e6f0]" style={{ fontFamily: 'Space Grotesk' }}>
                  €{annual ? plan.annualMonthly.toFixed(0) : plan.monthlyPrice}
                </span>
                <span className="text-[#607d9b] text-sm mb-1">/mo</span>
              </div>
              {annual && (
                <p className="text-[#546e7a] text-xs mt-1">Billed €{plan.annualPrice}/year</p>
              )}
            </div>

            <ul className="flex-1 space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-[#69f0ae] mt-0.5">✓</span>
                  <span className="text-[#607d9b]">{f}</span>
                </li>
              ))}
              {plan.limitations.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-[#546e7a] mt-0.5">✗</span>
                  <span className="text-[#37474f]">{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                currentTier === plan.id
                  ? 'bg-[#1e3050] text-[#607d9b] cursor-default border border-[#1e3050]'
                  : plan.popular
                    ? 'bg-[#1565c0] hover:bg-[#1976d2] text-white border-none cursor-pointer'
                    : 'border border-[#1e3050] text-[#e0e6f0] hover:bg-[#1a2d45] bg-transparent cursor-pointer'
              }`}
              onClick={() => {
                if (currentTier !== plan.id) {
                  window.location.href = `/checkout?plan=${plan.id}&billing=${annual ? 'annual' : 'monthly'}`
                }
              }}
            >
              {currentTier === plan.id ? '✓ Current Plan' : `Start ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-[#546e7a] text-xs mt-6">
        14-day free trial · No credit card required · Cancel anytime · 30-day money-back guarantee
      </p>
    </div>
  )
}
