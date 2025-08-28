"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Get the intended redirect from localStorage
    const intendedRedirect = localStorage.getItem('oauth_redirect') || sessionStorage.getItem('oauth_redirect')
    
    if (intendedRedirect) {
      // Clean up storage
      localStorage.removeItem('oauth_redirect')
      sessionStorage.removeItem('oauth_redirect')
      
      // Redirect to intended page
      router.replace(intendedRedirect)
    } else {
      // Fallback to account page
      router.replace('/account')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to your destination.</p>
      </div>
    </div>
  )
}
