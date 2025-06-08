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
    price_per_day: "",
    location: "",
    color: "",
    image_urls: [] as string[],
    description: "",
    horsepower: "",
    top_speed: "",
    acceleration: "",
    vehicle_type: "sedan",
    available: true,
    features: "",
  })
  const [files, setFiles] = useState<FileList | null>(null)

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
        location: Array.isArray(data.location) ? data.location.join(", ") : data.location,
        features: (data.features || []).join(", "),
        price_per_day: data.price_per_day?.toString() || "",
        horsepower: data.horsepower?.toString() || "",
        top_speed: data.top_speed?.toString() || "",
        acceleration: data.acceleration?.toString() || "",
        image_urls: data.image_urls || [],
      })
    }

    fetchCar()
  }, [carId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let val: string | boolean = value
    if (type === "checkbox") {
      val = (e.target as HTMLInputElement).checked
    }
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleImageUpload = async (): Promise<string[]> => {
    if (!files) return []

    const supabase = createClient()
    const uploadedUrls: string[] = []

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage.from("car-images").upload(fileName, file)

      if (error) {
        console.error("Upload failed for", file.name, error)
        continue
      }

      const { data: publicUrlData } = supabase.storage.from("car-images").getPublicUrl(fileName)
      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl)
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const uploadedUrls = await handleImageUpload()
    const finalImageUrls = [...form.image_urls, ...uploadedUrls]

    const payload = {
      name: form.name,
      make: form.make,
      model: form.model,
      price_per_day: form.price_per_day ? Math.round(Number(form.price_per_day)) : null,
      location: form.location.split(",").map((l) => l.trim()).filter(Boolean),
      color: form.color,
      image_urls: finalImageUrls,
      description: form.description,
      horsepower: form.horsepower ? parseInt(form.horsepower) : null,
      top_speed: form.top_speed ? parseInt(form.top_speed) : null,
      acceleration: form.acceleration ? parseFloat(form.acceleration) : null,
      vehicle_type: form.vehicle_type,
      available: form.available,
      features: form.features.split(",").map(f => f.trim()).filter(Boolean),
    }

    // Duplicate check only when adding a new car
    if (!carId) {
      const { data: existing, error: checkError } = await supabase
        .from("cars")
        .select("id")
        .eq("name", form.name)
        .eq("make", form.make)
        .eq("model", form.model)
        .maybeSingle()
      if (checkError) {
        console.error("Error checking for duplicate car:", checkError)
        alert("Error checking for duplicate car. Please try again.")
        return
      }
      if (existing) {
        alert("A car with the same name, make, and model already exists.")
        return
      }
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
          "name","make","model","price_per_day","location","color","horsepower","top_speed","acceleration"
        ].map((name) => (
          <div key={name}>
            <Label>{name.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</Label>
            <Input
              type={name.includes("price") || name.includes("speed") ? "number" : "text"}
              name={name}
              value={typeof form[name as keyof typeof form] === "string" || typeof form[name as keyof typeof form] === "number" ? form[name as keyof typeof form] : ""}
              onChange={handleChange}
            />
          </div>
        ))}

        <div>
          <Label>Upload Images</Label>
          <Input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
          <div className="flex flex-wrap gap-2 mt-2">
            {form.image_urls.map((url, idx) => (
              <img key={idx} src={url} className="h-24 w-auto rounded" />
            ))}
          </div>
        </div>

        <div>
          <Label>Vehicle Type</Label>
          <select
            name="vehicle_type"
            value={form.vehicle_type}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          >
            {["sedan", "suv", "coupe", "convertible", "truck", "van"].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div>
          <Label>Features (comma-separated)</Label>
          <Input name="features" value={typeof form.features === "string" ? form.features : ""} onChange={handleChange} />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="available"
            id="available"
            checked={!!form.available}
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