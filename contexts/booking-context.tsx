"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

type BookingContextType = {
  bookings: any[]
  isLoading: boolean
  createBookingRequest: (
    carId: string,
    startDate: string,
    endDate: string,
    location: string,
    totalPrice: number,
    bookingType: "rental" | "photoshoot",
    hours?: number | null
  ) => Promise<void>
  cancelBooking: (bookingId: string) => Promise<void>
  refreshBookings: () => Promise<void>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const supabase = createClient()

  const [startTime, setStartTime] = useState("13:00")
  const [endTime, setEndTime] = useState("11:00")

  useEffect(() => {
    if (user) {
      refreshBookings()
    } else {
      setBookings([])
      setIsLoading(false)
    }
  }, [user])

  const refreshBookings = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          cars:car_id (*)
        `)
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createBookingRequest = async (
    carId: string,
    startDate: string,
    endDate: string,
    location: string,
    totalPrice: number,
    bookingType: "rental" | "photoshoot",
    hours?: number | null
  ) => {
    if (!user) throw new Error("User must be logged in to create a booking")
  
    try {
      // Just trigger Stripe Checkout — DO NOT query or insert anything
      const response = await fetch("/api/checkout/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId,
          startDate,
          endDate,
          startTime,
          endTime,
          location,
          totalPrice,
          bookingType,
          hours,
          depositAmount: 1000, // or calculate based on user tier
        }),
      })
  
      const raw = await response.text()
      console.log("Raw deposit response:", raw)
  
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch (err) {
        throw new Error("Invalid JSON response from deposit API")
      }
  
      const { url, error } = parsed
      if (error || !url) throw new Error(error || "Failed to initiate deposit payment")
  
      window.location.href = url
    } catch (error) {
      console.error("Error creating booking request:", error)
      throw error
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("user_id", user?.id)

      if (error) throw error
      await refreshBookings()
    } catch (error) {
      console.error("Error cancelling booking:", error)
      throw error
    }
  }

  return (
    <BookingContext.Provider
      value={{
        bookings,
        isLoading,
        createBookingRequest,
        cancelBooking,
        refreshBookings,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingProvider")
  }
  return context
}
