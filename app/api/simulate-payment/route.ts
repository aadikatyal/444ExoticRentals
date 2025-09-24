import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import { sendDepositConfirmation, sendAdminDepositNotification, type BookingEmailData, type AdminEmailData } from "@/lib/email"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    console.log("🧪 Simulating payment completion for booking:", bookingId)

    // Get booking data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        cars:cars(make, model),
        profiles:profiles(name, email)
      `)
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("❌ Booking not found:", bookingError)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log("📧 Found booking:", booking)

    // Prepare email data
    const emailData: BookingEmailData = {
      customerName: booking.profiles?.name || "Valued Customer",
      customerEmail: booking.profiles?.email || "",
      carMake: booking.cars?.make || "Unknown",
      carModel: booking.cars?.model || "Unknown",
      carYear: 2024,
      startDate: booking.start_date,
      endDate: booking.end_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      location: booking.location,
      totalPrice: booking.total_price,
      depositAmount: booking.deposit_amount,
      bookingType: booking.booking_type as "rental" | "photoshoot",
      hours: booking.hours,
      bookingId: bookingId,
    }

    console.log("📧 Email data prepared:", emailData)

    // Send emails
    await sendDepositConfirmation(emailData)
    
    const adminEmailData: AdminEmailData = {
      ...emailData,
      adminEmail: process.env.ADMIN_EMAIL || "aadikatyal21@gmail.com",
    }
    await sendAdminDepositNotification(adminEmailData)

    console.log("✅ Simulated payment emails sent!")

    return NextResponse.json({ 
      message: "Payment simulation completed, emails sent!",
      bookingId 
    })
  } catch (error) {
    console.error("❌ Simulation failed:", error)
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 })
  }
}
