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
    
    // For PKCE flow, we need to handle the code verifier properly
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.log("❌ Error exchanging code for session:", error)
      console.log("❌ Error details:", error.message, error.status)
      return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
    }
    
    if (!data.session) {
      console.log("❌ No session created")
      return NextResponse.redirect(new URL("/login?error=no_session", requestUrl.origin))
    }
    
    console.log("✅ Session created successfully for user:", data.user?.email)
    
    // Now redirect to the intended destination
    if (redirectParam && redirectParam.trim() !== "") {
      console.log("🎯 Redirecting to:", redirectParam)
      
      // Construct the full redirect URL
      const redirectUrl = new URL(redirectParam, requestUrl.origin)
      console.log("🔍 Full redirect URL:", redirectUrl.toString())
      
      // Ensure the session is properly set in the response
      const response = NextResponse.redirect(redirectUrl)
      
      // Set the session cookies in the response
      if (data.session) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        })
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        })
      }
      
      console.log("🔍 Response status:", response.status)
      console.log("🔍 Response cookies:", response.cookies.getAll())
      
      return response
    }
    
    console.log("⚠️ No redirect parameter, going to account")
    return NextResponse.redirect(new URL("/account", requestUrl.origin))
    
  } catch (error) {
    console.log("❌ Unexpected error in auth callback:", error)
    return NextResponse.redirect(new URL("/login?error=unexpected", requestUrl.origin))
  }
}