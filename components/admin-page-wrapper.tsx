"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AdminNavbar from "@/components/admin-navbar"

export default function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return router.push("/login")

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (error || !profile?.is_admin) {
        router.push("/") // Not admin → redirect to homepage (or 404 page)
      } else {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [router])

  if (isAdmin === null) {
    return <div className="p-6 text-center">Checking admin access...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminNavbar />
      <main className="w-full max-w-full px-4 sm:px-6 py-4">{children}</main>
    </div>
  )
}
