// app/account/page.tsx
import { Suspense } from "react"
import AccountPage from "@/components/account-page"

export default function AccountPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading account...</div>}>
      <AccountPage />
    </Suspense>
  )
}