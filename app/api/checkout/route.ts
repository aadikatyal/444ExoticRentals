import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as any,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId, amount, userEmail } = body

    console.log("Incoming checkout request:", { bookingId, amount, userEmail })
    console.log("Stripe key present:", !!process.env.STRIPE_SECRET_KEY)

    if (!bookingId || !amount || !userEmail) {
      console.error("❌ Missing required data:", { bookingId, amount, userEmail })
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // ✅ Explicitly construct metadata object
    const metadata = {
      type: "final",
      booking_id: bookingId,
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking #${bookingId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("❌ Stripe Checkout error:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}