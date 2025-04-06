"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Gauge, Zap, Timer, MapPin } from "lucide-react"
import { useCars } from "@/contexts/car-context"

interface CarCardProps {
  car: any
}

export default function CarCard({ car }: CarCardProps) {
  const { setSelectedCar } = useCars()

  const handleViewDetails = () => {
    setSelectedCar(car)
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 shadow-sm">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={car.image_url || "/placeholder.svg?height=300&width=500"}
          alt={car.name || `${car.make} ${car.model}`}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-red-600 text-white font-bold py-1 px-3 rounded-full">
          ${car.price_per_day}/day
        </div>
        <div className="absolute bottom-4 left-4 bg-black/70 text-white py-1 px-3 rounded-full flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="text-xs">{car.location}</span>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">{car.name || `${car.make} ${car.model}`}</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Zap className="h-5 w-5 text-red-600 mb-1" />
            <span className="text-xs text-gray-500">Power</span>
            <span className="font-medium text-sm">{car.horsepower} HP</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Gauge className="h-5 w-5 text-red-600 mb-1" />
            <span className="text-xs text-gray-500">Top Speed</span>
            <span className="font-medium text-sm">{car.top_speed} MPH</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
            <Timer className="h-5 w-5 text-red-600 mb-1" />
            <span className="text-xs text-gray-500">0-60 MPH</span>
            <span className="font-medium text-sm">{car.acceleration}s</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button variant="outline" className="w-1/2" onClick={handleViewDetails}>
          Details
        </Button>
        <Button className="w-1/2 bg-red-600 hover:bg-red-700 text-white" onClick={() => setSelectedCar(car)}>
          Book Now
        </Button>
      </CardFooter>
    </Card>
  )
}

