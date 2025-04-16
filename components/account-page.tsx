"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Car, Heart, LogOut, Check, Pencil, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AccountPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "pending"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [pendingBookings, setPendingBookings] = useState([])
  const [approvedBookings, setApprovedBookings] = useState([])
  const [rentalHistory, setRentalHistory] = useState([])
  const [myListings, setMyListings] = useState([])
  const [profile, setProfile] = useState<any>(null)

  const router = useRouter()
  const paymentStatus = searchParams.get("payment")

  useEffect(() => {
    const supabase = createClient()

    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile(profileData)

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, cars(*)")
        .eq("user_id", user.id)

      setPendingBookings(bookings.filter((b) => b.status === "pending"))
      setApprovedBookings(bookings.filter((b) => b.status === "approved"))
      setRentalHistory(bookings.filter((b) => b.status === "confirmed"))

      const { data: listings } = await supabase
        .from("car_listings")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      setMyListings(listings)
    }

    const handlePay = async (booking) => {
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
        alert("Payment failed: " + error.error)
        return
      }

      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      alert("Unexpected error. Check console.")
      console.error("Unexpected error:", err)
    }
  }

    fetchUserData()
    window.addEventListener("focus", fetchUserData)
    return () => window.removeEventListener("focus", fetchUserData)
  }, [])

  const getStatusLabel = (start: string, end: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
    const startDate = new Date(start)
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  
    const endDate = new Date(end)
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  
    if (today < startDay) return ["Upcoming", "bg-blue-100 text-blue-800"]
    if (today >= startDay && today <= endDay) return ["In Progress", "bg-yellow-100 text-yellow-800"]
    return ["Confirmed", "bg-gray-200 text-gray-800"]
  }

  const handlePay = async (booking) => {
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
        alert("Payment failed: " + error.error)
        return
      }

      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      alert("Unexpected error. Check console.")
      console.error("Unexpected error:", err)
    }
  }

  const renderBookings = (bookings, defaultLabel, defaultBadgeClass, showPay = false) =>
    bookings.map((rental) => {
      const [label, badgeClass] =
        defaultLabel === "Confirmed"
          ? getStatusLabel(rental.start_date, rental.end_date)
          : [defaultLabel, defaultBadgeClass]
  
      const canCancel = rental.status === "pending" || rental.status === "approved"
  
      const handleCancelBooking = async (bookingId: string) => {
        const confirm = window.confirm("Are you sure you want to cancel this booking?")
        if (!confirm) return
      
        const supabase = createClient()
        const { error } = await supabase.from("bookings").delete().eq("id", bookingId)
      
        if (error) {
          console.error("Failed to cancel booking:", error.message)
          alert("Failed to cancel booking. Please try again.")
        } else {
          alert("Booking canceled.")
      
          // 🧠 Re-fetch updated booking list
          const {
            data: { user },
          } = await supabase.auth.getUser()
          const { data: updatedBookings } = await supabase
            .from("bookings")
            .select("*, cars(*)")
            .eq("user_id", user.id)
      
          setPendingBookings(updatedBookings.filter((b) => b.status === "pending"))
          setApprovedBookings(updatedBookings.filter((b) => b.status === "approved"))
          setRentalHistory(updatedBookings.filter((b) => b.status === "confirmed"))
        }
      }      
  
      return (
        <Card key={rental.id} className="overflow-hidden">
          <div className="flex md:flex-row flex-col">
            <div className="relative w-full md:w-48 h-32 md:h-auto">
              <Image
                src={rental.cars?.image_url || "/placeholder.svg"}
                alt={rental.cars?.name || "Car"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold">{rental.cars?.name || "Unknown Car"}</h3>
                  <p className="text-sm text-gray-500">Booking ID: {rental.id}</p>
                </div>
                <span className={`inline-flex items-center rounded-full ${badgeClass} px-2.5 py-0.5 text-xs font-medium`}>
                  {label}
                </span>
              </div>
  
              <div className="mt-2 text-sm text-gray-600 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  {rental.start_date} – {rental.end_date} · {rental.pickup_location} · ${rental.total_price}
                </div>
                <div className="flex gap-2">
                  {showPay && (
                    <Button
                      onClick={() => handlePay(rental)}
                      className="bg-black text-white hover:bg-gray-900 w-fit"
                    >
                      Pay Now
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                    variant="destructive"
                    onClick={() => handleCancelBooking(rental.id)}
                    className="w-fit"
                  >
                    Cancel
                  </Button>                  
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )
    })
  
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 pb-16 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>{(profile?.first_name?.[0] || "U") + (profile?.last_name?.[0] || "")}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "Unnamed User"}
                </h2>
                <p className="text-sm text-gray-500">{profile?.email || "unknown@example.com"}</p>
              </div>

              <Link href="/account/edit">
                <Button variant="ghost" className="w-full justify-start">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>

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

              <Button
                variant={activeTab === "listings" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "listings" ? "bg-amber-400 hover:bg-amber-500 text-black" : ""}`}
                onClick={() => setActiveTab("listings")}
              >
                <FileText className="mr-2 h-4 w-4" />
                My Car Listings
              </Button>

              <Separator className="my-4" />

              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Main content */}
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
                {rentalHistory.length ? renderBookings(rentalHistory, "Confirmed", "bg-gray-200 text-gray-800") : (
                  <div className="text-gray-500 italic">No rental history available.</div>
                )}
              </>
            )}

            {activeTab === "listings" && (
              <>
                <h2 className="text-2xl font-bold">My Car Listings</h2>
                {myListings.length ? (
                  <div className="grid grid-cols-1 gap-4">
                    {myListings.map((listing) => (
                      <Card key={listing.id} className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">{listing.make} {listing.model}</h3>
                          <p className="text-sm text-gray-500">{listing.year} · ${listing.daily_rate}/day · {listing.location}</p>
                        </div>
                        <div className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {listing.available ? "Confirmed" : "Pending"}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No listings submitted yet.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}