"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

type CarFilters = {
  location: string
  vehicleType: string
  priceRange: [number, number]
  make: Record<string, boolean>
  features: Record<string, boolean>
  startDate: string
  endDate: string
}

type CarContextType = {
  cars: any[]
  filteredCars: any[]
  isLoading: boolean
  filters: CarFilters
  setFilters: (filters: Partial<CarFilters>) => void
  resetFilters: () => void
  selectedCar: any | null
  setSelectedCar: (car: any | null) => void
}

const defaultFilters: CarFilters = {
  location: "all",
  vehicleType: "all",
  priceRange: [500, 2000],
  make: {},
  features: {},
  startDate: "",
  endDate: "",
}

const CarContext = createContext<CarContextType | undefined>(undefined)

export function CarProvider({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState<any[]>([])
  const [filteredCars, setFilteredCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFiltersState] = useState<CarFilters>(defaultFilters)
  const [selectedCar, setSelectedCar] = useState<any | null>(null)
  const supabase = createClient()

  // Fetch cars only once when the component mounts
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const { data, error } = await supabase.from("cars").select("*").eq("available", true)

        if (error) {
          throw error
        }

        // Use sample data if no cars are returned
        if (!data || data.length === 0) {
          const sampleCars = [
            {
              id: "1",
              name: "Lamborghini Huracán",
              make: "lamborghini",
              model: "Huracán",
              image_url: "/placeholder.svg?height=300&width=500",
              price_per_day: 1499,
              location: "Miami",
              horsepower: 640,
              top_speed: 201,
              acceleration: 2.9,
              description:
                "Experience the thrill of driving the Lamborghini Huracán, featuring a powerful V10 engine and cutting-edge technology.",
              vehicle_type: "sports",
              features: ["convertible", "performance-package"],
            },
            {
              id: "2",
              name: "Ferrari 488 Spider",
              make: "ferrari",
              model: "488 Spider",
              image_url: "/placeholder.svg?height=300&width=500",
              price_per_day: 1699,
              location: "Atlanta",
              horsepower: 661,
              top_speed: 205,
              acceleration: 3.0,
              description:
                "The Ferrari 488 Spider is a masterpiece of engineering and design, offering an exhilarating open-top driving experience.",
              vehicle_type: "sports",
              features: ["convertible", "carbon-fiber"],
            },
            {
              id: "3",
              name: "Rolls Royce Cullinan",
              make: "rolls-royce",
              model: "Cullinan",
              image_url: "/placeholder.svg?height=300&width=500",
              price_per_day: 1899,
              location: "Miami",
              horsepower: 563,
              top_speed: 155,
              acceleration: 4.8,
              description:
                "The Rolls-Royce Cullinan is the epitome of luxury SUVs, offering unparalleled comfort and capability.",
              vehicle_type: "suv",
              features: ["all-wheel-drive"],
            },
          ]
          setCars(sampleCars)
          setFilteredCars(sampleCars)
        } else {
          setCars(data)
          setFilteredCars(data)
        }
      } catch (error) {
        console.error("Error fetching cars:", error)
        // Use sample data in case of error
        const sampleCars = [
          {
            id: "1",
            name: "Lamborghini Huracán",
            make: "lamborghini",
            model: "Huracán",
            image_url: "/placeholder.svg?height=300&width=500",
            price_per_day: 1499,
            location: "Miami",
            horsepower: 640,
            top_speed: 201,
            acceleration: 2.9,
            description:
              "Experience the thrill of driving the Lamborghini Huracán, featuring a powerful V10 engine and cutting-edge technology.",
            vehicle_type: "sports",
            features: ["convertible", "performance-package"],
          },
          {
            id: "2",
            name: "Ferrari 488 Spider",
            make: "ferrari",
            model: "488 Spider",
            image_url: "/placeholder.svg?height=300&width=500",
            price_per_day: 1699,
            location: "Atlanta",
            horsepower: 661,
            top_speed: 205,
            acceleration: 3.0,
            description:
              "The Ferrari 488 Spider is a masterpiece of engineering and design, offering an exhilarating open-top driving experience.",
            vehicle_type: "sports",
            features: ["convertible", "carbon-fiber"],
          },
          {
            id: "3",
            name: "Rolls Royce Cullinan",
            make: "rolls-royce",
            model: "Cullinan",
            image_url: "/placeholder.svg?height=300&width=500",
            price_per_day: 1899,
            location: "Miami",
            horsepower: 563,
            top_speed: 155,
            acceleration: 4.8,
            description:
              "The Rolls-Royce Cullinan is the epitome of luxury SUVs, offering unparalleled comfort and capability.",
            vehicle_type: "suv",
            features: ["all-wheel-drive"],
          },
        ]
        setCars(sampleCars)
        setFilteredCars(sampleCars)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCars()
  }, [supabase])

  // Apply filters when filters or cars change
  useEffect(() => {
    if (cars.length === 0) return

    // Apply filters to cars
    let result = [...cars]

    // Filter by location
    if (filters.location !== "all") {
      result = result.filter((car) => car.location.toLowerCase() === filters.location.toLowerCase())
    }

    // Filter by vehicle type
    if (filters.vehicleType !== "all") {
      result = result.filter((car) => car.vehicle_type?.toLowerCase() === filters.vehicleType.toLowerCase())
    }

    // Filter by price range
    result = result.filter(
      (car) => car.price_per_day >= filters.priceRange[0] && car.price_per_day <= filters.priceRange[1],
    )

    // Filter by make
    const selectedMakes = Object.entries(filters.make)
      .filter(([_, selected]) => selected)
      .map(([make, _]) => make)

    if (selectedMakes.length > 0) {
      result = result.filter((car) => selectedMakes.includes(car.make.toLowerCase()))
    }

    // Filter by features
    const selectedFeatures = Object.entries(filters.features)
      .filter(([_, selected]) => selected)
      .map(([feature, _]) => feature)

    if (selectedFeatures.length > 0) {
      result = result.filter((car) => {
        if (!car.features) return false
        return selectedFeatures.every((feature) => car.features.includes(feature))
      })
    }

    setFilteredCars(result)
  }, [cars, filters])

  // Use useCallback to prevent unnecessary re-renders
  const setFilters = useCallback((newFilters: Partial<CarFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters)
  }, [])

  return (
    <CarContext.Provider
      value={{
        cars,
        filteredCars,
        isLoading,
        filters,
        setFilters,
        resetFilters,
        selectedCar,
        setSelectedCar,
      }}
    >
      {children}
    </CarContext.Provider>
  )
}

export function useCars() {
  const context = useContext(CarContext)
  if (context === undefined) {
    throw new Error("useCars must be used within a CarProvider")
  }
  return context
}

