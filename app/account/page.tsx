"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Car, Heart, LogOut, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingBookings, setPendingBookings] = useState([])
  const [approvedBookings, setApprovedBookings] = useState([])
  const [rentalHistory, setRentalHistory] = useState([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get("payment")

  useEffect(() => {
    const supabase = createClient()

    const fetchBookings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("bookings")
        .select("*, cars(*)")
        .eq("user_id", user.id)

      if (error) return console.error("Error fetching bookings:", error)

      setPendingBookings(data.filter((b) => b.status === "pending"))
      setApprovedBookings(data.filter((b) => b.status === "confirmed"))
      setRentalHistory(data.filter((b) => b.status === "completed"))
    }

    fetchBookings()
    window.addEventListener("focus", fetchBookings)
    return () => window.removeEventListener("focus", fetchBookings)
  }, [])

  const handlePay = async (booking) => {
    console.log("Booking object:", booking)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        alert("Could not retrieve user email. Please log in again.")
        return
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.total_price,
          userEmail: user.email,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        console.error("Checkout error:", error)
        alert("Payment failed: " + error.error)
        return
      }

      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      console.error("Unexpected error:", err)
      alert("Unexpected error. Check console.")
    }
  }

  const renderBookings = (bookings, label, badgeClass, showPay = false) =>
    bookings.map((rental) => (
      <Card key={rental.id} className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-48 h-32">
            <Image
              src={rental.cars?.image_url || "/placeholder.svg"}
              alt={rental.cars?.name || "Car"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold">{rental.cars?.name || "Unknown Car"}</h3>
                <p className="text-sm text-gray-500">Booking ID: {rental.id}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className={`inline-flex items-center rounded-full ${badgeClass} px-2.5 py-0.5 text-xs font-medium`}>
                  {label}
                </span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {rental.start_date} - {rental.end_date} · {rental.pickup_location} · ${rental.total_price}
            </div>
            {showPay && (
              <div className="mt-2 md:self-end">
                <Button onClick={() => handlePay(rental)} className="bg-black text-white hover:bg-gray-900">
                  Pay Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    ))

  return (
    <Suspense fallback={<div className="text-center p-8">Loading account...</div>}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="container mx-auto pt-24 pb-16 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">John Doe</h2>
                  <p className="text-sm text-gray-500">john.doe@example.com</p>
                </div>

                <Separator className="my-4" />

                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "pending" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeTab === "pending" ? "bg-amber-400 hover:bg-amber-500 text-black" : ""}`}
                    onClick={() => setActiveTab("pending")}
                  >
                    <Car className="mr-2 h-4 w-4" />
                    Pending Requests
                  </Button>
                  <Button
                    variant={activeTab === "approved" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeTab === "approved" ? "bg-amber-400 hover:bg-amber-500 text-black" : ""}`}
                    onClick={() => setActiveTab("approved")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approved Requests
                  </Button>
                  <Button
                    variant={activeTab === "history" ? "default" : "ghost"}
                    className={`w-full justify-start ${activeTab === "history" ? "bg-amber-400 hover:bg-amber-500 text-black" : ""}`}
                    onClick={() => setActiveTab("history")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Rental History
                  </Button>
                </nav>

                <Separator className="my-4" />

                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-10">
              {activeTab === "pending" && (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Pending Requests</h2>
                    <Link href="/fleet">
                      <Button className="bg-amber-400 hover:bg-amber-500 text-black">Rent a Car</Button>
                    </Link>
                  </div>
                  {pendingBookings.length ? renderBookings(pendingBookings, "Pending", "bg-yellow-100 text-yellow-800") : (
                    <div className="text-gray-500 italic">No pending requests.</div>
                  )}
                </>
              )}

              {activeTab === "approved" && (
                <>
                  <h2 className="text-2xl font-bold">Approved Requests</h2>
                  {approvedBookings.length ? renderBookings(approvedBookings, "Approved", "bg-green-100 text-green-800", true) : (
                    <div className="text-gray-500 italic">No approved requests yet.</div>
                  )}
                </>
              )}

              {activeTab === "history" && (
                <>
                  <h2 className="text-2xl font-bold">Rental History</h2>
                  {rentalHistory.length ? renderBookings(rentalHistory, "Completed", "bg-gray-200 text-gray-800") : (
                    <div className="text-gray-500 italic">No rental history available.</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  )
}