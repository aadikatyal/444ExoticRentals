"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminPageWrapper from "@/components/admin-page-wrapper"
import { Button } from "@/components/ui/button"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Select } from "@/components/ui/select"
import { SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import Link from "next/link"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"table" | "calendar">("table")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "confirmed" | "rejected">("all")

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

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const confirmAction = window.confirm(`Are you sure you want to ${status} this booking?`)
    if (!confirmAction) return
  
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id)
  
    if (error) {
      console.error("Update failed", error)
    } else {
      fetchBookings()
    }
    setLoading(false)
  }

  const filteredBookings =
    filterStatus === "all" ? bookings : bookings.filter((b) => b.status === filterStatus)

  const statusColors: Record<string, string> = {
    pending: "#fbbf24",   // amber
    approved: "#3b82f6",  // blue
    confirmed: "#22c55e", // green
    rejected: "#ef4444",  // red
  }

  return (
    <AdminPageWrapper>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">All Bookings</h1>
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={view === "table" ? "default" : "outline"}
              onClick={() => setView("table")}
            >
              Table View
            </Button>
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </Button>
          </div>
        </div>

        {view === "table" ? (
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
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{b.id}</td>
                    <td className="px-4 py-2">
                      {b.profiles?.email ? (
                        <Link
                          href={`/admin/users?highlight=${b.profiles.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {b.profiles.email}
                        </Link>
                      ) : (
                        "Unknown user"
                      )}
                    </td>
                    <td className="px-4 py-2">{b.cars?.name || "Unknown car"}</td>
                    <td className="px-4 py-2">
                      {b.start_date} - {b.end_date}
                    </td>
                    <td className="px-4 py-2">{b.pickup_location}</td>
                    <td className="px-4 py-2 capitalize">{b.status}</td>
                    <td className="px-4 py-2 space-x-2">
                      {b.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(b.id, "approved")}
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
        ) : (
          <div className="bg-white p-4 rounded-lg border">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={filteredBookings.map((b) => ({
                id: b.id,
                title: b.cars?.name || "Booking",
                start: b.start_date,
                end: b.end_date,
                color: statusColors[b.status] || "#6b7280",
              }))}
              height="auto"
            />
          </div>
        )}
      </div>
    </AdminPageWrapper>
  )
}