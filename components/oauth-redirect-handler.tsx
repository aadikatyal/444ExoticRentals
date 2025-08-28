"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function OAuthRedirectHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  console.log("🔍 OAuthRedirectHandler component mounted")
  console.log("🔍 searchParams:", searchParams)
  console.log("🔍 searchParams size:", searchParams?.size)

  useEffect(() => {
    console.log("🔍 useEffect triggered")
    console.log("🔍 searchParams in useEffect:", searchParams)
    
    // Check if we have an OAuth code and redirect to auth callback
    if (!searchParams) {
      console.log("⚠️ No searchParams, returning early")
      return
    }
    
    const code = searchParams.get("code")
    const redirect = searchParams.get("redirect")
    console.log("🔍 Code found:", code)
    console.log("🔍 Redirect found:", redirect)
    
    if (code) {
      console.log("🔄 OAuth code detected, redirecting to auth callback...")
      
      // Use the redirect parameter from the URL if available, otherwise try localStorage
      let originalRedirect = redirect
      if (!originalRedirect) {
        originalRedirect = localStorage.getItem('oauth_redirect') || sessionStorage.getItem('oauth_redirect')
        console.log("🔍 Got redirect from localStorage:", originalRedirect)
      }
      
      if (originalRedirect) {
        console.log("🎯 Found original redirect:", originalRedirect)
        // Redirect to auth callback with both code and redirect
        const callbackUrl = `/auth/callback?code=${code}&redirect=${originalRedirect}`
        console.log("🔄 Redirecting to auth callback:", callbackUrl)
        
        // Immediately redirect without any delay to prevent code expiration
        console.log("🚀 Immediate redirect to:", callbackUrl)
        window.location.href = callbackUrl
        
        // Clean up localStorage after redirect is initiated
        localStorage.removeItem('oauth_redirect')
        sessionStorage.removeItem('oauth_redirect')
        console.log("🧹 Cleaned up localStorage and sessionStorage")
      } else {
        console.log("⚠️ No original redirect found")
        // Fallback: just redirect with code
        window.location.href = `/auth/callback?code=${code}`
      }
    } else {
      console.log("⚠️ No code parameter found")
    }
  }, [searchParams, router])

  // Don't show loading state - redirect immediately to prevent code expiration
  return null
}
