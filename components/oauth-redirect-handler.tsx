"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function OAuthRedirectHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

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
    console.log("🔍 Code found:", code)
    
    if (code) {
      console.log("🔄 OAuth code detected, redirecting to auth callback...")
      
      // Try to get the original redirect from localStorage or sessionStorage
      const originalRedirect = localStorage.getItem('oauth_redirect') || sessionStorage.getItem('oauth_redirect')
      console.log("🔍 Original redirect from storage:", originalRedirect)
      
      if (originalRedirect) {
        console.log("🎯 Found original redirect:", originalRedirect)
        // Redirect to auth callback with both code and redirect
        // Don't double-encode the redirect parameter
        const callbackUrl = `/auth/callback?code=${code}&redirect=${originalRedirect}`
        console.log("🔄 Redirecting to auth callback:", callbackUrl)
        
        // Immediately redirect without any delay to prevent code expiration
        console.log("🚀 Immediate redirect to:", callbackUrl)
        window.location.href = callbackUrl
        
        // Clean up after redirect is initiated
        localStorage.removeItem('oauth_redirect')
        sessionStorage.removeItem('oauth_redirect')
        console.log("🧹 Cleaned up localStorage and sessionStorage")
      } else {
        console.log("⚠️ No original redirect found in storage")
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
