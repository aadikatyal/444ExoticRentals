"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import AdminPageWrapper from "@/components/admin-page-wrapper"

interface CarFormProps {
  carId?: string
}

export default function CarForm({ carId }: CarFormProps) {
  const [form, setForm] = useState({
    name: "",
    make: "",
    model: "",
    year: "",
    price_per_day: "",
    location: "",
    image_url: "",
    description: "",
    horsepower: "",
    top_speed: "",
    acceleration: "",
    vehicle_type: "sedan",
    available: true,
    features: "",
  })

  const router = useRouter()

  useEffect(() => {
    if (!carId) return

    const fetchCar = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("cars").select("*").eq("id", carId).single()

      if (error) {
        console.error("Failed to fetch car:", error)
        return
      }

      setForm({
        ...data,
        features: (data.features || []).join(", "),
        year: data.year?.toString() || "",
        price_per_day: data.price_per_day?.toString() || "",
        horsepower: data.horsepower?.toString() || "",
        top_speed: data.top_speed?.toString() || "",
        acceleration: data.acceleration?.toString() || "",
      })
    }

    fetchCar()
  }, [carId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target
    const val = type === "checkbox" ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = createClient()

    const payload = {
      name: form.name,
      make: form.make,
      model: form.model,
      year: form.year ? parseInt(form.year) : null,
      price_per_day: form.price_per_day ? Math.round(Number(form.price_per_day) / 100) * 100 : null,
      location: form.location,
      image_url: form.image_url,
      description: form.description,
      horsepower: form.horsepower ? parseInt(form.horsepower) : null,
      top_speed: form.top_speed ? parseInt(form.top_speed) : null,
      acceleration: form.acceleration ? parseFloat(form.acceleration) : null,
      vehicle_type: form.vehicle_type,
      available: form.available,
      features: form.features.split(",").map(f => f.trim()).filter(Boolean),
    }

    const { error } = carId
      ? await supabase.from("cars").update(payload).eq("id", carId)
      : await supabase.from("cars").insert([payload])

    if (error) {
      console.error("Error saving car:", error)
      alert("Failed to save car.")
    } else {
      router.push("/admin/cars")
    }
  }

  return (
    <AdminPageWrapper>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 pb-24 mt-10">
        <h2 className="text-xl font-semibold">{carId ? "Edit Car" : "Add New Car"}</h2>

        {[
          { label: "Name", name: "name" },
          { label: "Make", name: "make" },
          { label: "Model", name: "model" },
          { label: "Year", name: "year", type: "number" },
          { label: "Price Per Day", name: "price_per_day", type: "number" },
          { label: "Location", name: "location" },
          { label: "Horsepower", name: "horsepower", type: "number" },
          { label: "Top Speed (mph)", name: "top_speed", type: "number" },
          { label: "Acceleration (0-60s)", name: "acceleration", type: "number" },
          { label: "Image URL", name: "image_url" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <Label>{label}</Label>
            <Input
              type={type}
              name={name}
              value={form[name as keyof typeof form] || ""}
              onChange={handleChange}
            />
          </div>
        ))}

        <div>
          <Label>Vehicle Type</Label>
          <select
            name="vehicle_type"
            value={form.vehicle_type}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          >
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="coupe">Coupe</option>
            <option value="convertible">Convertible</option>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
          </select>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div>
          <Label>Features (comma-separated)</Label>
          <Input name="features" value={form.features} onChange={handleChange} />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="available"
            id="available"
            checked={form.available}
            onChange={handleChange}
          />
          <Label htmlFor="available">Available</Label>
        </div>

        <Button type="submit" className="bg-black text-white hover:bg-gray-900">
          {carId ? "Update Car" : "Add Car"}
        </Button>
      </form>
    </AdminPageWrapper>
  )
}