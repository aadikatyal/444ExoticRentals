import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check if the user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the request is for a protected route
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/account") ||
    req.nextUrl.pathname.startsWith("/booking") ||
    req.nextUrl.pathname.includes("/book")

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing login page with authentication, redirect to account
  if (req.nextUrl.pathname === "/login" && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/account"
    return NextResponse.redirect(redirectUrl)
  }

  // Check if user has completed onboarding
  if (session && req.nextUrl.pathname !== "/onboarding") {
    try {
      const { data: profile } = await supabase.from("profiles").select("onboarded").eq("id", session.user.id).single()

      // If user hasn't completed onboarding and isn't on the onboarding page, redirect to onboarding
      if (profile && !profile.onboarded && !req.nextUrl.pathname.startsWith("/auth")) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/onboarding"
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
    }
  }

  return res
}

export const config = {
  matcher: ["/account/:path*", "/booking/:path*", "/fleet/:path*/book", "/login", "/onboarding"],
}

