import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as any,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId, userEmail } = body

    const priceId = "price_1Rz4T3LnNzpdI7XbLUXXJ2v2"

    if (!bookingId || !userEmail) {
      console.error("❌ Missing required data:", { bookingId, userEmail })
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    const metadata = {
      type: "final",
      booking_id: bookingId,
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      mode: "payment",
      line_items: [
        {
          price: priceId,
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