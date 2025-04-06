import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Shield, Star, Clock, Calendar } from "lucide-react"
import CarCard from "@/components/car-card"
import { PageLayout } from "@/components/page-layout"
import { BookingForm } from "@/components/booking-form"
import { useCars } from "@/contexts/car-context"
import { CarDetailModal } from "@/components/car-detail-modal"
import FeaturedCars from "@/components/featured-cars"

export default function Home() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center pt-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Luxury car"
            fill
            priority
            className="object-cover brightness-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="container mx-auto relative z-10 px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Experience Extraordinary Performance</h1>
            <p className="text-xl text-white/90 mb-8">
              Rent the world's most exclusive supercars and luxury vehicles in Miami and Atlanta
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/fleet">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">Explore Our Fleet</Button>
              </Link>
              <Link href="/add-listing">
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                  List Your Car
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 pb-8">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <BookingForm />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Vehicles</h2>
            <Link href="/fleet" className="flex items-center text-red-600 hover:text-red-700 font-medium">
              View All Fleet
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* We'll fetch featured cars from the context in a client component */}
            <FeaturedCars />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why Choose <span className="text-red-600">444exoticrentals</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Insurance</h3>
              <p className="text-gray-600">Comprehensive coverage for peace of mind during your luxury experience.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
              <Star className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">VIP Service</h3>
              <p className="text-gray-600">Personalized concierge service and exclusive benefits for our clients.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
              <Clock className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock assistance whenever and wherever you need it.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
              <Calendar className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Flexible Booking</h3>
              <p className="text-gray-600">Easy reservation changes and cancellations to fit your schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* List Your Car CTA */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4 text-white">Own a Luxury Car?</h2>
                <p className="text-gray-300 mb-6">
                  List your exotic car with us and earn passive income when you're not using it. We handle everything
                  from marketing to insurance.
                </p>
                <div>
                  <Link href="/add-listing">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">List Your Car</Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-64 md:h-auto">
                <Image src="/placeholder.svg?height=400&width=600" alt="Luxury car" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Rental Requirements</h2>
            <p className="text-lg text-gray-600 mb-8">
              To ensure a smooth rental experience, we require all drivers to provide:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-red-600">Required Documents</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Valid driver's license (minimum 25 years old)
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Proof of insurance
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Proof of registration (for car owners listing vehicles)
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Major credit card in renter's name
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-red-600">Rental Policies</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Security deposit required
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Clean driving record
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Must sign rental agreement
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Account registration required for booking
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=600&width=1200"
            alt="Luxury car on Miami beach"
            fill
            className="object-cover brightness-50"
          />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience Luxury?</h2>
            <p className="text-lg mb-8">Book your dream car today and elevate your experience to the next level.</p>
            <Link href="/fleet">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
                BOOK YOUR EXOTIC CAR NOW
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <CarDetailModal />
    </PageLayout>
  )
}