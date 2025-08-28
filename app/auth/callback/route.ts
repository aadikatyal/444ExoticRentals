import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  console.log("🚀 AUTH CALLBACK ROUTE CALLED!")
  console.log("🚀 Request URL:", request.url)
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectParam = requestUrl.searchParams.get("redirect")
  
  console.log("🔍 Code:", code)
  console.log("🔍 Redirect:", redirectParam)
  
  if (code) {
    console.log("🔄 Processing OAuth code...")
    
    try {
      // Check environment variables
      console.log("🔍 NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
      console.log("🔍 SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")
      
      // Create Supabase client for API routes
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      console.log("🔍 Supabase client created, attempting code exchange...")
      
      // Exchange the OAuth code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("❌ OAuth code exchange failed:", error)
        console.error("❌ Error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        })
        return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
      }
      
      console.log("✅ OAuth code exchanged successfully, user authenticated")
      console.log("✅ User data:", data.user?.id)
      
      // Now redirect to the intended page
      if (redirectParam) {
        console.log("🎯 Redirecting authenticated user to:", redirectParam)
        return NextResponse.redirect(new URL(redirectParam, requestUrl.origin))
      }
      
      console.log("⚠️ No redirect specified, going to account")
      return NextResponse.redirect(new URL("/account", requestUrl.origin))
      
    } catch (error) {
      console.error("❌ Unexpected error in OAuth callback:", error)
      console.error("❌ Error type:", typeof error)
      console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack")
      return NextResponse.redirect(new URL("/login?error=unexpected", requestUrl.origin))
    }
  }
  
  console.log("⚠️ No OAuth code provided, going to login")
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}