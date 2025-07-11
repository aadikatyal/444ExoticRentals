"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AlertCircle, MapPin } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingKey = searchParams.get("booking_key")
  const router = useRouter()

  const [booking, setBooking] = useState<any>(null)
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const fetchBookingAndCar = async () => {
      try {
        if (!bookingKey) throw new Error("Booking key not provided")

        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("booking_key", bookingKey)
          .single()

        if (bookingError || !bookingData) throw new Error("Booking not found")
        setBooking(bookingData)

        const { data: carData, error: carError } = await supabase
          .from("cars")
          .select("*")
          .eq("id", bookingData.car_id)
          .single()

        if (carError || !carData) throw new Error("Car not found")
        setCar(carData)
      } catch (err: any) {
        console.error("Error fetching booking:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingAndCar()
  }, [bookingKey])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <p className="text-gray-600">Loading your booking...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !booking || !car) {
    const message = error?.includes("Booking") || !booking
      ? {
          title: "Booking Not Found",
          description: "We couldn't find your booking. It may have expired or been removed.",
          button: "Return Home",
          action: () => router.push("/"),
        }
      : {
          title: "Car Not Found",
          description: "The car you're looking for doesn't exist or has been removed.",
          button: "Browse Our Fleet",
          action: () => router.push("/fleet"),
        }
  
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h2 className="mt-4 text-xl font-bold">{message.title}</h2>
            <p className="mt-2 text-gray-600">{message.description}</p>
            <button
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              onClick={message.action}
            >
              {message.button}
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

      <main
        className="flex-1 flex flex-col justify-center items-center container mx-auto px-4 pb-16"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8rem)",
        }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Booking Requested</h1>
          <p className="text-gray-600">
            Your booking request will be reviewed and approved shortly. Once approved, it will appear under your{" "}
            <strong>Approved Requests</strong> where you can proceed with payment.
          </p>
        </div>

        <Card className="w-full max-w-4xl">
          <div className="relative h-64 rounded-t-lg overflow-hidden">
            {Array.isArray(car.image_urls) && car.image_urls.length > 0 ? (
              <Carousel className="w-full h-full" opts={{ loop: true }}>
                <CarouselContent className="h-full">
                  {car.image_urls.map((url: string, index: number) => (
                    <CarouselItem key={index} className="basis-full">
                      <div className="relative w-full h-64">
                        <Image
                          src={url}
                          alt={`Car image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 z-10 bg-white/70 hover:bg-white transition" />
                <CarouselNext className="right-4 z-10 bg-white/70 hover:bg-white transition" />
              </Carousel>
            ) : (
              <Image
                src="/placeholder.svg?height=400&width=800"
                alt="Placeholder"
                fill
                className="object-cover"
              />
            )}
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
      </main>

      <Footer />
    </div>
  )
}