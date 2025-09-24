import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { sendBookingApproved, type BookingEmailData } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 Admin approve booking API called")
    const { bookingId, status } = await req.json()
    console.log("📦 Request data:", { bookingId, status })

    if (!bookingId || !status) {
      console.error("❌ Missing required fields")
      return NextResponse.json({ error: "Missing booking ID or status" }, { status: 400 })
    }

    if (status !== "approved" && status !== "rejected") {
      console.error("❌ Invalid status:", status)
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)

    if (updateError) {
      console.error("❌ Failed to update booking status:", updateError)
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
    }

    // If approved, send approval email
    if (status === "approved") {
      try {
        // Get booking details with car and user info
        const { data: bookingData } = await supabase
          .from("bookings")
          .select(`
            *,
            cars:cars(make, model, year),
            profiles:profiles(full_name, email)
          `)
          .eq("id", bookingId)
          .single()

        if (bookingData && bookingData.cars && bookingData.profiles) {
          const emailData: BookingEmailData = {
            customerName: bookingData.profiles.full_name || "Valued Customer",
            customerEmail: bookingData.profiles.email || "",
            carMake: bookingData.cars.make,
            carModel: bookingData.cars.model,
            carYear: bookingData.cars.year,
            startDate: bookingData.start_date,
            endDate: bookingData.end_date,
            startTime: bookingData.start_time,
            endTime: bookingData.end_time,
            location: bookingData.location,
            totalPrice: bookingData.total_price,
            depositAmount: bookingData.deposit_amount,
            bookingType: bookingData.booking_type as "rental" | "photoshoot",
            hours: bookingData.hours,
            bookingId: bookingId,
          }

          // Send approval email to customer
          await sendBookingApproved(emailData)
          console.log("✅ Booking approval email sent for booking:", bookingId)
        }
      } catch (emailError) {
        console.error("❌ Failed to send approval email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, message: `Booking ${status}` })
  } catch (error) {
    console.error("❌ Admin approval error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
