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
  title: "444ExoticRentals - Luxury Car Rentals in Miami & Atlanta",
  description:
    "Rent exotic cars in Miami and Atlanta. Experience luxury with our premium fleet of supercars and luxury vehicles.",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://www.444exoticrentals.com",
              "logo": "https://www.444exoticrentals.com/logo.png",
            }),
          }}
        />
      </head>
      <body
        className={inter.className}
        suppressHydrationWarning
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
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