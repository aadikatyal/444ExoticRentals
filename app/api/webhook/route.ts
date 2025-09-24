import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendDepositConfirmation, sendAdminDepositNotification, sendFinalConfirmation, sendAdminFinalConfirmation, type BookingEmailData, type AdminEmailData } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  console.log('🚀 Webhook handler started')

  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Stripe event constructed successfully:', event.type)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
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
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 })
    }

    console.log('🔔 Processing checkout.session.completed for booking:', booking_id)

    try {
      if (type === 'deposit') {
        console.log('💰 Processing deposit payment...')
        
        // Update booking status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'pending_approval' })
          .eq('id', booking_id)

        if (updateError) {
          console.error('❌ Failed to update booking status:', updateError)
          return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
        }

        // Get car and user details for email
        const { data: carData } = await supabase
          .from('cars')
          .select('make, model')
          .eq('id', car_id)
          .single()

        const { data: userData } = await supabase
          .from('profiles')
          .select('name, email, full_name')
          .eq('id', user_id)
          .single()

        // Also try to get user from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(user_id)

        console.log('📧 Car data:', carData)
        console.log('📧 User data:', userData)
        console.log('📧 Auth user data:', authUser?.user?.user_metadata)
        console.log('📧 User ID being queried:', user_id)

        if (carData) {
          const emailData: BookingEmailData = {
            customerName: userData?.name || 
                         userData?.full_name || 
                         authUser?.user?.user_metadata?.full_name || 
                         authUser?.user?.user_metadata?.name || 
                         'Valued Customer',
            customerEmail: userData?.email || authUser?.user?.email || '',
            carMake: carData.make,
            carModel: carData.model,
            carYear: 2024,
            startDate: start_date,
            endDate: end_date,
            startTime: start_time,
            endTime: end_time,
            location: location,
            totalPrice: parseFloat(total_price),
            depositAmount: parseFloat(deposit_amount),
            bookingType: booking_type as 'rental' | 'photoshoot',
            hours: hours ? parseInt(hours) : undefined,
            bookingId: booking_id,
          }

          console.log('📧 Sending deposit confirmation emails...')
          
          // Send customer confirmation
          await sendDepositConfirmation(emailData)
          
          // Send admin notification
          const adminEmailData: AdminEmailData = {
            ...emailData,
            adminEmail: process.env.ADMIN_EMAIL || 'aadikatyal21@gmail.com',
          }
          await sendAdminDepositNotification(adminEmailData)

          console.log('✅ Deposit confirmation emails sent successfully!')
        } else {
          console.error('❌ Car data not found for email')
        }
      } else if (type === 'final') {
        console.log('💳 Processing final payment...')
        
        // Update booking status
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', booking_id)

        if (updateError) {
          console.error('❌ Failed to update booking status:', updateError)
          return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
        }

        // Get booking details for email
        const { data: bookingData } = await supabase
          .from('bookings')
          .select(`
            *,
            cars:cars(make, model),
            profiles:profiles(name, email)
          `)
          .eq('id', booking_id)
          .single()

        if (bookingData && bookingData.cars && bookingData.profiles) {
          const emailData: BookingEmailData = {
            customerName: bookingData.profiles.name || 'Valued Customer',
            customerEmail: bookingData.profiles.email || '',
            carMake: bookingData.cars.make,
            carModel: bookingData.cars.model,
            carYear: 2024,
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

          console.log('📧 Sending final confirmation emails...')
          
          // Send customer final confirmation
          await sendFinalConfirmation(emailData)
          
          // Send admin final confirmation
          const adminEmailData: AdminEmailData = {
            ...emailData,
            adminEmail: process.env.ADMIN_EMAIL || 'aadikatyal21@gmail.com',
          }
          await sendAdminFinalConfirmation(adminEmailData)

          console.log('✅ Final confirmation emails sent successfully!')
        }
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error)
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
