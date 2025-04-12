// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") as string

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log("🔔 Stripe webhook received:", event.type)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId

      console.log("✅ Checkout session complete for booking:", bookingId)
      console.log("🔍 Full session metadata:", session.metadata)

      if (!bookingId) {
        console.error("❌ No bookingId found in session metadata.")
        return NextResponse.json({ error: "Missing bookingId" }, { status: 400 })
      }

      const { error } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)

      if (error) {
        console.error("❌ Supabase update error:", error)
        return NextResponse.json({ error: "Supabase update error" }, { status: 500 })
      }

      console.log("✅ Supabase booking updated successfully")
    }

    return new NextResponse("Webhook received", { status: 200 })
  } catch (err) {
    console.error("❌ Webhook error:", err)
    return new NextResponse("Webhook error", { status: 400 })
  }
}
