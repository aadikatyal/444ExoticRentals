"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AdminPageWrapper from "@/components/admin-page-wrapper"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import clsx from "clsx"

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([])
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [openDoc, setOpenDoc] = useState<{ type: string, url: string } | null>(null)

  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")
  const userRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({})

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch users:", error)
        return
      }

      setUsers(data)
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    if (highlightId && userRefs.current[highlightId]) {
      userRefs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" })
      setExpandedUserId(highlightId)
    }
  }, [highlightId, users])

  const toggleExpand = (id: string) => {
    setExpandedUserId(prev => (prev === id ? null : id))
  }

  const getSignedUrl = async (path: string): Promise<string | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.storage.from("user-documents").createSignedUrl(path, 60)
    if (error) {
      console.error("Failed to generate signed URL:", error.message)
      return null
    }
    return data.signedUrl
  }

  return (
    <AdminPageWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">User Accounts</h1>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <>
                  <tr
                    key={u.id}
                    ref={(el) => (userRefs.current[u.id] = el)}
                    className={clsx("border-t", highlightId === u.id && "bg-yellow-50")}
                  >
                    <td className="px-4 py-2">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.phone_number}</td>
                    <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(u.id)}>
                        {expandedUserId === u.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>

                  {expandedUserId === u.id && (
                    <tr className="bg-gray-50 border-t">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="text-sm space-y-2">
                          <p><strong>Address:</strong> {u.address}, {u.city}, {u.state} {u.zip}</p>
                          <div className="pt-2 space-x-4">
                            {["license_file", "registration_file", "insurance_file"].map((key) => (
                              u[key] ? (
                                <Dialog key={key}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={async () => {
                                        const signed = await getSignedUrl(u[key])
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
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageWrapper>
  )
}