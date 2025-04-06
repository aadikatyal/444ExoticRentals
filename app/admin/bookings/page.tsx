"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminPageWrapper from "@/components/admin-page-wrapper"
import { Button } from "@/components/ui/button"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBookings = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        cars:cars(*),
        profiles:profiles(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Failed to fetch bookings:", error)
    } else {
      setBookings(data || [])
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const updateStatus = async (id: string, status: "confirmed" | "rejected") => {
    const confirmAction = window.confirm(`Are you sure you want to ${status} this booking?`)
    if (!confirmAction) return
  
    const supabase = createClient()
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id)
  
    if (error) {
      console.error("Update failed", error)
      return
    }
  
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    )
  }
  

  return (
    <AdminPageWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">All Bookings</h1>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Car</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.id}</td>
                  <td className="px-4 py-2">{b.profiles?.email || "Unknown user"}</td>
                  <td className="px-4 py-2">{b.cars?.name || "Unknown car"}</td>
                  <td className="px-4 py-2">{b.start_date} - {b.end_date}</td>
                  <td className="px-4 py-2">{b.pickup_location}</td>
                  <td className="px-4 py-2 capitalize">{b.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {b.status === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(b.id, "confirmed")}
                          disabled={loading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateStatus(b.id, "rejected")}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}