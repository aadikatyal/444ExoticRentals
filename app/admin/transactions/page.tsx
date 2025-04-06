"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AdminPageWrapper from "@/components/admin-page-wrapper"

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("bookings")
        .select("id, total_price, created_at, status, profiles(email), cars(name)")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch transactions:", error)
        return
      }

      setTransactions(data)
    }

    fetchTransactions()
  }, [])

  return (
    <AdminPageWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Car</th>
                <th className="px-4 py-3">Total ($)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-2">{t.id}</td>
                  <td className="px-4 py-2">{t.profiles?.email || "N/A"}</td>
                  <td className="px-4 py-2">{t.cars?.name || "N/A"}</td>
                  <td className="px-4 py-2">${t.total_price}</td>
                  <td className="px-4 py-2 capitalize">{t.status}</td>
                  <td className="px-4 py-2">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}