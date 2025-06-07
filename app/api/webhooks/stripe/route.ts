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
      const metadata = session.metadata || {}

      console.log("🔍 Full session metadata:", metadata)

      // 1. Final Payment Flow
      if (metadata?.type === "final") {
        const bookingId = metadata.booking_id

        if (!bookingId) {
          console.error("❌ Missing booking_id in final payment metadata")
          return NextResponse.json({ error: "Missing booking_id" }, { status: 400 })
        }

        console.log("Booking ID:", bookingId)

        const { error: updateError } = await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", bookingId)

        if (updateError) {
          console.error("❌ Failed to update booking to confirmed:", updateError)
          return NextResponse.json({ error: "Update failed" }, { status: 500 })
        }

        console.log("✅ Booking marked as confirmed")
        return NextResponse.json({ message: "Booking confirmed" }, { status: 200 })
      }

      // 2. Deposit Payment Flow
      else if (metadata?.type === "deposit") {
        const requiredFields = [
          "booking_key", "user_id", "car_id",
          "start_date", "end_date", "total_price"
        ]
        const missing = requiredFields.filter(field => !metadata[field])
        if (missing.length > 0) {
          console.error("❌ Missing required metadata for deposit:", missing)
          return NextResponse.json({ error: "Missing required metadata" }, { status: 400 })
        }

        const { data: existing, error: checkError } = await supabase
          .from("bookings")
          .select("id")
          .eq("booking_key", metadata.booking_key)

        if (checkError) {
          console.error("❌ Failed to check for existing booking:", checkError)
          return NextResponse.json({ error: "Check error" }, { status: 500 })
        }

        if (existing && existing.length > 0) {
          console.log("⚠️ Booking already exists. Skipping insert.")
          return NextResponse.json({ message: "Booking already exists" }, { status: 200 })
        }

        const { error } = await supabase.from("bookings").insert([
          {
            booking_key: metadata.booking_key,
            car_id: metadata.car_id,
            user_id: metadata.user_id,
            start_date: metadata.start_date,
            end_date: metadata.end_date,
            pickup_location: metadata.location,
            total_price: parseFloat(metadata.total_price || "0"),
            booking_type: metadata.booking_type,
            hours: metadata.hours ? parseInt(metadata.hours) : null,
            deposit_amount: parseFloat(metadata.deposit_amount || "0"),
            paid_deposit: true,
            status: "pending",
          },
        ])

        if (error) {
          console.error("❌ Failed to insert booking:", error)
          return NextResponse.json({ error: "Insert failed" }, { status: 500 })
        }

        console.log("✅ Deposit booking inserted")
        return NextResponse.json({ message: "Booking created" }, { status: 200 })
      }

      // 3. Unrecognized metadata type
      else {
        console.error("❌ Unknown metadata type or missing type field:", metadata)
        return NextResponse.json({ error: "Unknown metadata type" }, { status: 400 })
      }
    }

    return new NextResponse("Unhandled event type", { status: 200 })
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Webhook error (message):", err.message)
      console.error("❌ Webhook error (stack):", err.stack)
    } else {
      console.error("❌ Webhook error (raw):", err)
    }
  
    return new NextResponse("Webhook error", { status: 400 })
  }
}