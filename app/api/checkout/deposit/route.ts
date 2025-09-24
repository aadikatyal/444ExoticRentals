import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { sendDepositConfirmation, sendAdminDepositNotification, type BookingEmailData, type AdminEmailData } from "@/lib/email"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
})

// Normalize and resolve the absolute origin for redirect URLs
function resolveOrigin(req: Request) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL || "";
  const headerOrigin = req.headers.get("origin") || "";
  // Prefer explicit env, then header; trim trailing slash if present
  const raw = (envBase || headerOrigin || "http://localhost:3000").trim();
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      carId,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      totalPrice,
      bookingType,
      hours,
      depositAmount,
    } = body

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // ✅ Check for required fields
    if (!user || !carId || !startDate || !endDate || !location || !totalPrice || !depositAmount || !bookingType) {
      console.error("❌ Missing booking data", {
        user: !!user,
        carId,
        startDate,
        endDate,
        location,
        totalPrice,
        depositAmount,
        bookingType,
      })
      return NextResponse.json({ error: "Missing booking data" }, { status: 400 })
    }

    // ✅ Create a pending booking entry
    const bookingId = uuidv4()
    const insertPayload = {
      id: bookingId,
      user_id: user.id,
      car_id: carId,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      location,
      total_price: totalPrice,
      booking_type: bookingType,
      hours: hours || null,
      deposit_amount: depositAmount,
      paid_deposit: false,
      status: "pending",
    }

    const { error: insertError } = await supabase
      .from("bookings")
      .insert([insertPayload])
      .select("id, status")
      .single()

    if (insertError) {
      console.error("❌ Failed to insert booking:", insertError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    // ✅ Emails will be sent via Stripe webhook after payment completion
    console.log("📧 Booking created, emails will be sent after payment completion")

    // ✅ Metadata for Stripe
    const metadata = {
      type: "deposit",
      booking_id: bookingId,
      user_id: user.id,
      car_id: carId,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      location,
      total_price: totalPrice.toString(),
      booking_type: bookingType,
      hours: hours ? hours.toString() : "",
      deposit_amount: depositAmount.toString(),
    }

    console.log("📦 Creating deposit Stripe session with metadata:", metadata)

    const origin = resolveOrigin(req);
    console.log("🔗 Using redirect origin for Stripe:", origin);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Deposit for ${bookingType} booking`,
              description: `From ${startDate} to ${endDate}`,
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${origin}/booking/confirmation?id=${bookingId}`,
      cancel_url: `${origin}/fleet/${carId}/book?canceled=true`,
    })

    if (!session.url) {
      console.error("❌ Stripe session returned no URL")
      return NextResponse.json({ error: "Stripe session failed to return a URL" }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("❌ Stripe Checkout error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}