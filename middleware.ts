import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Debug: Check what cookies are available
  console.log("🔍 All cookies in middleware:", req.cookies.getAll())
  console.log("🔍 Supabase cookies:", req.cookies.get('sb-access-token'), req.cookies.get('sb-refresh-token'))



  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("🔍 Middleware running for:", req.nextUrl.pathname)
  console.log("🔍 Session found:", !!session)
  console.log("🔍 Session user:", session?.user?.email)
  console.log("🔍 Referer:", req.headers.get('referer'))

  // Route protection
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/account") ||
    req.nextUrl.pathname.startsWith("/booking") ||
    req.nextUrl.pathname.includes("/book") ||
    req.nextUrl.pathname.startsWith("/admin")

  // Require login
  if (isProtectedRoute && !session) {
    console.log("❌ Protected route accessed without session, redirecting to login")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in and visiting login page, redirect to account
  if (req.nextUrl.pathname === "/login" && session) {
    console.log("✅ Logged in user visiting login, redirecting to account")
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/account"
    return NextResponse.redirect(redirectUrl)
  }

  // Onboarding enforcement
  if (session && req.nextUrl.pathname !== "/onboarding") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", session.user.id)
        .single()

      if (profile && !profile.onboarded && !req.nextUrl.pathname.startsWith("/auth")) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/onboarding"
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
    }
  }

  // Admin route protection
  if (session && req.nextUrl.pathname.startsWith("/admin")) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single()

      if (!profile?.is_admin) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/account"
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
    }
  }

  return res
}

export const config = {
  matcher: [
    "/account/:path*",
    "/booking/:path*",
    "/fleet/:path*/book",
    "/login",
    "/onboarding",
    "/admin/:path*",
  ],
}