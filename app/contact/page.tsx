import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
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
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input id="subject" placeholder="How can we help you?" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

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
                      123 Luxury Lane
                      <br />
                      Miami, FL 33101
                      <br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone Number</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <a href="tel:+4708806265" className="hover:text-red-600">
                        +1 (470) 806-6265
                        4708806265
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Address</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <a href="mailto:info@444exoticrentals.com" className="hover:text-red-600">
                        info@444exoticrentals.com
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
                  If you're a current customer experiencing an emergency with your rental, please call our 24/7 support
                  line:
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

