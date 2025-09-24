import { NextResponse } from "next/server"
import { sendDepositConfirmation, sendAdminDepositNotification, type BookingEmailData, type AdminEmailData } from "@/lib/email"

export async function GET() {
  try {
    console.log("🧪 Testing production emails...")

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
      bookingId: "test-production-123",
    }

    const testAdminEmailData: AdminEmailData = {
      ...testEmailData,
      adminEmail: "aadikatyal21@gmail.com",
    }

    // Send both emails
    const customerResult = await sendDepositConfirmation(testEmailData)
    const adminResult = await sendAdminDepositNotification(testAdminEmailData)

    console.log("📧 Customer email result:", customerResult)
    console.log("📧 Admin email result:", adminResult)

    return NextResponse.json({ 
      message: "Production email test completed!",
      customerEmail: testEmailData.customerEmail,
      adminEmail: testAdminEmailData.adminEmail,
      customerResult,
      adminResult
    })
  } catch (error) {
    console.error("❌ Production email test failed:", error)
    return NextResponse.json({ 
      error: "Production email test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
