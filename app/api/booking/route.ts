import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const body = await req.json()

  const {
    car_id,
    user_id,
    start_date,
    end_date,
  } = body

  if (!car_id || !user_id || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 })
  }

  // 🔍 Check for duplicate bookings
  const { data: existing, error: checkError } = await supabase
    .from("bookings")
    .select("id")
    .eq("car_id", car_id)
    .eq("user_id", user_id)
    .eq("start_date", start_date)
    .eq("end_date", end_date)

  if (checkError) {
    return NextResponse.json({ error: "Error checking existing bookings" }, { status: 500 })
  }

  if (existing.length > 0) {
    return NextResponse.json({ exists: true, message: "Booking already exists for this car and date range." })
  }

  return NextResponse.json({ exists: false, message: "No duplicate booking found." })
}