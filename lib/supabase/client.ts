import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        name: 'sb',
        lifetime: 60 * 60 * 24 * 7, // 1 week
        domain: process.env.NODE_ENV === 'production' ? '.444exoticrentals.com' : undefined,
        path: '/',
        sameSite: 'Lax',
      },
    }
  )