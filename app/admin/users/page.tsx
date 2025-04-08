"use client"

import { Suspense } from "react"
import UsersTable from "@/components/admin/users-table"

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersTable />
    </Suspense>
  )
}