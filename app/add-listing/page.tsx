"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function AddListingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    location: [] as string[],
    license_plate: "",
    horsepower: "",
    top_speed: "",
    acceleration: "",
    description: "",
    daily_rate: "",
    features: [] as string[],
    image_url: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setIsSignedIn(true)
        setUserId(data.user.id)
      }
    }
    checkUser()
  }, [])

  const handleChange = (e: any) => {
    const { id, value, type, checked } = e.target
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        features: checked
          ? [...prev.features, id]
          : prev.features.filter((f) => f !== id),
      }))
    } else {
      setForm((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleSelectMake = (value: string) => {
    setForm((prev) => ({ ...prev, make: value }))
  }

  const handleSelectLocation = (value: string) => {
    setForm((prev) => ({ ...prev, location: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!userId) return

    let imageUrl = ""
    if (imageFile) {
      const filePath = `${userId}/${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(filePath, imageFile)
      if (uploadError) {
        toast.error("Failed to upload image")
        return
      }
      imageUrl = filePath
    }

    const { error } = await supabase.from("car_listings").insert({
      owner_id: userId,
      make: form.make,
      model: form.model,
      year: parseInt(form.year),
      category: "exotic",
      daily_rate: parseFloat(form.daily_rate),
      description: form.description,
      image_url: imageUrl,
      location: form.location,
      available: false,
      horsepower: parseInt(form.horsepower),
      top_speed: parseInt(form.top_speed),
      acceleration: parseFloat(form.acceleration),
      features: form.features,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      toast.error("Error submitting listing")
      console.error("Insert error:", error)
    } else {
      toast.success("Listing submitted!")
      router.push("/account?tab=listings")
    }
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">List Your Car</h1>
        <p className="text-gray-600 mb-8">Earn money by renting out your luxury or exotic vehicle</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!isSignedIn ? (
              <Card>
                <CardHeader>
                  <CardTitle>Start Listing</CardTitle>
                  <CardDescription>You must be signed in to add a vehicle listing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => router.push("/login?redirect=/add-listing")}
                  >
                    Start Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                  <CardDescription>Tell us about your car</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="make">Make</Label>
                        <Select required onValueChange={handleSelectMake}>
                          <SelectTrigger required>
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Ferrari", "Lamborghini", "Porsche", "Bentley", "Rolls Royce", "McLaren", "Aston Martin", "Other"].map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input id="model" value={form.model} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><Label htmlFor="year">Year</Label><Input id="year" type="number" value={form.year} onChange={handleChange} required /></div>
                      <div><Label htmlFor="color">Color</Label><Input id="color" value={form.color} onChange={handleChange} required /></div>
                      <div><Label htmlFor="license_plate">License Plate</Label><Input id="license_plate" value={form.license_plate} onChange={handleChange} required /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><Label htmlFor="horsepower">Horsepower</Label><Input id="horsepower" type="number" value={form.horsepower} onChange={handleChange} required /></div>
                      <div><Label htmlFor="top_speed">Top Speed</Label><Input id="top_speed" type="number" value={form.top_speed} onChange={handleChange} required /></div>
                      <div><Label htmlFor="acceleration">0-60 (s)</Label><Input id="acceleration" type="number" step="0.1" value={form.acceleration} onChange={handleChange} required /></div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select required onValueChange={handleSelectLocation}>
                        <SelectTrigger required>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Atlanta", "Miami"].map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="block">Description</Label>
                      <Textarea id="description" value={form.description} onChange={handleChange} rows={4} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="daily_rate" className="block">Daily Rental Rate ($)</Label>
                      <Input id="daily_rate" type="number" value={form.daily_rate} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="car-photo" className="block">Upload Image</Label>
                      <Input id="car-photo" type="file" accept="image/*" onChange={handleFileChange} required />
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {["Convertible", "GPS Navigation", "Bluetooth", "Premium Audio", "Carbon Fiber Package", "Track Package"].map((feat) => {
                          const id = feat.toLowerCase().replace(/\s+/g, "-")
                          return (
                            <div key={id} className="flex items-center space-x-2">
                              <Checkbox id={id} onChange={handleChange} />
                              <label htmlFor={id} className="text-sm font-medium">{feat}</label>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Button type="submit" className="bg-red-600 text-white">Submit Listing</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar always shown */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Benefits</CardTitle>
                <CardDescription>Why list your car with us?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["Earn Extra Income", "Turn your luxury vehicle into a source of income when you're not using it."],
                  ["$2M Insurance Coverage", "Your vehicle is protected with our comprehensive insurance policy."],
                  ["Flexible Availability", "You control when your car is available for rent through our easy-to-use calendar."],
                  ["Vetted Renters", "We thoroughly screen all renters to ensure they meet our strict requirements."],
                  ["Quick Payments", "Receive payments directly to your bank account within 24 hours of each rental."]
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">{title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Listing Requirements</CardTitle>
                <CardDescription>Vehicles must meet these criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[
                    "Vehicle must be 10 years old or newer",
                    "Retail value of $75,000 or higher",
                    "Less than 50,000 miles",
                    "Clean title (no salvage or rebuilt)",
                    "Regular maintenance with records"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}