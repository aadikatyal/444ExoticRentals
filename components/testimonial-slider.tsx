"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    location: "New York, NY",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "Renting a Lamborghini from Luxe Exotics was the highlight of my Miami trip. The service was impeccable, and the car was in pristine condition. Will definitely be coming back!",
  },
  {
    id: 2,
    name: "Sophia Martinez",
    location: "Los Angeles, CA",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "The Ferrari 488 I rented exceeded all my expectations. The team was professional and made the process seamless. The car turned heads everywhere I went in Miami Beach!",
  },
  {
    id: 3,
    name: "Michael Chen",
    location: "Chicago, IL",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 5,
    text: "From booking to drop-off, everything was perfect. The Rolls Royce Cullinan was immaculate and driving it through Miami was an unforgettable experience. Highly recommend!",
  },
]

export function TestimonialSlider() {
  const [current, setCurrent] = useState(0)

  const next = () => {
    setCurrent((current + 1) % testimonials.length)
  }

  const previous = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Avatar className="h-12 w-12 mr-4 border-2 border-amber-400">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                    <div className="flex ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic">{testimonial.text}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={previous}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 focus:outline-none"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 focus:outline-none"
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === current ? "w-8 bg-amber-400" : "bg-gray-300"}`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

