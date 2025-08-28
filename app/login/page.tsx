"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Navbar } from "@/components/navbar"
import { FcGoogle } from "react-icons/fc"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const redirectTo = searchParams?.get("redirect") || "/account"
  const supabase = createClient()
  
  // Debug logging
  console.log("🔍 Login page - searchParams:", searchParams)
  console.log("🔍 Login page - redirect param:", searchParams?.get("redirect"))
  console.log("🔍 Login page - redirectTo value:", redirectTo)

  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab === "register") {
      setActiveTab("register")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push(redirectTo)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Show success message or redirect
      alert("Account created successfully! Please check your email to verify your account.")
      setActiveTab("login")
    } catch (error: any) {
      setError(error.message || "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
  
    console.log("🟢 Starting Google OAuth")
    console.log("🌐 Current redirectTo param:", redirectTo)
    console.log("📱 User agent:", navigator.userAgent)
    console.log("📱 Is mobile:", /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    console.log("📱 Screen size:", `${window.screen.width}x${window.screen.height}`)
    console.log("📱 Viewport size:", `${window.innerWidth}x${window.innerHeight}`)
    
    // Store the redirect parameter for later use
    if (redirectTo) {
      localStorage.setItem('oauth_redirect', redirectTo)
      sessionStorage.setItem('oauth_redirect', redirectTo)
      console.log("💾 Stored redirect in storage:", redirectTo)
    }
  
    try {
      console.log("🔄 Calling supabase.auth.signInWithOAuth...")
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/redirect`,
        },
      })
      
      console.log("✅ OAuth call completed, error:", error)
      if (error) throw error
      
    } catch (error: any) {
      console.error("❌ Google login error:", error.message)
      console.error("❌ Full error object:", error)
      setError(error.message || "An error occurred during Google login")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-bold">
                444<span className="text-red-600">ExoticRentals</span>
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to access your account or create a new one</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Account Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-red-600 hover:text-red-700">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300"></span>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <FcGoogle className="mr-2 h-4 w-4" />
                      Sign in with Google
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <div className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button
                      className="text-red-600 hover:text-red-700 font-medium"
                      onClick={() => setActiveTab("register")}
                    >
                      Sign up
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>Join 444ExoticRentals to rent or list luxury vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{" "}
                        <Link href="/terms" className="text-red-600 hover:text-red-700">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-red-600 hover:text-red-700">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300"></span>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <FcGoogle className="mr-2 h-4 w-4" />
                      Sign up with Google
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <div className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                      className="text-red-600 hover:text-red-700 font-medium"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

