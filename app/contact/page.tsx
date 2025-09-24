"use client"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      alert("Message sent successfully!")
      setForm({ name: "", email: "", phone: "", subject: "", message: "" })
    } else {
      alert("Failed to send message.")
    }

    setSubmitting(false)
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">We'd love to hear from you. Get in touch with our team.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                      <Input id="name" required value={form.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                      <Input id="email" type="email" required value={form.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                    <Input id="phone" value={form.phone} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input id="subject" required value={form.subject} onChange={handleChange} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea id="message" rows={6} required value={form.message} onChange={handleChange} />
                  </div>

                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info + Emergency Support */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Our Location</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Nobu Atlanta <br />
                      3520 Peachtree Rd NE<br />
                      Atlanta, GA 30326<br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone Number</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <a href="tel:+14708806265" className="hover:text-red-600">
                        +1 (470) 880-6265
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Address</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <a href="mailto:adminmissing required error components, refreshing...@444ExoticRentals.com" className="hover:text-red-600">
                        admin@444ExoticRentals.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Business Hours</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                      <p>Saturday: 10:00 AM - 5:00 PM</p>
                      <p>Sunday: 11:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Emergency Support</CardTitle>
                <CardDescription>24/7 assistance for current renters</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  If you're a current customer experiencing an emergency with your rental, please call our 24/7 support line:
                </p>
                <a
                  href="tel:+14708806265"
                  className="inline-flex items-center justify-center rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (470) 880-6265
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
