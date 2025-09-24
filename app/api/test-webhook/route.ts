import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("🔔 Test webhook received:", body)
    
    return NextResponse.json({ 
      message: "Webhook test successful!",
      received: body 
    })
  } catch (error) {
    console.error("❌ Webhook test failed:", error)
    return NextResponse.json({ error: "Webhook test failed" }, { status: 500 })
  }
}
