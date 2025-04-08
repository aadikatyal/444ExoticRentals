"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import AdminNavbar from "@/components/admin-navbar"
import Link from "next/link"

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchListings = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error("Not signed in")
        return
      }

      const { data, error } = await supabase
        .from("car_listings")
        .select("*, profiles!car_listings_owner_id_fkey(email)")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching listings:", error)
        toast.error("Failed to load listings")
      } else {
        setListings(data ?? [])
      }
    }

    fetchListings()
  }, [])

  const handleUpdateStatus = async (id: string, available: boolean) => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${available ? "approve" : "reject"} this listing?`
    )
    if (!confirmAction) return

    const { error } = await supabase
      .from("car_listings")
      .update({ available })
      .eq("id", id)

    if (error) {
      console.error("Supabase update error:", error)
      toast.error("Failed to update listing")
      return
    }

    toast.success(`Listing ${available ? "approved" : "rejected"}`)

    const { data: updated, error: refetchError } = await supabase
      .from("car_listings")
      .select("*, profiles!car_listings_owner_id_fkey(email)")
      .order("created_at", { ascending: false })

    if (refetchError) {
      toast.error("Failed to reload listings")
      console.error("Refetch error:", refetchError)
    } else {
      setListings(updated ?? [])
    }
  }

  return (
    <>
      <AdminNavbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Car Listings</h1>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-6 py-4">Listing ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Car</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-6 py-8 text-gray-500 italic">
                    No listings found.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr key={listing.id} className="border-t">
                    <td className="px-6 py-4 font-mono text-xs text-gray-700">{listing.id}</td>
                    <td className="px-6 py-4">
                      {listing.profiles?.email ? (
                        <Link
                          href={`/admin/users?highlight=${listing.owner_id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {listing.profiles.email}
                        </Link>
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {listing.make?.[0]?.toUpperCase() + listing.make?.slice(1)} {listing.model}
                    </td>
                    <td className="px-6 py-4">
                      {Array.isArray(listing.location)
                        ? listing.location.join(", ")
                        : listing.location}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={listing.available ? "success" : "secondary"}>
                        {listing.available ? "Confirmed" : "Pending"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {!listing.available && (
                        <Button
                          size="sm"
                          className="bg-black text-white hover:bg-gray-900"
                          onClick={() => handleUpdateStatus(listing.id, true)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateStatus(listing.id, false)}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}