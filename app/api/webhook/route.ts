import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import twilio from "twilio"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil" as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

// Required for raw body (App Router doesn’t disable body parser)
async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader()
  let chunks: Uint8Array[] = []
  let done = false

  while (!done) {
    const { value, done: doneReading } = await reader.read()
    if (value) chunks.push(value)
    done = doneReading
  }

  return Buffer.concat(chunks)
}

export const config = {
  runtime: "nodejs",
  dynamic: "force-dynamic",
}

export async function POST(req: NextRequest) {
  console.log("🧪 Webhook route HIT")

  const rawBody = await buffer(req.body!)
  const sig = req.headers.get("stripe-signature") as string

  console.log("📥 Raw body received:", rawBody.toString()) // 🧪 Add this
  console.log("📩 Stripe-Signature header:", sig) // 🧪 Add this

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log("✅ Stripe event constructed successfully") // 🧪 Add this
  } catch (err) {
    console.error("❌ Webhook error (message):", err instanceof Error ? err.message : err)
    console.error("❌ Webhook error (stack):", err instanceof Error ? err.stack : "")
    return new NextResponse("Webhook error: Invalid signature", { status: 400 })
  }

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
          "user_id", "car_id", "start_date", "end_date", "total_price"
        ]
        const missing = requiredFields.filter(field => !metadata[field])
        if (missing.length > 0) {
          console.error("❌ Missing required metadata for deposit:", missing)
          return NextResponse.json({ error: "Missing required metadata" }, { status: 400 })
        }

        const fullBookingKey = metadata.booking_key

        const { data: existing, error: checkError } = await supabase
          .from("bookings")
          .select("id")
          .eq("booking_key", fullBookingKey)

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
            booking_key: fullBookingKey,
            booking_code: fullBookingKey.slice(-4).toLowerCase(),
            car_id: metadata.car_id,
            user_id: metadata.user_id,
            start_date: metadata.start_date,
            end_date: metadata.end_date,
            start_time: metadata.start_time || "17:00",
            end_time: metadata.end_time?.trim() || null,
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

        const shortId = fullBookingKey.slice(-4)

        await twilioClient.messages.create({
          body: `🚗 New ${metadata.booking_type} booking from ${metadata.start_date} to ${metadata.end_date} at ${metadata.location}.
Reply YES${shortId} to approve or NO${shortId} to reject.`,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: process.env.ADMIN_PHONE_NUMBER!,
        })

        return NextResponse.json({ message: "Booking created" }, { status: 200 })
      }

      // 3. Unknown metadata type
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