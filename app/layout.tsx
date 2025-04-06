import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/contexts/user-context"
import { CarProvider } from "@/contexts/car-context"
import { BookingProvider } from "@/contexts/booking-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "444exoticrentals - Luxury Car Rentals in Miami & Atlanta",
  description:
    "Rent exotic cars in Miami and Atlanta. Experience luxury with our premium fleet of supercars and luxury vehicles.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
          <UserProvider>
            <CarProvider>
              <BookingProvider>{children}</BookingProvider>
            </CarProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
