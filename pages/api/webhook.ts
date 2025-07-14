import { buffer } from 'micro'
import Stripe from 'stripe'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-08-01',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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
    console.log('✅ Stripe event constructed:', event.type)
  } catch (err: any) {
    console.error('❌ Webhook error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata || {}

    console.log('📦 Full session metadata:', metadata)

    const { type, booking_key } = metadata

    if (type === 'final') {
      if (!booking_key) {
        console.error('❌ Missing booking_key in final payment metadata')
        return res.status(400).json({ error: 'Missing booking_key' })
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking_key)

      if (updateError) {
        console.error('❌ Failed to update booking to confirmed:', updateError)
        return res.status(500).json({ error: 'Update failed' })
      }

      console.log('✅ Booking marked as confirmed')
      return res.status(200).json({ message: 'Booking confirmed' })
    }

    if (type === 'deposit') {
      const {
        booking_key,
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

      if (!booking_key) {
        console.error('❌ Missing booking_key in deposit metadata')
        return res.status(400).json({ error: 'Missing booking_key' })
      }

      const { error: insertError } = await supabase.from('bookings').insert([
        {
          id: booking_key,
          user_id,
          car_id,
          start_date,
          end_date,
          start_time,
          end_time,
          location,
          total_price: parseFloat(total_price),
          booking_type,
          hours: hours || null,
          deposit_amount: parseFloat(deposit_amount),
          status: 'approved',
        },
      ])

      if (insertError) {
        console.error('❌ Failed to insert deposit booking:', insertError)
        return res.status(500).json({ error: 'Insert failed' })
      }

      console.log('✅ Deposit booking inserted')
      return res.status(200).json({ message: 'Deposit booking created' })
    }
  }

  return res.status(200).json({ received: true })
}