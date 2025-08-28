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
  
  if (code) {
    console.log("🔄 Processing OAuth code...")
    
    try {
      const supabase = createClient()
      
      // Exchange the OAuth code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("❌ OAuth code exchange failed:", error)
        return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
      }
      
      console.log("✅ OAuth code exchanged successfully, user authenticated")
      
      // Now redirect to the intended page
      if (redirectParam) {
        console.log("🎯 Redirecting authenticated user to:", redirectParam)
        return NextResponse.redirect(new URL(redirectParam, requestUrl.origin))
      }
      
      console.log("⚠️ No redirect specified, going to account")
      return NextResponse.redirect(new URL("/account", requestUrl.origin))
      
    } catch (error) {
      console.error("❌ Unexpected error in OAuth callback:", error)
      return NextResponse.redirect(new URL("/login?error=unexpected", requestUrl.origin))
    }
  }
  
  console.log("⚠️ No OAuth code provided, going to login")
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}