import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string

if (!publishableKey) {
  console.warn('Missing Stripe publishable key')
}

export const stripePromise = loadStripe(publishableKey)

export const STRIPE_PRICE_IDS = {
  starter_monthly: 'price_1T4xqiCiyUV0aZA3pdfxOfDY',
  starter_annual: 'price_1T4xqiCiyUV0aZA3RcFxjSaw',
  pro_monthly: 'price_1T4xqjCiyUV0aZA37upBLgVW',
  pro_annual: 'price_1T4xqjCiyUV0aZA3pdrzPUSP',
  elite_monthly: 'price_1T4xqkCiyUV0aZA39viOEtJF',
  elite_annual: 'price_1T4xqkCiyUV0aZA3jiiqEmic',
} as const

export const STRIPE_PAYMENT_LINKS = {
  starter_monthly: 'https://buy.stripe.com/7sYfZggSD44kaxr8Vw4c803',
  starter_annual:  'https://buy.stripe.com/6oU7sKbyj44k8pjfjU4c804',
  pro_monthly:     'https://buy.stripe.com/aFa4gycCn58odJD6No4c805',
  pro_annual:      'https://buy.stripe.com/28EbJ08m7bwM6hb0p04c802',
  elite_monthly:   'https://buy.stripe.com/14AfZgeKv8kA0WR6No4c806',
  elite_annual:    'https://buy.stripe.com/00w00i9qbgR6gVPb3E4c801',
} as const

export const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9,
    annualPrice: 79,
    annualMonthly: 6.58,
    description: 'Perfect for hobby traders',
    features: [
      '3 pairs max',
      '10-signal scoring system',
      'Live charts',
      'Basic trade journal (50 entries)',
      'All asset types (crypto, stocks, forex)',
    ],
    limitations: [
      'No AI chart analysis',
      'No real-time alerts',
      'No CSV export',
    ],
    color: 'border-[#607d9b]',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 239,
    annualMonthly: 19.92,
    description: 'For serious retail traders',
    features: [
      'Unlimited pairs',
      '10-signal scoring system',
      'Real-time live charts',
      'Unlimited trade journal',
      '25 AI chart analyses/month',
      'CSV export',
      'Email alerts',
      'All asset types',
    ],
    limitations: [],
    color: 'border-[#4fc3f7]',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 59,
    annualPrice: 489,
    annualMonthly: 40.75,
    description: 'Power users & small funds',
    features: [
      'Everything in Pro',
      'Unlimited AI analyses',
      'Webhook alerts',
      'API access',
      'Priority support',
      'Advanced AI insights',
      'Custom pair groups',
      'Portfolio tracking',
    ],
    limitations: [],
    color: 'border-[#ff9800]',
    popular: false,
  },
] as const

export type PricingTierId = 'trial' | 'starter' | 'pro' | 'elite'

export const TIER_LIMITS = {
  trial: { maxPairs: Infinity, maxJournalEntries: Infinity, aiAnalyses: 25, webhooks: true, api: true },
  starter: { maxPairs: 3, maxJournalEntries: 50, aiAnalyses: 0, webhooks: false, api: false },
  pro: { maxPairs: Infinity, maxJournalEntries: Infinity, aiAnalyses: 25, webhooks: false, api: false },
  elite: { maxPairs: Infinity, maxJournalEntries: Infinity, aiAnalyses: Infinity, webhooks: true, api: true },
} as const
