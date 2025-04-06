"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { User, Menu, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-black">
            444<span className="text-red-600">exoticrentals</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Home
          </Link>
          <Link href="/fleet" className="hover:text-red-600 transition-colors">
            Our Fleet
          </Link>
          <Link href="/add-listing" className="hover:text-red-600 transition-colors">
            List Your Car
          </Link>
          <Link href="/locations" className="hover:text-red-600 transition-colors">
            Locations
          </Link>
          <Link href="/about" className="hover:text-red-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-red-600 transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/account">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Account
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/login" className="hidden md:block">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">Sign In</Button>
                </Link>
              )}
            </>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-700">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white text-gray-700">
              <div className="flex flex-col space-y-6 mt-8">
                <Link
                  href="/"
                  className="text-lg font-medium hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/fleet"
                  className="text-lg font-medium hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Our Fleet
                </Link>
                <Link
                  href="/add-listing"
                  className="text-lg font-medium hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  List Your Car
                </Link>
                <Link
                  href="/locations"
                  className="text-lg font-medium hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Locations
                </Link>
                <Link
                  href="/about"
                  className="text-lg font-medium hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-lg font-medium hover:text-red-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
                <div className="pt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        className="flex items-center text-lg font-medium hover:text-red-600 transition-colors mb-4"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="mr-2 h-5 w-5" />
                        My Account
                      </Link>
                      <button
                        className="flex items-center text-lg font-medium text-red-600 hover:text-red-700 transition-colors"
                        onClick={() => {
                          handleSignOut()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center text-lg font-medium hover:text-red-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="mr-2 h-5 w-5" />
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

