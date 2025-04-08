"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PageLayout } from "@/components/page-layout"
import { createClient } from "@/lib/supabase/client"

export default function EditProfilePage() {
  const { user, updateProfile } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    license_file: null,
    registration_file: null,
    insurance_file: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single()

      if (error) {
        console.error("Failed to fetch profile:", error.message)
        return
      }

      setFormData((prev) => ({
        ...prev,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
      }))
    }

    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const supabase = createClient()
    const uploads: any = {}

    try {
        const uploadFile = async (file: File, key: string) => {
            const filePath = `${user!.id}/${Date.now()}-${key}`
            const bucket = supabase.storage.from("user-documents")
          
            // Try update first (if file already exists)
            let { error } = await bucket.update(filePath, file, {
              cacheControl: "3600",
              contentType: file.type,
            })
          
            // If update fails (e.g., file doesn't exist), try upload (insert)
            if (error) {
              const { error: insertError } = await bucket.upload(filePath, file, {
                cacheControl: "3600",
                contentType: file.type,
                upsert: false, // explicitly false for clarity
              })
          
              if (insertError) throw insertError
            }
          
            uploads[`${key}_file`] = filePath
          }

      if (formData.license_file) await uploadFile(formData.license_file, "license")
      if (formData.registration_file) await uploadFile(formData.registration_file, "registration")
      if (formData.insurance_file) await uploadFile(formData.insurance_file, "insurance")

      await updateProfile({
        ...formData,
        ...uploads,
      })

      router.push("/account")
    } catch (err: any) {
      setError(err.message || "Failed to update profile.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageLayout hideFooter>
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>

        {error && <div className="text-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
          </div>

          <Label>Phone</Label>
          <Input name="phone_number" value={formData.phone_number} onChange={handleChange} required />

          <Label>Address</Label>
          <Input name="address" value={formData.address} onChange={handleChange} required />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input name="city" value={formData.city} onChange={handleChange} required />
            </div>
            <div>
              <Label>State</Label>
              <Input name="state" value={formData.state} onChange={handleChange} required />
            </div>
            <div>
              <Label>ZIP</Label>
              <Input name="zip" value={formData.zip} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Update Driver’s License</Label>
            <Input name="license_file" type="file" accept="image/*,application/pdf" onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label>Update Registration</Label>
            <Input name="registration_file" type="file" accept="image/*,application/pdf" onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label>Update Insurance</Label>
            <Input name="insurance_file" type="file" accept="image/*,application/pdf" onChange={handleChange} />
          </div>

          <Button type="submit" className="bg-black text-white" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </PageLayout>
  )
}