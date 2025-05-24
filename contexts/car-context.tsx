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

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
    
        if (!session) {
          console.warn("No Supabase session yet, skipping car fetch.")
          return
        }
    
        const { data, error } = await supabase.from("cars").select("*").eq("available", true)
        if (error) throw error
    
        setCars(data || [])
        setFilteredCars(data || [])
      } catch (error) {
        console.error("Error fetching cars:", error)
        setCars([])
        setFilteredCars([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCars()
  }, [supabase])

  useEffect(() => {
    if (cars.length === 0) return

    let result = [...cars]

    if (filters.location !== "all") {
      result = result.filter(
        (car) =>
          Array.isArray(car.location) &&
          car.location.some((loc: string) => loc.toLowerCase() === filters.location.toLowerCase())
      )
    }

    if (filters.vehicleType !== "all") {
      result = result.filter(
        (car) =>
          typeof car.vehicle_type === "string" &&
          car.vehicle_type.toLowerCase() === filters.vehicleType.toLowerCase()
      )
    }

    result = result.filter(
      (car) => car.price_per_day >= filters.priceRange[0] && car.price_per_day <= filters.priceRange[1]
    )

    const selectedMakes = Object.entries(filters.make)
      .filter(([_, selected]) => selected)
      .map(([make]) => make.toLowerCase())

    if (selectedMakes.length > 0) {
      result = result.filter(
        (car) =>
          typeof car.make === "string" && selectedMakes.includes(car.make.toLowerCase())
      )
    }

    const selectedFeatures = Object.entries(filters.features)
      .filter(([_, selected]) => selected)
      .map(([feature]) => feature)

    if (selectedFeatures.length > 0) {
      result = result.filter((car) => {
        if (!Array.isArray(car.features)) return false
        return selectedFeatures.every((f) => car.features.includes(f))
      })
    }

    setFilteredCars(result)
  }, [cars, filters])

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