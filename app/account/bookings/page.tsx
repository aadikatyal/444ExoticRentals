"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Calendar, MapPin, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            cars:car_id (
              name,
              make,
              model,
              image_url,
              location
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setBookings(data || [])
      } catch (error: any) {
        console.error("Error fetching bookings:", error.message)
        setError("Failed to load your bookings. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router, supabase])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="pt-16 bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your car rental bookings</p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 inline-flex rounded-full p-4 mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push("/fleet")}>
              Browse Our Fleet
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-48 h-32">
                    <Image
                      src={booking.cars?.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={booking.cars?.name || "Car"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{booking.cars?.name}</h3>
                        <p className="text-sm text-gray-500">Booking ID: {booking.id.substring(0, 8)}</p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Rental Period</p>
                          <p className="text-sm">
                            {new Date(booking.start_date).toLocaleDateString()} -{" "}
                            {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm">{booking.cars?.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Total Price</p>
                          <p className="text-sm font-semibold">${booking.total_price}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/booking/details/${booking.id}`)}>
                        View Details
                      </Button>
                      {booking.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => router.push(`/booking/payment?booking_id=${booking.id}`)}
                        >
                          Complete Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}