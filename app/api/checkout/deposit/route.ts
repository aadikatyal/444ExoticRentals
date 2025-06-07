import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      carId,
      startDate,
      endDate,
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

    const bookingKey = uuidv4()

    const metadata = {
      type: "deposit",
      booking_key: bookingKey,
      user_id: user.id,
      car_id: carId || "",
      start_date: startDate || "",
      end_date: endDate || "",
      location: location || "",
      total_price: totalPrice?.toString() || "0",
      booking_type: bookingType || "",
      hours: hours ? hours.toString() : "",
      deposit_amount: depositAmount?.toString() || "0",
    }

    // ✅ Log metadata for debugging
    console.log("📦 Creating deposit Stripe session with metadata:", metadata)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation?booking_key=${bookingKey}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fleet/${carId}?canceled=true`,
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