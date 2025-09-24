import { buffer } from 'micro'
import Stripe from 'stripe'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendDepositConfirmation, sendAdminDepositNotification, sendFinalConfirmation, sendAdminFinalConfirmation, type BookingEmailData, type AdminEmailData } from '../../lib/email'

export const config = {
  api: {
    bodyParser: false,
  },
}

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
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

      // Send final confirmation emails
      try {
        // Get booking details with car and user info
        const { data: bookingData } = await supabase
          .from('bookings')
          .select(`
            *,
            cars:cars(make, model, year),
            profiles:profiles(full_name, email)
          `)
          .eq('id', booking_id)
          .single()

        if (bookingData && bookingData.cars && bookingData.profiles) {
          const emailData: BookingEmailData = {
            customerName: bookingData.profiles.full_name || 'Valued Customer',
            customerEmail: bookingData.profiles.email || session.customer_email || '',
            carMake: bookingData.cars.make,
            carModel: bookingData.cars.model,
            carYear: bookingData.cars.year,
            startDate: bookingData.start_date,
            endDate: bookingData.end_date,
            startTime: bookingData.start_time,
            endTime: bookingData.end_time,
            location: bookingData.location,
            totalPrice: bookingData.total_price,
            depositAmount: bookingData.deposit_amount,
            bookingType: bookingData.booking_type as 'rental' | 'photoshoot',
            hours: bookingData.hours,
            bookingId: booking_id,
          }

          // Send customer final confirmation
          await sendFinalConfirmation(emailData)

          // Send admin final confirmation
          const adminEmailData: AdminEmailData = {
            ...emailData,
            adminEmail: process.env.ADMIN_EMAIL || 'aadikatyal21@gmail.com',
          }
          await sendAdminFinalConfirmation(adminEmailData)

          console.log('✅ Final confirmation emails sent for booking:', booking_id)
        }
      } catch (emailError) {
        console.error('❌ Failed to send final confirmation emails:', emailError)
        // Don't fail the webhook if emails fail
      }

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

      // Send email confirmations
      try {
        // Get car and user details for email
        const { data: carData } = await supabase
          .from('cars')
          .select('make, model, year')
          .eq('id', car_id)
          .single()

        const { data: userData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user_id)
          .single()

        if (carData && userData) {
          const emailData: BookingEmailData = {
            customerName: userData.full_name || 'Valued Customer',
            customerEmail: userData.email || session.customer_email || '',
            carMake: carData.make,
            carModel: carData.model,
            carYear: carData.year,
            startDate: start_date,
            endDate: end_date,
            startTime: start_time,
            endTime: end_time,
            location,
            totalPrice: parseFloat(total_price || '0'),
            depositAmount: parseFloat(deposit_amount || '0'),
            bookingType: booking_type as 'rental' | 'photoshoot',
            hours: hours ? parseInt(hours) : undefined,
            bookingId: booking_id,
          }

          // Send customer confirmation
          await sendDepositConfirmation(emailData)

          // Send admin notification
          const adminEmailData: AdminEmailData = {
            ...emailData,
            adminEmail: process.env.ADMIN_EMAIL || 'aadikatyal21@gmail.com',
          }
          await sendAdminDepositNotification(adminEmailData)

          console.log('✅ Email confirmations sent for booking:', booking_id)
        }
      } catch (emailError) {
        console.error('❌ Failed to send email confirmations:', emailError)
        // Don't fail the webhook if emails fail
      }

      return res.status(200).json({ message: 'Deposit booking created' })
    }

    console.error('❌ Unknown metadata type:', type)
    return res.status(400).json({ error: 'Unknown metadata type' })
  }

  return res.status(200).json({ received: true })
}