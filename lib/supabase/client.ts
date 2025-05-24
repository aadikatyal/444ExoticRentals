"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        name: 'sb',
        lifetime: 60 * 60 * 24 * 7,
        domain: process.env.NODE_ENV === 'production' ? '.444exoticrentals.com' : undefined,
        path: '/',
        sameSite: 'Lax',
        // Add these two methods to satisfy @supabase/ssr in the browser
        getAll: () =>
          Object.fromEntries(
            document.cookie.split('; ').map(v => {
              const [k, val] = v.split('=')
              return [k, val]
            })
          ),
        setAll: (cookies) => {
          Object.entries(cookies).forEach(([key, value]) => {
            document.cookie = `${key}=${value}; path=/`
          })
        },
      },
    }
  )