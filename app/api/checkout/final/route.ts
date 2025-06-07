import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId, carId, startDate, endDate, location, totalPrice, bookingType, hours, userEmail } = body

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // ✅ Check for required values
    if (!user || !bookingId || !totalPrice || !userEmail) {
      return NextResponse.json({ error: "Missing final payment data" }, { status: 400 })
    }

    const metadata = {
      type: "final",
      booking_id: bookingId,
    }

    console.log("📦 Creating final payment Stripe session with metadata:", metadata)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Final payment for ${bookingType} booking`,
              description: `From ${startDate} to ${endDate}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=confirmed`, // optional: direct to Confirmed Bookings tab
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?tab=approved`,
    })

    if (!session.url) {
      return NextResponse.json({ error: "Stripe session failed to return a URL" }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("❌ Final Stripe Checkout error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}