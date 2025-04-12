"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLayout } from "@/components/page-layout"
import { createClient } from "@/lib/supabase/client"

export default function OnboardingPage() {
  const { user, profile, isLoading, updateProfile } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
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
    const supabase = createClient()

    const ensureProfileExists = async () => {
      if (!user) return
      const { data } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle()
      if (!data) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          onboarded: false,
        })
        console.log("✅ New profile inserted for user", user.id)
      } else {
        console.log("ℹ️ Profile already exists for user", user.id)
      }
    }

    if (!isLoading && user) {
      console.log("👤 User loaded in onboarding effect:", user)
      ensureProfileExists()

      if (profile) {
        console.log("📄 Existing profile:", profile)
        setFormData((prev) => ({
          ...prev,
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone_number: profile.phone_number || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          zip: profile.zip || "",
          license_file: prev.license_file,
          registration_file: prev.registration_file,
          insurance_file: prev.insurance_file,
        }))
      }
    }
  }, [isLoading, user, profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    const supabase = createClient()

    try {
      console.log("🚀 Submitting onboarding form for user:", user?.id)

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user!.id)
        .maybeSingle()

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: user!.id, email: user!.email })
        if (insertError) throw insertError
        console.log("🆕 Profile created for user")
      }

      const uploads: any = {}
      const uploadFile = async (file: File, key: string) => {
        const filePath = `${user!.id}/${Date.now()}-${key}`
        const { error } = await supabase.storage.from("user-documents").upload(filePath, file)
        if (error) throw error
        uploads[`${key}_file`] = filePath
        console.log(`📤 Uploaded ${key} to ${filePath}`)
      }

      if (formData.license_file) await uploadFile(formData.license_file, "license")
      if (formData.registration_file) await uploadFile(formData.registration_file, "registration")
      if (formData.insurance_file) await uploadFile(formData.insurance_file, "insurance")

      await updateProfile({
        ...formData,
        ...uploads,
        onboarded: true,
      })
      console.log("✅ Profile updated with onboarded: true")

      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user!.id)
        .maybeSingle()

      console.log("🔁 Refetched onboarding status:", updatedProfile)
      if (fetchError) console.error("❌ Error fetching updated profile:", fetchError)

      if (updatedProfile?.onboarded) {
        console.log("🎉 Onboarding complete. Redirecting to /account")
        router.refresh()
        router.push("/account")
      } else {
        setError("Profile was saved but onboarding state is not reflected yet. Please try again.")
      }
    } catch (error: any) {
      console.error("❌ Onboarding error:", error)
      setError(error.message || "An error occurred while saving your profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" value={formData.first_name || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" value={formData.last_name || ""} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input id="phone_number" name="phone_number" type="tel" value={formData.phone_number || ""} onChange={handleChange} required />
          </div>
        </div>
      )
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" name="address" value={formData.address || ""} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={formData.state || ""} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input id="zip" name="zip" value={formData.zip || ""} onChange={handleChange} required />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="license_file">Upload Driver's License</Label>
          <Input id="license_file" name="license_file" type="file" accept="image/*,application/pdf" onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registration_file">Upload Registration</Label>
          <Input id="registration_file" name="registration_file" type="file" accept="image/*,application/pdf" onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="insurance_file">Upload Proof of Insurance</Label>
          <Input id="insurance_file" name="insurance_file" type="file" accept="image/*,application/pdf" onChange={handleChange} required />
        </div>
      </div>
    )
  }

  return (
    <PageLayout hideFooter>
      <div className="container mx-auto py-12 px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              {step === 1
                ? "Let's get to know you better"
                : step === 2
                ? "Please provide your address"
                : "Upload your documents"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              {renderStep()}
              <div className="flex justify-between mt-6">
                {step > 1 ? (
                  <Button variant="outline" type="button" onClick={prevStep} disabled={isSubmitting}>
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <Button className="bg-red-600 hover:bg-red-700 text-white" type="button" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button className="bg-red-600 hover:bg-red-700 text-white" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Complete Setup"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
