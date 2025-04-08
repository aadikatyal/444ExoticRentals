"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

type BookingContextType = {
  bookings: any[]
  isLoading: boolean
  createBookingRequest: (carId: string, startDate: string, endDate: string, location: string, totalPrice: number) => Promise<any>
  cancelBooking: (bookingId: string) => Promise<void>
  refreshBookings: () => Promise<void>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()
  const supabase = createClient()

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
    totalPrice: number
  ) => {
    if (!user) throw new Error("User must be logged in to create a booking")

    try {
      // Check for duplicate booking
      const { data: existing, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("car_id", carId)
        .eq("user_id", user.id)
        .eq("start_date", startDate)
        .eq("end_date", endDate)

      if (checkError) throw checkError
      if (existing.length > 0) {
        throw new Error("You already have a booking for this car and date range.")
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          car_id: carId,
          start_date: startDate,
          end_date: endDate,
          pickup_location: location,
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      await refreshBookings()
      return data
    } catch (error) {
      console.error("Error creating booking:", error)
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
