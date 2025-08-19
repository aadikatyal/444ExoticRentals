import { redirect } from "next/navigation"

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CarDetailPage({ params, searchParams }: PageProps) {
  const carId = params.id
  const canceled = searchParams.canceled
  
  // Force redirect to the booking page
  const redirectUrl = `/fleet/${carId}/book${canceled ? '?canceled=true' : ''}`
  console.log('Redirecting to:', redirectUrl)
  redirect(redirectUrl)
}
