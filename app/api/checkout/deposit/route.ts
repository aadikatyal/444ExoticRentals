// app/api/checkout/deposit/route.ts

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // latest known stable version
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      carId,
      startDate,
      endDate,
      location, // ✅ fixed field name
      totalPrice,
      bookingType,
      hours,
      depositAmount,
    } = body

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !carId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing booking data" }, { status: 400 })
    }

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
            unit_amount: depositAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
        location, // ✅ fixed here too
        total_price: totalPrice,
        booking_type: bookingType,
        hours: hours || "",
        deposit_amount: (depositAmount ?? 0).toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?success=deposit`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/fleet/${carId}?canceled=true`,
    })

    if (!session.url) {
      return NextResponse.json({ error: "Stripe session failed to return a URL" }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe Checkout error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}