"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import CarForm from "@/components/admin/car-form"

export default function EditCarPage() {
  const params = useParams()
  const [carId, setCarId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof params.id === "string") {
      setCarId(params.id)
    } else if (Array.isArray(params.id)) {
      setCarId(params.id[0])
    }
  }, [params])

  return (
    <div className="">
      {carId && <CarForm carId={carId} />}
    </div>
  )
}