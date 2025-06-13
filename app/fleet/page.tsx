"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Filter, ChevronDown, ChevronUp } from "lucide-react"
import { useCars } from "@/contexts/car-context"
import CarCard from "@/components/car-card"
import { CarDetailModal } from "@/components/car-detail-modal"
import { Range } from "react-range"
import Link from "next/link"

export default function FleetPage() {
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { filteredCars, isLoading, filters, setFilters } = useCars()
  const searchParams = useSearchParams()

  const MIN = 500
  const MAX = 3000
  const STEP = 100

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setFiltersOpen(!mobile)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const location = searchParams.get("location")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const newFilters: any = {}
    if (location && location !== "all") newFilters.location = location.toLowerCase()
    if (startDate) newFilters.startDate = startDate
    if (endDate) newFilters.endDate = endDate

    if (Object.keys(newFilters).length > 0) setFilters(newFilters)
  }, [searchParams, setFilters])

  const toggleFilters = () => setFiltersOpen(!filtersOpen)
  const handleMakeChange = (make: string, checked: boolean) => {
    setFilters({ make: { ...filters.make, [make]: checked } })
  }
  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFilters({ features: { ...filters.features, [feature]: checked } })
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2">Our Exotic Car Fleet</h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-10">
          Experience the thrill of driving the world's most prestigious vehicles in Miami and Atlanta
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 cursor-pointer" onClick={toggleFilters}>
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-red-600 mr-2" />
                  <h2 className="text-xl font-bold">Filters</h2>
                </div>
                {filtersOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className={`h-5 w-5 text-gray-500 ${isMobile ? "animate-bounce" : ""}`} />
                )}
              </div>

              {filtersOpen && (
                <div className="p-6 border-t border-gray-200">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Select value={filters.location} onValueChange={(value) => setFilters({ location: value })}>
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="miami">Miami</SelectItem>
                          <SelectItem value="atlanta">Atlanta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle-type">Vehicle Type</Label>
                      <Select value={filters.vehicleType} onValueChange={(value) => setFilters({ vehicleType: value })}>
                        <SelectTrigger id="vehicle-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="sports">Sports Car</SelectItem>
                          <SelectItem value="suv">Luxury SUV</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                          <SelectItem value="sedan">Luxury Sedan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Price Range (per day)</Label>
                        <span className="text-sm text-gray-500">
                          ${filters.priceRange[0]} - ${filters.priceRange[1]}
                        </span>
                      </div>

                      <Range
                        step={STEP}
                        min={MIN}
                        max={MAX}
                        values={filters.priceRange}
                        onChange={(values) => setFilters({ ...filters, priceRange: values })}
                        renderTrack={({ props, children }) => (
                          <div
                            {...props}
                            style={{
                              ...props.style,
                              height: "6px",
                              width: "100%",
                              background: `linear-gradient(to right, #e5e7eb ${(filters.priceRange[0] - MIN) / (MAX - MIN) * 100}%, black ${(filters.priceRange[0] - MIN) / (MAX - MIN) * 100}% ${(filters.priceRange[1] - MIN) / (MAX - MIN) * 100}%, #e5e7eb ${(filters.priceRange[1] - MIN) / (MAX - MIN) * 100}%)`,
                              borderRadius: "4px",
                            }}
                          >
                            {children}
                          </div>
                        )}
                        renderThumb={({ props }) => {
                          const { key, ...rest } = props
                          return (
                            <div
                              key={key}
                              {...rest}
                              style={{
                                ...rest.style,
                                height: "8px",
                                backgroundColor: "#e11d48",
                                borderRadius: "4px",
                              }}
                            />
                          )
                        }}
                      />

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>${MIN}</span>
                        <span>${MAX}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Make</Label>
                      {["lamborghini", "ferrari", "bentley", "rolls-royce", "mercedes", "maserati", "brabus", "aston-martin", "mclaren", "porsche"].map((make) => (
                        <div key={make} className="flex items-center space-x-2">
                          <Checkbox
                            id={make}
                            checked={filters.make[make] || false}
                            onCheckedChange={(checked) => handleMakeChange(make, !!checked)}
                          />
                          <label htmlFor={make} className="text-sm font-medium">
                            {make.charAt(0).toUpperCase() + make.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>Features</Label>
                      {[
                          "adaptive-cruise-control",
                          "all-wheel-drive",
                          "ambient-lighting",
                          "carbon-fiber",
                          "ceramic-brakes",
                          "convertible",
                          "custom-exhaust",
                          "heated-seats",
                          "launch-control",
                          "massage-seats",
                          "panoramic-roof",
                          "performance-package",
                          "premium-sound-system",
                          "rear-seat-entertainment",
                          "sport-suspension",
                          "v12-engine",
                          "wireless-charging"
                        ].map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={feature}
                              checked={filters.features[feature] || false}
                              onCheckedChange={(checked) => handleFeatureChange(feature, !!checked)}
                            />
                            <label htmlFor={feature} className="text-sm font-medium">
                              {feature.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {isLoading ? "Loading vehicles..." : `${filteredCars.length} Vehicles Available`}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select defaultValue="price-low">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold mb-2">No cars match your filters</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more options</p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      location: "all",
                      vehicleType: "all",
                      priceRange: [MIN, MAX],
                      make: {},
                      features: {},
                    })
                  }
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CarDetailModal />
    </PageLayout>
  )
}