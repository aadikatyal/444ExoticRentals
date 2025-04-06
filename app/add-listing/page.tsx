import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function AddListingPage() {
  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">List Your Car</h1>
        <p className="text-gray-600 mb-8">Earn money by renting out your luxury or exotic vehicle</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
                <CardDescription>Tell us about your car</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Select>
                        <SelectTrigger id="make">
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ferrari">Ferrari</SelectItem>
                          <SelectItem value="lamborghini">Lamborghini</SelectItem>
                          <SelectItem value="porsche">Porsche</SelectItem>
                          <SelectItem value="bentley">Bentley</SelectItem>
                          <SelectItem value="rolls-royce">Rolls Royce</SelectItem>
                          <SelectItem value="mclaren">McLaren</SelectItem>
                          <SelectItem value="aston-martin">Aston Martin</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" placeholder="e.g. 488 GTB, Aventador, 911 Turbo" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" type="number" placeholder="e.g. 2023" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input id="color" placeholder="e.g. Rosso Corsa, Nero" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license-plate">License Plate (Last 3 digits)</Label>
                      <Input id="license-plate" placeholder="e.g. X12" maxLength={3} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horsepower">Horsepower</Label>
                      <Input id="horsepower" type="number" placeholder="e.g. 650" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="top-speed">Top Speed (MPH)</Label>
                      <Input id="top-speed" type="number" placeholder="e.g. 205" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acceleration">0-60 MPH (seconds)</Label>
                      <Input id="acceleration" type="number" step="0.1" placeholder="e.g. 3.2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your vehicle, including any special features, modifications, or unique aspects..."
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="daily-rate">Daily Rental Rate ($)</Label>
                    <Input id="daily-rate" type="number" placeholder="e.g. 1200" />
                  </div>

                  <div className="space-y-2">
                    <Label>Vehicle Photos</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-4 flex justify-center text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-red-600 hover:text-red-700 focus-within:outline-none"
                        >
                          <span>Upload files</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, GIF up to 10MB. Include exterior, interior, and detail shots.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Available Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="convertible" />
                        <label
                          htmlFor="convertible"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Convertible
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="gps" />
                        <label
                          htmlFor="gps"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          GPS Navigation
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="bluetooth" />
                        <label
                          htmlFor="bluetooth"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Bluetooth
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="premium-audio" />
                        <label
                          htmlFor="premium-audio"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Premium Audio
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="carbon-fiber" />
                        <label
                          htmlFor="carbon-fiber"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Carbon Fiber Package
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="track-package" />
                        <label
                          htmlFor="track-package"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Track Package
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <a href="/terms" className="text-red-600 hover:text-red-700">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-red-600 hover:text-red-700">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                    Submit Listing
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Listing Benefits</CardTitle>
                <CardDescription>Why list your car with us?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Earn Extra Income</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Turn your luxury vehicle into a source of income when you're not using it.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">$2M Insurance Coverage</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Your vehicle is protected with our comprehensive insurance policy.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Flexible Availability</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      You control when your car is available for rent through our easy-to-use calendar.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Vetted Renters</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      We thoroughly screen all renters to ensure they meet our strict requirements.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Quick Payments</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive payments directly to your bank account within 24 hours of each rental.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Listing Requirements</CardTitle>
                <CardDescription>Vehicles must meet these criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Vehicle must be 10 years old or newer
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Retail value of $75,000 or higher
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Less than 50,000 miles
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Clean title (no salvage or rebuilt)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Regular maintenance with records
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

