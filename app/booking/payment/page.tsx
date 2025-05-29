"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, CreditCard, Calendar, Lock } from "lucide-react"
import Link from "next/link"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("booking_id")
  const [booking, setBooking] = useState<any>(null)
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState("")

  // Payment form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        router.push("/fleet")
        return
      }

      try {
        // TODO: Replace with Firebase Firestore
        // This is placeholder data
        const bookingData = {
          id: bookingId,
          car_id: "placeholder-car-id",
          user_id: "placeholder-user-id",
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          total_price: 4497,
          status: "pending",
        }

        setBooking(bookingData)

        // Get car details
        const carData = {
          id: bookingData.car_id,
          name: "Lamborghini Huracán",
          make: "Lamborghini",
          model: "Huracán",
          year: 2023,
          price_per_day: 1499,
          location: "Miami",
          horsepower: 640,
          top_speed: 201,
          acceleration: 2.9,
          description:
            "Experience the thrill of driving the Lamborghini Huracán, featuring a powerful V10 engine and cutting-edge technology.",
          image_url: "/placeholder.svg?height=300&width=500",
          available: true,
        }

        setCar(carData)
      } catch (error: any) {
        console.error("Error fetching booking details:", error.message)
        setError("Failed to load booking details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId, router])

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")

    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19)
  }

  const handleStripeCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.total_price,
          userEmail: "user@example.com", // replace with actual user email from Supabase session
          metadata: {
            type: "final",                  // 💡 marks this as final payment
            booking_id: booking.id,        // 💡 so webhook knows which to update
          },
        }),
      })
  
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url // redirect to Stripe
      } else {
        throw new Error("Failed to create Stripe session")
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }

    return digits
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError("")

    try {
      // Validate form
      if (cardNumber.replace(/\s/g, "").length !== 16) {
        throw new Error("Please enter a valid 16-digit card number")
      }

      if (expiryDate.length !== 5) {
        throw new Error("Please enter a valid expiry date (MM/YY)")
      }

      if (cvv.length !== 3) {
        throw new Error("Please enter a valid 3-digit CVV")
      }

      // In a real app, you would process payment with a payment provider here
      // For this demo, we'll simulate a successful payment after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // TODO: Replace with Firebase Firestore
      // Update booking status to confirmed
      console.log("Updating booking status to confirmed", bookingId)

      setIsComplete(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16 px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your booking for the {car?.name} has been confirmed. We've sent a confirmation email with all the
                  details.
                </p>
                <div className="space-y-4 w-full">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Booking Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-left text-gray-600">Booking ID:</div>
                      <div className="text-right font-medium">{booking?.id.substring(0, 8)}</div>
                      <div className="text-left text-gray-600">Vehicle:</div>
                      <div className="text-right font-medium">{car?.name}</div>
                      <div className="text-left text-gray-600">Pickup Date:</div>
                      <div className="text-right font-medium">{new Date(booking?.start_date).toLocaleDateString()}</div>
                      <div className="text-left text-gray-600">Return Date:</div>
                      <div className="text-right font-medium">{new Date(booking?.end_date).toLocaleDateString()}</div>
                      <div className="text-left text-gray-600">Total Amount:</div>
                      <div className="text-right font-medium">${booking?.total_price}</div>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => router.push("/account")}
                  >
                    View My Bookings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (!booking || !car) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <h2 className="text-xl font-bold">Booking Not Found</h2>
            <p className="mt-2 text-gray-600">The booking you're looking for doesn't exist or has been removed.</p>
            <Button className="mt-6 bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push("/fleet")}>
              Browse Our Fleet
            </Button>
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
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure payment for your {car.name} rental</p>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Enter your card information to complete your booking</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}
                  <div className="pt-4">
                      <Button
                        type="button"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleStripeCheckout}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Redirecting...
                          </>
                        ) : (
                          `Pay $${booking.total_price}`
                        )}
                      </Button>
                      <div className="flex items-center justify-center text-xs text-gray-500 mt-2">
                        <Lock className="h-3 w-3 mr-1" />
                        Secured by 444exoticrentals
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{car.name}</h3>
                        <p className="text-sm text-gray-600">{car.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${car.price_per_day}/day</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pickup Date:</span>
                        <span>{new Date(booking.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Return Date:</span>
                        <span>{new Date(booking.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span>
                          {Math.ceil(
                            (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rental Fee:</span>
                        <span>${booking.total_price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Insurance:</span>
                        <span>Included</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes & Fees:</span>
                        <span>Included</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${booking.total_price}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 px-6 py-4 text-sm text-gray-600">
                  <p>
                    By proceeding with payment, you agree to our{" "}
                    <Link href="/terms" className="text-red-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-red-600 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

