"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function OAuthRedirectHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Check if we have an OAuth code and redirect to auth callback
    if (!searchParams) return
    
    const code = searchParams.get("code")
    if (code) {
      console.log("🔄 OAuth code detected, redirecting to auth callback...")
      setIsRedirecting(true)
      
      // Try to get the original redirect from localStorage or sessionStorage
      const originalRedirect = localStorage.getItem('oauth_redirect') || sessionStorage.getItem('oauth_redirect')
      
      if (originalRedirect) {
        console.log("🎯 Found original redirect:", originalRedirect)
        // Redirect to auth callback with both code and redirect
        // Don't double-encode the redirect parameter
        const callbackUrl = `/auth/callback?code=${code}&redirect=${originalRedirect}`
        console.log("🔄 Redirecting to auth callback:", callbackUrl)
        
        // Immediately redirect without delay to avoid homepage rendering
        console.log("🚀 About to redirect with router.push to:", callbackUrl)
        
        // Try using window.location as a fallback if router.push doesn't work
        try {
          router.push(callbackUrl)
          console.log("✅ Router.push called successfully")
        } catch (error) {
          console.error("❌ Router.push failed, using window.location:", error)
          window.location.href = callbackUrl
        }
        
        // Clean up
        localStorage.removeItem('oauth_redirect')
        sessionStorage.removeItem('oauth_redirect')
        console.log("🧹 Cleaned up localStorage and sessionStorage")
      } else {
        // Fallback: just redirect with code
        router.push(`/auth/callback?code=${code}`)
      }
    }
  }, [searchParams, router])

  // Show loading state while redirecting to prevent homepage content from showing
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-center">Redirecting to booking...</p>
        </div>
      </div>
    )
  }
  
  return null // This component doesn't render anything
}
