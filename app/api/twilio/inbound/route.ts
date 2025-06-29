import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
      `<Response><Message>Invalid format. Reply YES1234 or NO1234</Message></Response>`,
      {
        headers: { "Content-Type": "application/xml" },
        status: 200,
      }
    )
  }

  const [, command, shortId] = match

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id")
    .ilike("booking_key", `%${shortId.toLowerCase()}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !booking) {
    console.error("❌ Booking not found for shortId:", shortId)
    return new Response(
      `<Response><Message>Booking not found for ID ${shortId}</Message></Response>`,
      {
        headers: { "Content-Type": "application/xml" },
        status: 200,
      }
    )
  }

  const status = command === "YES" ? "approved" : "rejected"

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", booking.id)

  if (updateError) {
    console.error("❌ Failed to update status:", updateError)
    return new Response(
      `<Response><Message>Failed to update booking</Message></Response>`,
      {
        headers: { "Content-Type": "application/xml" },
        status: 200,
      }
    )
  }

  console.log(`✅ Booking ${booking.id} marked as ${status}`)
  return new Response(
    `<Response><Message>Booking ${status} successfully</Message></Response>`,
    {
      headers: { "Content-Type": "application/xml" },
      status: 200,
    }
  )
}