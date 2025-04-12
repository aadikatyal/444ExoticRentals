// app/photoshoots/page.tsx
import { Suspense } from "react"
import PhotoshootsPage from "@/components/photoshoots-page"

export default function PhotoshootsPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading photoshoots...</div>}>
      <PhotoshootsPage />
    </Suspense>
  )
}