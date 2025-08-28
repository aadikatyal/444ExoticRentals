"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function OAuthRedirectHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check if we have an OAuth code and redirect to auth callback
    if (!searchParams) return
    
    const code = searchParams.get("code")
    if (code) {
      console.log("🔄 OAuth code detected, redirecting to auth callback...")
      
      // Try to get the original redirect from localStorage or sessionStorage
      const originalRedirect = localStorage.getItem('oauth_redirect') || sessionStorage.getItem('oauth_redirect')
      
      if (originalRedirect) {
        console.log("🎯 Found original redirect:", originalRedirect)
        // Redirect to auth callback with both code and redirect
        // Don't double-encode the redirect parameter
        const callbackUrl = `/auth/callback?code=${code}&redirect=${originalRedirect}`
        console.log("🔄 Redirecting to auth callback:", callbackUrl)
        router.replace(callbackUrl)
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
