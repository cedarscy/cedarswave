import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const PRICE_TO_TIER: Record<string, string> = {
  price_1T4xqiCiyUV0aZA3pdfxOfDY: 'starter',
  price_1T4xqiCiyUV0aZA3RcFxjSaw: 'starter',
  price_1T4xqjCiyUV0aZA37upBLgVW: 'pro',
  price_1T4xqjCiyUV0aZA3pdrzPUSP: 'pro',
  price_1T4xqkCiyUV0aZA39viOEtJF: 'elite',
  price_1T4xqkCiyUV0aZA3jiiqEmic: 'elite',
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  let event: Stripe.Event
  try {
    const body = await req.arrayBuffer()
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature ?? '',
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error('No client_reference_id in checkout.session.completed')
          break
        }

        // Fetch subscription to get price ID
        let tier = 'starter'
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = sub.items.data[0]?.price?.id
          tier = PRICE_TO_TIER[priceId] ?? 'starter'
        }

        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1)

        await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              tier,
              status: 'active',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              current_period_end: periodEnd.toISOString(),
            },
            { onConflict: 'user_id' }
          )
        console.log(`Subscription activated: userId=${userId} tier=${tier}`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const priceId = sub.items.data[0]?.price?.id
        const tier = PRICE_TO_TIER[priceId] ?? 'starter'
        const periodEnd = new Date(sub.current_period_end * 1000)
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'trialing' ? 'trialing'
          : sub.status === 'canceled' ? 'cancelled'
          : 'expired'

        await supabase
          .from('subscriptions')
          .update({
            tier,
            status,
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd.toISOString(),
          })
          .eq('stripe_customer_id', customerId)
        console.log(`Subscription updated: customerId=${customerId} tier=${tier}`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        await supabase
          .from('subscriptions')
          .update({ tier: 'trial', status: 'cancelled' })
          .eq('stripe_customer_id', customerId)
        console.log(`Subscription cancelled: customerId=${customerId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(JSON.stringify({ error: 'Processing failed' }), { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
