import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirect = requestUrl.searchParams.get("redirect") || "/account"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 1. Exchange code for session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError)
      return NextResponse.redirect(new URL("/login", requestUrl.origin))
    }

    if (session) {
      // 2. Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, is_admin")
        .eq("id", session.user.id)
        .maybeSingle()

      // 3. If not, create it and redirect to onboarding
      if (!profile) {
        // List your admin emails here
        const adminEmails = ["aadikatyal21@gmail.com"]
      
        const isAdmin = adminEmails.includes(session.user.email!)
      
        const { error: insertError } = await supabase.from("profiles").insert({
          id: session.user.id,
          email: session.user.email,
          onboarded: false,
          is_admin: isAdmin,
        })
      
        if (insertError) {
          console.error("Insert error:", insertError.message)
        }
      
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin))
      }

      // 4. If admin, redirect to admin dashboard
      if (profile.is_admin) {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}