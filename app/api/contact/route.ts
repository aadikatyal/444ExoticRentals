import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json()

    const { error } = await supabase.from("contact_messages").insert([
      { name, email, phone, subject, message }
    ])

    if (error) {
      console.error("❌ Failed to save message:", error)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ Server error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
