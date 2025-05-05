import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectParam = requestUrl.searchParams.get("redirect")
  const redirectPath = redirectParam?.startsWith("/") ? redirectParam : "/account"

  if (code) {
    const cookieStore = cookies()
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
        .select("id, is_admin, onboarded")
        .eq("id", session.user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Error fetching profile:", profileError.message)
      }

      // 3. Create profile if missing
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

        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin))
      }

      // 4. Update is_admin if needed
      if (profile.is_admin !== isAdmin) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ is_admin: isAdmin })
          .eq("id", session.user.id)

        if (updateError) {
          console.error("Failed to update is_admin:", updateError.message)
        }
      }

      // 5. Redirect based on onboarding status and role
      if (!profile.onboarded) {
        console.log("User not onboarded. Redirecting to /onboarding")
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin))
      }

      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin))
      }

      console.log("Redirecting to:", redirectPath)
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin))
}