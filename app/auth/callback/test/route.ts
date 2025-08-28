import { NextResponse } from "next/server"

export async function GET() {
  console.log("🧪 TEST ROUTE CALLED!")
  return NextResponse.json({ message: "Test route working", timestamp: new Date().toISOString() })
}
