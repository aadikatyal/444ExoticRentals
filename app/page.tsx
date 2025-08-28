"use client"

import { Suspense, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Shield, Star, Clock, Calendar } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { BookingForm } from "@/components/booking-form"
import { CarDetailModal } from "@/components/car-detail-modal"
import FeaturedCars from "@/components/featured-cars"
import { useSearchParams, useRouter } from "next/navigation"

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Handle OAuth redirect
  useEffect(() => {
    const code = searchParams?.get("code")
    if (code) {
      // Get the intended redirect from localStorage
      const intendedRedirect = localStorage.getItem('oauth_redirect') || sessionStorage.getItem('oauth_redirect')
      
      if (intendedRedirect) {
        // Clean up storage
        localStorage.removeItem('oauth_redirect')
        sessionStorage.removeItem('oauth_redirect')
        
        // Redirect directly to intended page (skip the broken auth callback)
        console.log("🔄 OAuth code detected, redirecting to:", intendedRedirect)
        router.replace(intendedRedirect)
      } else {
        // No redirect found, go to account page
        console.log("⚠️ No redirect found, going to account")
        router.replace('/account')
      }
    }
  }, [searchParams, router])

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen bg-black flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/homepage2.jpg?height=1080&width=1920"
            alt="Luxury car"
            fill
            priority
            className="object-cover brightness-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />

        <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center flex-1">
          <div className="max-w-2xl pt-24 md:pt-32">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Experience Extraordinary Performance
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">
              Rent the world's most exclusive supercars and luxury vehicles in Miami and Atlanta
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/fleet">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg w-full sm:w-auto">
                  Explore Our Fleet
                </Button>
              </Link>
              <Link href="/add-listing">
                <Button
                  variant="outline"
                  className="border-white text-black hover:bg-white/10 px-8 py-6 text-lg w-full sm:w-auto"
                >
                  List Your Car
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="relative z-10 container mx-auto px-4 mt-10 pb-10">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <BookingForm />
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
            <FeaturedCars />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why Choose <span className="text-red-600">444ExoticRentals</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Shield />, title: "Premium Insurance", desc: "Comprehensive coverage for peace of mind." },
              { icon: <Star />, title: "VIP Service", desc: "Personalized concierge and exclusive benefits." },
              { icon: <Clock />, title: "24/7 Support", desc: "Assistance whenever and wherever you need it." },
              { icon: <Calendar />, title: "Flexible Booking", desc: "Easy reservation changes and cancellations." }
            ].map(({ icon, title, desc }) => (
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm" key={title}>
                <div className="h-12 w-12 text-red-600 mb-4">{icon}</div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
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
                  List your exotic car with us and earn passive income. We handle marketing, insurance, and customer
                  service.
                </p>
                <Link href="/add-listing">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">List Your Car</Button>
                </Link>
              </div>
              <div className="relative h-64 md:h-auto">
                <Image src="/images/red-ferrari.jpg?height=400&width=600" alt="Luxury car" fill className="object-cover" />
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Required Documents",
                items: [
                  "Valid driver's license (25+)",
                  "Proof of insurance",
                  "Proof of registration",
                  "Major credit card"
                ]
              },
              {
                title: "Rental Policies",
                items: [
                  "Security deposit required",
                  "Clean driving record",
                  "Must sign rental agreement",
                  "Account registration required"
                ]
              }
            ].map(({ title, items }) => (
              <div className="bg-white p-6 rounded-lg shadow-sm" key={title}>
                <h3 className="text-xl font-semibold mb-3 text-red-600">{title}</h3>
                <ul className="space-y-2 text-gray-600">
                  {items.map((text) => (
                    <li key={text} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/mvp-cover.png?height=600&width=1200"
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
