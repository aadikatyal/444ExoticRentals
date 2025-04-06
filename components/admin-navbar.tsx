"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const adminLinks = [
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/cars", label: "Fleet" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/transactions", label: "Transactions" },
]

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/") // Redirect to home or login page
  }

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-red-600">Admin Dashboard</h1>
      
      <div className="flex items-center space-x-4">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium px-3 py-2 rounded-md",
              pathname.startsWith(link.href)
                ? "bg-red-100 text-red-600"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {link.label}
          </Link>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </nav>
  )
}