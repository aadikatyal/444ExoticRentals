"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Gauge, Zap, Timer, CheckCircle2 } from "lucide-react"
import { useCars } from "@/contexts/car-context"
import { useUser } from "@/contexts/user-context"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function CarDetailModal() {
  const { selectedCar, setSelectedCar } = useCars()
  const { user } = useUser()
  const router = useRouter()

  const handleBookNow = () => {
    if (!user) {
      router.push(`/login?redirect=/fleet/${selectedCar.id}/book`)
    } else {
      router.push(`/fleet/${selectedCar.id}/book`)
    }
    setSelectedCar(null)
  }

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "snap",
  })

  return (
    <Dialog open={!!selectedCar} onOpenChange={(open) => !open && setSelectedCar(null)}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        {selectedCar && (
          <>
            <div className="relative w-full h-64">
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {(selectedCar.image_urls || []).map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-64 w-full">
                        <Image
                          src={url}
                          alt={`Car image ${index + 1}`}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 z-10 bg-white/70 hover:bg-white transition" />
                <CarouselNext className="right-4 z-10 bg-white/70 hover:bg-white transition" />
              </Carousel>

              <div className="absolute top-4 right-4 bg-red-600 text-white font-bold py-1 px-3 rounded-full z-20">
                ${selectedCar.price_per_day}/day
              </div>
            </div>

            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedCar.name || `${selectedCar.make} ${selectedCar.model}`}
                </DialogTitle>
                <DialogDescription className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1 text-red-600" />
                  {selectedCar.location}
                </DialogDescription>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Zap className="h-5 w-5 text-red-600 mb-1" />
                  <span className="text-xs text-gray-500">Power</span>
                  <span className="font-medium text-sm">{selectedCar.horsepower} HP</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Gauge className="h-5 w-5 text-red-600 mb-1" />
                  <span className="text-xs text-gray-500">Top Speed</span>
                  <span className="font-medium text-sm">{selectedCar.top_speed} MPH</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Timer className="h-5 w-5 text-red-600 mb-1" />
                  <span className="text-xs text-gray-500">0-60 MPH</span>
                  <span className="font-medium text-sm">{selectedCar.acceleration}s</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{selectedCar.description}</p>
              </div>

              {selectedCar.features && selectedCar.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCar.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle2 className="h-4 w-4 text-red-600 mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedCar(null)}>
                  Close
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleBookNow}>
                  Book Now
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

