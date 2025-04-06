"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const images = [
  {
    src: "/placeholder.svg?height=800&width=1600",
    alt: "Lamborghini on Miami beach",
  },
  {
    src: "/placeholder.svg?height=800&width=1600",
    alt: "Ferrari driving through downtown Miami",
  },
  {
    src: "/placeholder.svg?height=800&width=1600",
    alt: "Rolls Royce parked at luxury mansion",
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-full w-full">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill priority className="object-cover" />
        </div>
      ))}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === current ? "w-8 bg-amber-400" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

