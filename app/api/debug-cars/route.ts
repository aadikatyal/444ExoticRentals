import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: cars, error } = await supabase
      .from("cars")
      .select("id, make, model, year, available")
      .limit(10)

    if (error) {
      console.error("❌ Error fetching cars:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("🔍 All cars in database:", cars)
    return NextResponse.json({ cars, count: cars?.length || 0 })
  } catch (error) {
    console.error("❌ API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
