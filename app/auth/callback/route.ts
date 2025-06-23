import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectParam = requestUrl.searchParams.get("redirect")
  let redirect = "/account"

  if (!code) {
    return NextResponse.redirect(new URL(redirect, requestUrl.origin))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !session) {
    console.error("Error exchanging code for session:", sessionError?.message)
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  }

  const user = session.user
  const email = user.email
  const userId = user.id

  if (!email || !userId) {
    console.error("Missing user info from session")
    return NextResponse.redirect(new URL("/login", requestUrl.origin))
  }

  const adminEmails = ["aadikatyal21@gmail.com"]
  const isAdmin = adminEmails.includes(email)

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", userId)
    .maybeSingle()

  if (!profile) {
    // Try to match by email
    const { data: emailMatch } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("email", email)
      .maybeSingle()

    if (emailMatch) {
      // Update profile ID to match this new session
      await supabase
        .from("profiles")
        .update({ id: userId })
        .eq("email", email)

      profile = emailMatch
    } else {
      // Insert new
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        email,
        onboarded: false,
        is_admin: isAdmin,
      })
      if (insertError) {
        console.error("Insert error:", insertError.message)
      }

      return NextResponse.redirect(new URL(`/onboarding?redirect=${redirect}`, requestUrl.origin))
    }
  }

  // Make sure is_admin stays up to date
  if (profile.is_admin !== isAdmin) {
    await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId)
  
    // Force-refresh profile after update
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("id", userId)
      .single()
  
    profile = updatedProfile
  }

  if (profile?.is_admin) {
    redirect = "/admin"
  } else if (redirectParam) {
    redirect = redirectParam
  }

  console.log("isAdmin", isAdmin, "Redirecting to:", isAdmin ? "/admin" : redirect)

  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}