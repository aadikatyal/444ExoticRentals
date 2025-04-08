"use client"

import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { createClient } from "@/lib/supabase/client"
import "@fullcalendar/common/main.css"
import "@fullcalendar/daygrid/main.css"

export default function AdminCalendar() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchBookings = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("bookings")
        .select("start_date, end_date, cars(name)")

      if (error) {
        console.error("Error fetching bookings:", error)
        return
      }

      const formatted = data.map((booking) => ({
        title: booking.cars?.name || "Booking",
        start: booking.start_date,
        end: booking.end_date,
      }))

      setEvents(formatted)
    }

    fetchBookings()
  }, [])

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
      />
    </div>
  )
}