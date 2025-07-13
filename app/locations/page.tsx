import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LocationsPage() {
  const locations = [
    {
      id: 1,
      name: "Nobu Atlanta",
      address: "3520 Peachtree Rd NE, Atlanta, GA 30326",
      phone: "+1 (470) 886-6265",
      hours: "Mon-Sat: 9AM-7PM, Sun: 10AM-5PM",
      image: "/images/nobu.jpg?height=300&width=600",
      description:
        "Our flagship location in the heart of Miami Beach, featuring our full lineup of exotic and luxury vehicles.",
    },
    {
      id: 2,
      name: "Brickell First Apartments",
      address: "110 SW 12th St, Miami, FL 33130",
      phone: "+1 (470) 880-6265",
      hours: "Mon-Sat: 9AM-7PM, Sun: 10AM-5PM",
      image: "/images/brickell.jpg?height=300&width=600",
      description:
        "Conveniently located in the Brickell financial district, offering easy access to our premium fleet.",
    }
  ]

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">Our Locations</h1>
        <p className="text-gray-600 mb-8">Find a 444 Exotic Rentals location near you</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((location) => (
            <Card key={location.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image src={location.image || "/placeholder.svg"} alt={location.name} fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>{location.name}</CardTitle>
                <CardDescription>{location.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    <span>{location.address}</span>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    <span>{location.phone}</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                    <span>{location.hours}</span>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" className="flex-1">
                      Get Directions
                    </Button>
                    <Link href="/fleet" className="flex-1">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">View Cars</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Airport Delivery</CardTitle>
            <CardDescription>We offer convenient delivery service to major airports in South Florida</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Miami International Airport (MIA)</h3>
                <p className="text-sm text-gray-600 mb-2">Delivery available 24/7 with advance reservation</p>
                <p className="text-sm text-gray-600">Delivery Fee: $75</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Fort Lauderdale-Hollywood (FLL)</h3>
                <p className="text-sm text-gray-600 mb-2">Delivery available 24/7 with advance reservation</p>
                <p className="text-sm text-gray-600">Delivery Fee: $100</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Palm Beach International (PBI)</h3>
                <p className="text-sm text-gray-600 mb-2">Delivery available 24/7 with advance reservation</p>
                <p className="text-sm text-gray-600">Delivery Fee: $150</p>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                For airport deliveries, our representative will meet you at the arrivals area with your vehicle. Please
                provide your flight details when making a reservation for airport delivery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}

