import type { ReactNode } from "react"
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
      <Navbar />
      <main className={`flex-1 pt-16 ${className}`}>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}

