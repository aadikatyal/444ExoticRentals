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
  
  // For now, just redirect to the redirect parameter if it exists
  if (redirectParam) {
    console.log("🎯 Redirecting to:", redirectParam)
    return NextResponse.redirect(new URL(redirectParam, requestUrl.origin))
  }
  
  console.log("⚠️ No redirect, going to account")
  return NextResponse.redirect(new URL("/account", requestUrl.origin))
}