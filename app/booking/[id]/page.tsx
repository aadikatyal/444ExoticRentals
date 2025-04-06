"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AlertCircle, MapPin } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking_id")
  const router = useRouter()

  const [booking, setBooking] = useState<any>(null)
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const fetchBookingAndCar = async () => {
      try {
        if (!bookingId) throw new Error("Booking ID not provided")

        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single()

        if (bookingError) throw bookingError
        setBooking(bookingData)

        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select("*")
          .eq("id", bookingData.car_id)
          .single()

        if (carError) throw carError
        setCar(carData)
      } catch (err: any) {
        console.error("Error fetching booking:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingAndCar()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <p className="text-gray-600">Loading your booking...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !booking || !car) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h2 className="mt-4 text-xl font-bold">Car Not Found</h2>
            <p className="mt-2 text-gray-600">The car you're looking for doesn't exist or has been removed.</p>
            <button
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              onClick={() => router.push("/fleet")}
            >
              Browse Our Fleet
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex flex-col justify-center items-center container mx-auto px-4 pt-12 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Booking Confirmed</h1>
          <p className="text-gray-600">
            Thank you for booking the <strong>{car.name}</strong> from{" "}
            <strong>{booking.start_date}</strong> to <strong>{booking.end_date}</strong>.
          </p>
        </div>

        <Card className="w-full max-w-4xl">
          <div className="relative h-64 rounded-t-lg overflow-hidden">
            <Image
              src={car.image_url || "/placeholder.svg?height=400&width=800"}
              alt={car.name}
              fill
              className="object-cover"
            />
          </div>

          <CardHeader>
            <CardTitle>{car.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-gray-600">
              <MapPin className="inline-block mr-1 text-red-600" />
              {car.location}
            </div>
            <p>
              <strong>Dates:</strong> {booking.start_date} to {booking.end_date}
            </p>
            <p>
              <strong>Pickup Location:</strong> {booking.pickup_location}
            </p>
            <p>
              <strong>Total Price:</strong> ${booking.total_price}
            </p>
            <p>
              <strong>Status:</strong> {booking.status}
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
