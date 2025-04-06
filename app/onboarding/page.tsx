"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLayout } from "@/components/page-layout"

export default function OnboardingPage() {
  const { user, profile, isLoading, updateProfile } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    drivers_license: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login?redirect=/onboarding")
        return
      }

      if (profile?.onboarded) {
        router.push("/account")
        return
      }

      // Pre-fill form with existing profile data if available
      if (profile) {
        setFormData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          zip: profile.zip || "",
          drivers_license: profile.drivers_license || "",
        })
      }
    }
  }, [isLoading, user, profile, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      await updateProfile({
        ...formData,
        onboarded: true,
      })

      router.push("/account")
    } catch (error: any) {
      setError(error.message || "An error occurred while saving your profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <PageLayout hideFooter>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout hideFooter>
      <div className="container mx-auto py-12 px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              {step === 1 ? "Let's get to know you better" : "Please provide your address information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drivers_license">Driver's License Number</Label>
                    <Input
                      id="drivers_license"
                      name="drivers_license"
                      value={formData.drivers_license}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required for verification purposes. We prioritize your privacy and security.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" name="zip" value={formData.zip} onChange={handleChange} required />
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {step === 1 ? (
              <div></div>
            ) : (
              <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={nextStep}>
                Continue
              </Button>
            ) : (
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  )
}

