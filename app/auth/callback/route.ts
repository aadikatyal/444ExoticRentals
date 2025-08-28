import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  console.log("🚀 AUTH CALLBACK ROUTE CALLED!")
  console.log("🚀 Request URL:", request.url)
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectParam = requestUrl.searchParams.get("redirect")
  
  console.log("🔍 Code:", code)
  console.log("🔍 Redirect:", redirectParam)
  console.log("🔍 Request URL origin:", requestUrl.origin)
  console.log("🔍 All search params:", Object.fromEntries(requestUrl.searchParams.entries()))
  
  if (!code) {
    console.log("❌ No code parameter found")
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  }

  try {
    // Create Supabase client
    const supabase = createClient()
    
    // Exchange the code for a session
    console.log("🔄 Exchanging code for session...")
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.log("❌ Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
    }
    
    if (!data.session) {
      console.log("❌ No session created")
      return NextResponse.redirect(new URL("/login?error=no_session", requestUrl.origin))
    }
    
    console.log("✅ Session created successfully for user:", data.user?.email)
    console.log("🔍 Session data:", {
      access_token: data.session?.access_token ? "present" : "missing",
      refresh_token: data.session?.refresh_token ? "present" : "missing",
      expires_at: data.session?.expires_at,
      user_id: data.user?.id
    })
    
    // Small delay to ensure session is fully established
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Now redirect to the intended destination
    if (redirectParam && redirectParam.trim() !== "") {
      console.log("🎯 Redirecting to:", redirectParam)
      
      // Construct the full redirect URL
      const redirectUrl = new URL(redirectParam, requestUrl.origin)
      console.log("🔍 Full redirect URL:", redirectUrl.toString())
      
      // Perform the redirect
      const response = NextResponse.redirect(redirectUrl)
      console.log("🔍 Response status:", response.status)
      
      return response
    }
    
    console.log("⚠️ No redirect parameter, going to account")
    return NextResponse.redirect(new URL("/account", requestUrl.origin))
    
  } catch (error) {
    console.log("❌ Unexpected error in auth callback:", error)
    return NextResponse.redirect(new URL("/login?error=unexpected", requestUrl.origin))
  }
}