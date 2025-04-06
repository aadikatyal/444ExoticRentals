"use client"

import { useCars } from "@/contexts/car-context"
import CarCard from "./car-card"

export default function FeaturedCars() {
  const { cars, isLoading } = useCars()

  const featuredCars = cars.slice(0, 3)

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-80"></div>
        ))}
      </>
    )
  }

  if (featuredCars.length === 0) {
    return (
      <div className="col-span-3 text-center py-12">
        <p className="text-gray-500">No cars available at the moment. Check back soon!</p>
      </div>
    )
  }

  return (
    <>
      {featuredCars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </>
  )
}