import { buffer } from 'micro'
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to update bookings
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    console.log('✅ Stripe event verified:', event.type)
  } catch (err: any) {
    console.error('❌ Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}

    console.log('💬 Session metadata:', metadata)

    const bookingId = metadata.booking_id
    const paymentType = metadata.type // "final" or "deposit"

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing booking_id' })
    }

    const status = paymentType === 'final' ? 'confirmed' : 'approved'

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (updateError) {
      console.error('❌ Supabase update error:', updateError)
      return res.status(500).json({ error: 'Failed to update booking status' })
    }

    console.log(`✅ Booking ${bookingId} marked as ${status}`)
  }

  return res.status(200).json({ received: true })
}