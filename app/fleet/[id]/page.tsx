import { redirect } from "next/navigation"

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CarDetailPage({ params, searchParams }: PageProps) {
  const carId = params.id
  const canceled = searchParams.canceled
  
  // Server-side redirect to the booking page
  redirect(`/fleet/${carId}/book${canceled ? '?canceled=true' : ''}`)
}
