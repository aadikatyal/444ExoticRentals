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
      .neq("status", "cancelled")
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
    console.log("🔄 Updating booking status:", { id, status })
    
    const confirmAction = window.confirm(`Are you sure you want to ${status} this booking?`)
    if (!confirmAction) return

    setLoading(true)
    
    try {
      console.log("📤 Sending request to /api/admin/approve-booking")
      const response = await fetch("/api/admin/approve-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, status }),
      })

      console.log("📥 Response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API Error:", errorText)
        throw new Error(`Failed to update booking status: ${errorText}`)
      }

      console.log("✅ Status updated successfully, refreshing bookings")
      await fetchBookings()
    } catch (error) {
      console.error("❌ Update failed:", error)
      alert(`Failed to ${status} booking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    setLoading(false)
  }

  const filteredBookings =
    filterStatus === "all" ? bookings : 
    filterStatus === "pending" ? bookings.filter((b) => b.status === "pending" || b.status === "pending_approval") :
    bookings.filter((b) => b.status === filterStatus)

  const statusColors: Record<string, string> = {
    pending: "#fbbf24",   // amber
    pending_approval: "#fbbf24",   // amber
    approved: "#3b82f6",  // blue
    confirmed: "#22c55e", // green
    rejected: "#ef4444",  // red
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      pending_approval: "Pending",
      approved: "Approved", 
      confirmed: "Confirmed",
      rejected: "Rejected"
    }
    return statusMap[status] || status
  }

  return (
    <AdminPageWrapper>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">All Bookings</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
              <SelectTrigger className="w-full sm:w-[140px]">
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

            <div className="flex gap-2">
              <Button
                variant={view === "table" ? "default" : "outline"}
                onClick={() => setView("table")}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Table View
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "outline"}
                onClick={() => setView("calendar")}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Calendar View
              </Button>
            </div>
          </div>
        </div>

        {view === "table" ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Car</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Hours</th>
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
                      <td className="px-4 py-2">{b.start_date} - {b.end_date}</td>
                      <td className="px-4 py-2 capitalize">{b.booking_type}</td>
                      <td className="px-4 py-2">{b.hours ?? "-"}</td>
                      <td className="px-4 py-2">{b.location}</td>
                      <td className="px-4 py-2 capitalize">{getStatusDisplay(b.status)}</td>
                      <td className="px-4 py-2 space-x-2">
                        {(b.status === "pending" || b.status === "pending_approval") ? (
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredBookings.map((b) => (
                <div key={b.id} className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-900">{b.cars?.name || "Unknown car"}</h3>
                      <p className="text-xs text-gray-500 font-mono">{b.id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      (b.status === 'pending' || b.status === 'pending_approval') ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusDisplay(b.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">User:</span>
                      <p className="font-medium">
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
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium capitalize">{b.booking_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Dates:</span>
                      <p className="font-medium">{b.start_date} - {b.end_date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="font-medium">{b.location}</p>
                    </div>
                    {b.hours && (
                      <div>
                        <span className="text-gray-500">Hours:</span>
                        <p className="font-medium">{b.hours}</p>
                      </div>
                    )}
                  </div>

                  {(b.status === "pending" || b.status === "pending_approval") && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => updateStatus(b.id, "approved")}
                        disabled={loading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => updateStatus(b.id, "rejected")}
                        disabled={loading}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
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
