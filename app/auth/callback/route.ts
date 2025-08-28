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
  console.log("🔍 Request URL origin:", requestUrl.origin)
  console.log("🔍 All search params:", Object.fromEntries(requestUrl.searchParams.entries()))
  
  // For now, just redirect to the redirect parameter if it exists
  if (redirectParam && redirectParam.trim() !== "") {
    console.log("🎯 Redirecting to:", redirectParam)
    
    // Construct the full redirect URL
    const redirectUrl = new URL(redirectParam, requestUrl.origin)
    console.log("🔍 Full redirect URL:", redirectUrl.toString())
    
    // Perform the redirect
    const response = NextResponse.redirect(redirectUrl)
    console.log("🔍 Response status:", response.status)
    console.log("🔍 Response headers:", Object.fromEntries(response.headers.entries()))
    
    return response
  }
  
  console.log("⚠️ No redirect or empty redirect, going to account")
  console.log("⚠️ redirectParam value:", JSON.stringify(redirectParam))
  console.log("⚠️ redirectParam type:", typeof redirectParam)
  console.log("⚠️ redirectParam length:", redirectParam?.length)
  
  return NextResponse.redirect(new URL("/account", requestUrl.origin))
}