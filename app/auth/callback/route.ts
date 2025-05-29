import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirect = requestUrl.searchParams.get("redirect") || "/account"

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", userId)
    .maybeSingle()

  if (profileError) {
    console.error("Error fetching profile:", profileError.message)
  }

  if (!profile) {
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

  if (profile.is_admin !== isAdmin) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_admin: isAdmin })
      .eq("id", userId)

    if (updateError) {
      console.error("Failed to update is_admin:", updateError.message)
    }
  }

  return NextResponse.redirect(new URL(isAdmin ? "/admin" : redirect, requestUrl.origin))
}