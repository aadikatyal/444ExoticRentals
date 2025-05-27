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
      const adminEmails = ["aadikatyal21@gmail.com"]
      const isAdmin = adminEmails.includes(session.user.email!)

      // 2. Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, is_admin")
        .eq("id", session.user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Error fetching profile:", profileError.message)
      }

      // 3. If no profile → Create it
      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: session.user.id,
          email: session.user.email,
          onboarded: false,
          is_admin: isAdmin,
        })

        if (insertError) {
          console.error("Insert error:", insertError.message)
        }

        return NextResponse.redirect(
          new URL(`/onboarding?redirect=${encodeURIComponent(redirect)}`, requestUrl.origin)
        )
      }

      // 4. If profile exists but is_admin is wrong → Update it
      if (profile && profile.is_admin !== isAdmin) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ is_admin: isAdmin })
          .eq("id", session.user.id)

        if (updateError) {
          console.error("Failed to update is_admin:", updateError.message)
        }
      }

      // 5. Redirect based on is_admin
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin))
      } else {
        return NextResponse.redirect(new URL(redirect, requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}