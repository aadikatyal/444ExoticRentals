export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          created_at: string
          make: string
          model: string
          year: number
          price_per_day: number
          location: string
          horsepower: number
          top_speed: number
          acceleration: number
          description: string
          image_url: string
          available: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          make: string
          model: string
          year: number
          price_per_day: number
          location: string
          horsepower: number
          top_speed: number
          acceleration: number
          description: string
          image_url: string
          available?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          make?: string
          model?: string
          year?: number
          price_per_day?: number
          location?: string
          horsepower?: number
          top_speed?: number
          acceleration?: number
          description?: string
          image_url?: string
          available?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          user_id: string
          car_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          car_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          car_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          drivers_license: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          drivers_license?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          drivers_license?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

