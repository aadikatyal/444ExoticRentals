import { buffer } from 'micro'
import Stripe from 'stripe'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-08-01',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🚀 Webhook handler started')

  if (req.method !== 'POST') {
    console.warn('⚠️ Invalid method:', req.method)
    return res.status(405).send('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature'] as string

  let event: Stripe.Event
  try {
    const rawBody = await buffer(req)
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Stripe event constructed successfully:', event.type)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}
    console.log('📦 Session metadata:', metadata)

    const {
      type,
      booking_id,
      user_id,
      car_id,
      start_date,
      end_date,
      start_time,
      end_time,
      location,
      total_price,
      booking_type,
      hours,
      deposit_amount,
    } = metadata

    if (!booking_id) {
      console.error('❌ Missing booking_id in metadata')
      return res.status(400).json({ error: 'Missing booking_id' })
    }

    // Final payment
    if (type === 'final') {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking_id)

      if (updateError) {
        console.error('❌ Failed to confirm booking:', updateError)
        return res.status(500).json({ error: 'Update failed' })
      }

      console.log('✅ Booking confirmed:', booking_id)
      return res.status(200).json({ message: 'Booking confirmed' })
    }

    // Deposit payment
    if (type === 'deposit') {
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', booking_id)

      if (existing && existing.length > 0) {
        console.log('⚠️ Booking already exists:', booking_id)
        return res.status(200).json({ message: 'Booking already exists' })
      }

      const insertPayload = {
        id: booking_id,
        user_id,
        car_id,
        start_date,
        end_date,
        start_time,
        end_time,
        location,
        total_price: parseFloat(total_price || '0'),
        booking_type,
        hours: hours || null,
        deposit_amount: parseFloat(deposit_amount || '0'),
        paid_deposit: true,
        status: 'pending',
      }

      const { error: insertError } = await supabase
        .from('bookings')
        .insert([insertPayload])

      if (insertError) {
        console.error('❌ Insert failed:', insertError)
        return res.status(500).json({ error: 'Insert failed' })
      }

      console.log('✅ Booking inserted:', booking_id)
      return res.status(200).json({ message: 'Deposit booking created' })
    }

    console.error('❌ Unknown metadata type:', type)
    return res.status(400).json({ error: 'Unknown metadata type' })
  }

  return res.status(200).json({ received: true })
}