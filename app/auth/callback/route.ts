import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const state = requestUrl.searchParams.get("state")
  
  // Try to get redirect from query params first, then from state
  let redirectParam = requestUrl.searchParams.get("redirect")
  
  // If no redirect in query params, try to extract from state
  if (!redirectParam && state) {
    try {
      const stateData = JSON.parse(atob(state.split('.')[1]))
      if (stateData.referrer) {
        // Extract redirect from the referrer URL if it exists
        const referrerUrl = new URL(stateData.referrer)
        redirectParam = referrerUrl.searchParams.get("redirect")
      }
    } catch (e) {
      console.log("Could not parse state parameter")
    }
  }
  
  let redirect = redirectParam || "/account"

  console.log("📦 Incoming redirectParam:", redirectParam)
  console.log("🌐 Full request URL:", requestUrl.toString())
  console.log("🧭 All search params:", Array.from(requestUrl.searchParams.entries()))

  if (!code) {
    console.warn("⚠️ No code in URL, redirecting immediately to:", redirect)
    return NextResponse.redirect(new URL(redirect, requestUrl.origin))
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

      return NextResponse.redirect(
        new URL(`/onboarding?redirect=${redirectParam || "/account"}`, requestUrl.origin)
      )
    }
  }

  // Make sure is_admin stays up to date
  if (profile.is_admin !== isAdmin) {
    console.log("🔧 Updating is_admin to match config")
    await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)

    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("id", userId)
      .single()

    profile = updatedProfile
  }

  redirect = profile?.is_admin
    ? "/admin"
    : (redirectParam || "/account")

  console.log("✅ Final redirect target:", redirect)

  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}