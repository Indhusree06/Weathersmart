"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, fullName)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        // Redirect to chat page after successful auth
        router.push("/chat")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/priscilla-du-preez-JGyRJlk3idE-unsplash.jpg-af3pIApkOYdobxx6Z9Px603LOHB9s3.jpeg')",
        }}
      />
      <div className="absolute inset-0 bg-background/60" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-xl border-border shadow-2xl">
          <CardContent className="p-8">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-muted bg-transparent text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Main page
                </Button>
              </Link>
            </div>

            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">W</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Weather Smart</h1>
              <p className="text-muted-foreground">Your AI-powered wardrobe assistant</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex mb-6 bg-muted rounded-lg p-1">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isSignUp ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isSignUp ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="fullName" className="text-foreground text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 h-11"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-foreground text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-11"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-11"
                  required
                />
              </div>

              {error && (
                <div className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-medium text-base disabled:opacity-50"
              >
                {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            {!isSignUp && (
              <div className="text-center mt-4">
                <button className="text-muted-foreground hover:text-foreground text-sm">Forgot your password?</button>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-primary text-sm font-medium mb-2 text-center">Demo Credentials:</p>
              <div className="space-y-1 text-center">
                <p className="text-muted-foreground text-sm font-mono">Email: <span className="text-foreground font-medium">abcd@gmail.com</span></p>
                <p className="text-muted-foreground text-sm font-mono">Password: <span className="text-foreground font-medium">abcdefg</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
