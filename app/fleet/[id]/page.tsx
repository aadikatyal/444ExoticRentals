import { redirect } from "next/navigation"

export const dynamic = "force-dynamic" // ensure this runs per request

type PageProps = {
  params: { id: string }
  searchParams?: { canceled?: string | string[] }
}

export default function CarDetailPage({ params, searchParams = {} }: PageProps) {
  const carId = params.id

  // normalize ?canceled=... to a boolean
  const canceledRaw = Array.isArray(searchParams.canceled)
    ? searchParams.canceled[0]
    : searchParams.canceled
  const hasCanceled =
    typeof canceledRaw === "string" && canceledRaw.toLowerCase() === "true"

  const redirectUrl = `/fleet/${carId}/book${hasCanceled ? "?canceled=true" : ""}`
  redirect(redirectUrl)
}