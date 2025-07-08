"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useCars } from "@/contexts/car-context"

export function BookingForm() {
  const [location, setLocation] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const router = useRouter()
  const { setFilters } = useCars()
  const [startTime, setStartTime] = useState("12:00")
  const [endTime, setEndTime] = useState("12:00")

  useEffect(() => {
    if (!startDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setStartDate(tomorrow.toISOString().split("T")[0])
    }

    if (!endDate) {
      const threedays = new Date()
      threedays.setDate(threedays.getDate() + 3)
      setEndDate(threedays.toISOString().split("T")[0])
    }
  }, [])

  const handleSearch = () => {
    setFilters({ location, startDate, endDate })
    router.push(`/fleet?location=${location}&startDate=${startDate}&endDate=${endDate}`)
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      {/* Location */}
      <div>
        <Label htmlFor="location" className="text-sm font-medium mb-1 block">
          Location
        </Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger id="location" className="h-12">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Locations</SelectItem>
            <SelectItem value="Miami">Miami</SelectItem>
            <SelectItem value="Atlanta">Atlanta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div>
        <Label htmlFor="start-date" className="text-sm font-medium mb-1 block">
          Start Date & Time
        </Label>
        <div className="flex gap-2">
          <Input
            id="start-date"
            type="date"
            className="h-12"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          <Input
            id="start-time"
            type="time"
            className="h-12"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>

      {/* End Date */}
      <div>
        <Label htmlFor="end-date" className="text-sm font-medium mb-1 block">
          End Date & Time
        </Label>
        <div className="flex gap-2">
          <Input
            id="end-date"
            type="date"
            className="h-12"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
          />
          <Input
            id="end-time"
            type="time"
            className="h-12"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* Search Button */}
      <div>
        <Button
          className="w-full h-12 bg-red-600 hover:bg-red-700 text-white"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>
    </div>
  )
}