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
      // Redirect to auth callback with the code
      router.replace(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null // This component doesn't render anything
}
