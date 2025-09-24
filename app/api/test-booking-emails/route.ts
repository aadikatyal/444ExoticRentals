import { NextResponse } from "next/server"
import { sendDepositConfirmation, sendAdminDepositNotification, type BookingEmailData, type AdminEmailData } from "@/lib/email"

export async function GET() {
  try {
    console.log("🧪 Testing booking emails...")

    const testEmailData: BookingEmailData = {
      customerName: "Test Customer",
      customerEmail: "aadikatyal21@gmail.com", // Your email for testing
      carMake: "Lamborghini",
      carModel: "Huracan",
      carYear: 2024,
      startDate: "2025-09-25",
      endDate: "2025-09-27",
      startTime: "10:00",
      endTime: "12:00",
      location: "Miami",
      totalPrice: 2500,
      depositAmount: 500,
      bookingType: "rental",
      hours: undefined,
      bookingId: "test-booking-123",
    }

    const testAdminEmailData: AdminEmailData = {
      ...testEmailData,
      adminEmail: "aadikatyal21@gmail.com",
    }

    // Send both emails
    await sendDepositConfirmation(testEmailData)
    await sendAdminDepositNotification(testAdminEmailData)

    return NextResponse.json({ 
      message: "Test emails sent successfully!",
      customerEmail: testEmailData.customerEmail,
      adminEmail: testAdminEmailData.adminEmail
    })
  } catch (error) {
    console.error("❌ Failed to send test emails:", error)
    return NextResponse.json({ error: "Failed to send test emails" }, { status: 500 })
  }
}
