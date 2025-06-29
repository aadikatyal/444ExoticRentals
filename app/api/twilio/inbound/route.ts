import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { twilioSignatureIsValid } from "@/lib/twilio-verify" // optional if validating

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const messageBody = (formData.get("Body") as string || "").toUpperCase().trim()

  console.log("📨 Incoming SMS:", messageBody)

  const match = messageBody.match(/^(YES|NO)(\w{4})$/)
  if (!match) {
    console.log("⚠️ Invalid message format")
    return new Response(
        `<Response><Message>Booking ${status} successfully</Message></Response>`,
        {
          headers: { "Content-Type": "text/xml" },
          status: 200,
        }
      )
  }

  const [, command, shortId] = match
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id")
    .ilike("booking_key", `%${shortId}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !booking) {
    console.error("❌ Booking not found for shortId:", shortId)
    return NextResponse.json({ message: "Booking not found" }, { status: 404 })
  }

  const status = command === "YES" ? "approved" : "rejected"
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", booking.id)

  if (updateError) {
    console.error("❌ Failed to update status:", updateError)
    return NextResponse.json({ message: "Update failed" }, { status: 500 })
  }

  console.log(`✅ Booking ${booking.id} marked as ${status}`)
  return NextResponse.json({ message: `Booking ${status}` }, { status: 200 })
}