"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminPageWrapper from "@/components/admin-page-wrapper"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch users:", error)
        return
      }

      setUsers(data)
    }

    fetchUsers()
  }, [])

  return (
    <AdminPageWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Accounts</h1>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Is Admin?</th>
                <th className="px-4 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.is_admin ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}