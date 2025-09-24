import { NextResponse } from "next/server"
import { sendDepositConfirmation, type BookingEmailData } from "@/lib/email"

export async function GET() {
  try {
    console.log("🧪 Testing customer email...")

    const testEmailData: BookingEmailData = {
      customerName: "Test Customer",
      customerEmail: "arkstudiomusic@gmail.com", // Use arkstudiomusic@gmail.com for testing
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
      bookingId: "test-customer-123",
    }

    console.log("📧 Sending customer email to:", testEmailData.customerEmail)
    
    const result = await sendDepositConfirmation(testEmailData)
    
    console.log("📧 Customer email result:", result)

    return NextResponse.json({ 
      message: "Customer email test completed!",
      customerEmail: testEmailData.customerEmail,
      result
    })
  } catch (error) {
    console.error("❌ Customer email test failed:", error)
    return NextResponse.json({ 
      error: "Customer email test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
