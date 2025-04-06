"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { useCars } from "@/contexts/car-context"

export function BookingForm() {
  const [location, setLocation] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const router = useRouter()
  const { setFilters } = useCars()

  // Set default dates only once when the component mounts
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
  }, []) // Empty dependency array to run only once

  const handleSearch = () => {
    // Update filters in context
    setFilters({
      location,
      startDate,
      endDate,
    })

    // Navigate to fleet page with query params
    router.push(`/fleet?location=${location}&startDate=${startDate}&endDate=${endDate}`)
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <Label htmlFor="location" className="text-sm font-medium mb-1 block">
          Location
        </Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger id="location" className="h-12">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="miami">Miami</SelectItem>
            <SelectItem value="atlanta">Atlanta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="start-date" className="text-sm font-medium mb-1 block">
          Start Date
        </Label>
        <div className="relative">
          <Input
            id="start-date"
            type="date"
            className="h-12 pl-10"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <Label htmlFor="end-date" className="text-sm font-medium mb-1 block">
          End Date
        </Label>
        <div className="relative">
          <Input
            id="end-date"
            type="date"
            className="h-12 pl-10"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
          />
          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <Button className="w-full h-12 bg-red-600 hover:bg-red-700 text-white" onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  )
}

