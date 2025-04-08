"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AdminPageWrapper from "@/components/admin-page-wrapper"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function AdminUserProfilePage() {
  const { id } = useParams()
  const [userData, setUserData] = useState<any>(null)
  const [openDoc, setOpenDoc] = useState<{ type: string, url: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
      if (error) console.error("Failed to fetch user:", error)
      else setUserData(data)
    }

    if (id) fetchUser()
  }, [id, supabase])

  const getSignedUrl = async (path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage.from("user-documents").createSignedUrl(path, 60)
    if (error) {
      console.error("Failed to generate signed URL:", error.message)
      return null
    }
    return data.signedUrl
  }

  return (
    <AdminPageWrapper>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        {userData ? (
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Name:</strong> {userData.first_name} {userData.last_name}</p>
            <p><strong>Phone:</strong> {userData.phone_number}</p>
            <p><strong>Address:</strong> {userData.address}, {userData.city}, {userData.state} {userData.zip}</p>

            <div className="pt-4 space-x-4">
              {["license_file", "registration_file", "insurance_file"].map((key) =>
                userData[key] ? (
                  <Dialog key={key}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const signed = await getSignedUrl(userData[key])
                          if (signed) setOpenDoc({ type: key, url: signed })
                        }}
                      >
                        View {key.split("_")[0].replace(/^\w/, c => c.toUpperCase())}
                      </Button>
                    </DialogTrigger>
                    {openDoc?.type === key && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{key.split("_")[0].replace(/^\w/, c => c.toUpperCase())}</DialogTitle>
                        </DialogHeader>
                        <img src={openDoc.url} alt={key} className="max-w-full h-auto rounded" />
                      </DialogContent>
                    )}
                  </Dialog>
                ) : (
                  <span key={key} className="text-gray-400">
                    {key.split("_")[0].replace(/^\w/, c => c.toUpperCase())} not uploaded
                  </span>
                )
              )}
            </div>
          </div>
        ) : (
          <p>Loading user...</p>
        )}
      </div>
    </AdminPageWrapper>
  )
}