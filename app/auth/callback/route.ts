import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  console.log("🚀 AUTH CALLBACK ROUTE CALLED!")
  console.log("🚀 Request URL:", request.url)
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectParam = requestUrl.searchParams.get("redirect")
  
  console.log("🔍 Code:", code)
  console.log("🔍 Redirect:", redirectParam)
  
  if (!code) {
    console.warn("⚠️ No code in URL, redirecting to:", redirectParam || "/account")
    return NextResponse.redirect(new URL(redirectParam || "/account", requestUrl.origin))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.exchangeCodeForSession(code)

  console.log("📬 Session after code exchange:", session)

  if (sessionError || !session) {
    console.error("❌ Error exchanging code for session:", sessionError?.message)
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  }

  const user = session.user
  const email = user.email
  const userId = user.id

  console.log("🧑 User:", { id: userId, email })

  if (!email || !userId) {
    console.error("❌ Missing user info from session")
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  }

  const adminEmails = ["aadikatyal21@gmail.com"]
  const isAdmin = adminEmails.includes(email)

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", userId)
    .maybeSingle()

  console.log("📄 Profile from Supabase:", profile)

  if (!profile) {
    // Try to match by email
    const { data: emailMatch } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("email", email)
      .maybeSingle()

    if (emailMatch) {
      console.log("🔄 Found profile by email, updating ID...")
      await supabase
        .from("profiles")
        .update({ id: userId })
        .eq("email", email)

      profile = emailMatch
    } else {
      console.log("🆕 Inserting new profile...")
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        email,
        onboarded: false,
        is_admin: isAdmin,
      })
      if (insertError) {
        console.error("❌ Insert error:", insertError.message)
      }

      // For new users, redirect to onboarding with the redirect parameter
      if (redirectParam) {
        console.log("🎯 New user, redirecting to onboarding with redirect:", redirectParam)
        return NextResponse.redirect(
          new URL(`/onboarding?redirect=${encodeURIComponent(redirectParam)}`, requestUrl.origin)
        )
      }
      return NextResponse.redirect(new URL("/onboarding", requestUrl.origin))
    }
  }

  // Make sure is_admin stays up to date
  if (profile.is_admin !== isAdmin) {
    console.log("🔧 Updating is_admin to match config")
    await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)
  }

  // Final redirect decision
  let finalRedirect
  if (profile.is_admin) {
    finalRedirect = "/admin"
  } else if (redirectParam) {
    finalRedirect = redirectParam
  } else {
    finalRedirect = "/account"
  }

  console.log("🎯 Final redirect decision:", {
    isAdmin: profile.is_admin,
    redirectParam,
    finalRedirect
  })

  console.log("🚀 About to redirect to:", finalRedirect)
  return NextResponse.redirect(new URL(finalRedirect, requestUrl.origin))
}