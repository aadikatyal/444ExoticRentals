"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, AlertCircle } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useBookings } from "@/contexts/booking-context"
import { useCars } from "@/contexts/car-context"
import Image from "next/image"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useUser()
  const { createBookingRequest } = useBookings()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [totalDays, setTotalDays] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const [pickupLocation, setPickupLocation] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const { cars } = useCars()

  useEffect(() => {
    // Get dates from URL if available
    const urlStartDate = searchParams.get("startDate")
    const urlEndDate = searchParams.get("endDate")

    if (urlStartDate) {
      setStartDate(urlStartDate)
    } else {
      // Set default start date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setStartDate(tomorrow.toISOString().split("T")[0])
    }

    if (urlEndDate) {
      setEndDate(urlEndDate)
    } else {
      // Set default end date to 3 days from now
      const threedays = new Date()
      threedays.setDate(threedays.getDate() + 3)
      setEndDate(threedays.toISOString().split("T")[0])
    }
  }, [searchParams])

  useEffect(() => {
    const fetchCar = async () => {
      try {
        // Find car in context or fetch from API
        const foundCar = cars.find((c) => c.id === params.id)

        if (foundCar) {
          setCar(foundCar)
        } else {
          // Fetch from API if not in context
          const response = await fetch(`/api/cars/${params.id}`)
          if (!response.ok) throw new Error("Car not found")
          const data = await response.json()
          setCar(data)
        }
      } catch (error: any) {
        console.error("Error fetching car:", error.message)
      } finally {
        setLoading(false)
      }
    }

    if (cars.length > 0 || !params.id) {
      fetchCar()
    }
  }, [params.id, cars])

  useEffect(() => {
    if (startDate && endDate && car) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      setTotalDays(diffDays || 1)
      setTotalPrice(diffDays * car.price_per_day || car.price_per_day)
    }
  }, [startDate, endDate, car])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError("")

    try {
      if (!user) {
        router.push(`/login?redirect=/fleet/${params.id}/book`)
        return
      }

      if (!startDate || !endDate) {
        throw new Error("Please select start and end dates")
      }

      if (new Date(startDate) > new Date(endDate)) {
        throw new Error("End date must be after start date")
      }

      // Create booking request

      const booking = await createBookingRequest(car.id, startDate, endDate, pickupLocation, totalPrice)

      // Redirect to confirmation page
      router.push(`/booking/confirmation?booking_id=${booking.id}`)
    } catch (error: any) {
      setError(error.message || "An error occurred while creating your booking")
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </PageLayout>
    )
  }

  if (!car) {
    return (
      <PageLayout>
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h2 className="mt-4 text-xl font-bold">Car Not Found</h2>
            <p className="mt-2 text-gray-600">The car you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push("/fleet")}>
              Browse Our Fleet
            </Button>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="pt-16 bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-2">{car.name || `${car.make} ${car.model}`}</h1>
          <p className="text-gray-600">Complete your booking details below</p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Car Details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <div className="relative h-64 rounded-t-lg overflow-hidden">
                <Image
                  src={car.image_url || "/placeholder.svg?height=400&width=800"}
                  alt={car.name || `${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{car.name || `${car.make} ${car.model}`}</h2>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-red-600" />
                      <span>{car.location}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <span className="text-2xl font-bold text-red-600">${car.price_per_day}</span>
                    <span className="text-gray-600"> / day</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">Horsepower</span>
                    <span className="font-semibold">{car.horsepower} HP</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">Top Speed</span>
                    <span className="font-semibold">{car.top_speed} MPH</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">0-60 mph</span>
                    <span className="font-semibold">{car.acceleration}s</span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{car.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rental Requirements</CardTitle>
                <CardDescription>Please ensure you meet all requirements before booking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Valid Driver's License</h4>
                      <p className="text-sm text-gray-600">
                        Must be at least 25 years old with a valid driver's license
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Credit Card</h4>
                      <p className="text-sm text-gray-600">A major credit card in the renter's name is required</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Proof of Insurance</h4>
                      <p className="text-sm text-gray-600">Valid insurance coverage is required</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Complete Your Booking</CardTitle>
                <CardDescription>Select your rental dates to continue</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>
                )}
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Pickup Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="start-date"
                        type="date"
                        className="pl-10"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Return Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="end-date"
                        type="date"
                        className="pl-10"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickup-location">Pickup Location</Label>
                    <select
                      id="pickup-location"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select a location</option>
                      {Array.isArray(car.location) &&
                        car.location.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                    </select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span>${car.price_per_day}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of Days:</span>
                      <span>{totalDays}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Request Booking"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Your booking will be reviewed by our team before confirmation. Payment will be collected after
                    approval.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

