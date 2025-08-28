"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function OAuthRedirectHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check if we have an OAuth code and redirect to auth callback
    const code = searchParams.get("code")
    if (code) {
      console.log("🔄 OAuth code detected, redirecting to auth callback...")
      
      // Try to get the original redirect from localStorage or sessionStorage
      const originalRedirect = localStorage.getItem('oauth_redirect') || sessionStorage.getItem('oauth_redirect')
      
      if (originalRedirect) {
        console.log("🎯 Found original redirect:", originalRedirect)
        // Redirect to auth callback with both code and redirect
        // Don't double-encode the redirect parameter
        router.replace(`/auth/callback?code=${code}&redirect=${originalRedirect}`)
        // Clean up
        localStorage.removeItem('oauth_redirect')
        sessionStorage.removeItem('oauth_redirect')
      } else {
        // Fallback: just redirect with code
        router.replace(`/auth/callback?code=${code}`)
      }
    }
  }, [searchParams, router])

  return null // This component doesn't render anything
}
