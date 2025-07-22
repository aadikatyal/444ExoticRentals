import type { ReactNode } from "react"
import Image from "next/image";
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface PageLayoutProps {
  children: ReactNode
  className?: string
  hideFooter?: boolean
}

export function PageLayout({ children, className = "", hideFooter = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar>
        <div className="flex items-center">
          <Image src="/logo.png" alt="444 Exotic Rentals Logo" width={120} height={40} />
        </div>
      </Navbar>
      <main className={`flex-1 pt-16 ${className}`}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}
