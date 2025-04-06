"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminPageWrapper from "@/components/admin-page-wrapper"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function AdminCarsPage() {
  const [cars, setCars] = useState<any[]>([])

  useEffect(() => {
    const fetchCars = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("cars")
        .select("*") // temporarily removed .order("created_at")
      if (error) {
        console.error("Error fetching cars:", error)
        return
      }

      console.log("Fetched cars:", data)
      setCars(data)
    }

    fetchCars()
  }, [])

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this car?")
    if (!confirm) return

    const supabase = createClient()
    const { error } = await supabase.from("cars").delete().eq("id", id)
    if (error) {
      console.error("Failed to delete car:", error)
      return
    }

    setCars((prev) => prev.filter((car) => car.id !== id))
  }

  return (
    <AdminPageWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Fleet Management</h1>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Car</th>
                <th className="px-4 py-3">Make</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Rate ($/day)</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No cars found.
                  </td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr key={car.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="relative w-20 h-12 rounded overflow-hidden">
                        <Image
                          src={car.image_url || "/placeholder.svg"}
                          alt={car.make || "Car"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 capitalize">{car.make || "—"}</td>
                    <td className="px-4 py-2 capitalize">{car.model || "—"}</td>
                    <td className="px-4 py-2">{car.year || "—"}</td>
                    <td className="px-4 py-2">${car.price_per_day || "—"}</td>
                    <td className="px-4 py-2 capitalize">{car.location || "—"}</td>
                    <td className="px-4 py-2 capitalize">{car.status || "available"}</td>
                    <td className="px-4 py-2 space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(car.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Button asChild className="bg-amber-400 hover:bg-amber-500 text-black">
            <a href="/add-listing">Add New Car</a>
          </Button>
        </div>
      </div>
    </AdminPageWrapper>
  )
}