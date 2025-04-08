"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type UserProfile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  drivers_license: string | null
  onboarded: boolean
  created_at: string
}

type UserContextType = {
  user: any | null
  profile: UserProfile | null
  isLoading: boolean
  isOnboarded: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          await refreshProfile()
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const refreshProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
  
    console.log("Updating with data:", data)
  
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id)
  
    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  
    await refreshProfile()
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const isOnboarded = profile?.onboarded || false

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isOnboarded,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

