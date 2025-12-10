"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useAnalyticsData } from "@/hooks/useAnalyticsData"
import { wardrobeProfileService, WardrobeProfile } from "@/lib/supabase"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SummaryCard } from "./components/SummaryCard"

import { InteractiveCategoryChart } from "./components/InteractiveCategoryChart"
import { WeatherReadinessCard } from "./components/WeatherReadinessCard"
import { TimeBasedAnalysis } from "./components/TimeBasedAnalysis"
import { AdvancedCharts } from "./components/AdvancedCharts"
import CostPerWearDashboard from "./components/CostPerWearDashboard"


import { StyleProfilePanel } from "./components/StyleProfilePanel"

import { SavedOutfitsList } from "./components/SavedOutfitsList"

import { ArrowLeft, Package, TrendingUp, Activity, User } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Profile selection state
  const [profiles, setProfiles] = useState<WardrobeProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  
  const analyticsData = useAnalyticsData(user?.id, selectedProfileId)

  // Fetch profiles
  useEffect(() => {
    async function fetchProfiles() {
      if (!user?.id) return

      try {
        setLoadingProfiles(true)
        const profilesData = await wardrobeProfileService.getWardrobeProfiles(user.id)
        
        if (profilesData) {
          setProfiles(profilesData)
          
          // Check if profile is specified in URL
          const urlProfileId = searchParams?.get("profile")
          if (urlProfileId) {
            setSelectedProfileId(urlProfileId)
          } else if (profilesData.length > 0) {
            // Default to the first profile (usually the owner)
            const ownerProfile = profilesData.find(p => p.is_owner)
            setSelectedProfileId(ownerProfile?.id || profilesData[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching profiles:", error)
      } finally {
        setLoadingProfiles(false)
      }
    }

    fetchProfiles()
  }, [user?.id, searchParams])

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  // Handle profile change
  const handleProfileChange = (profileId: string) => {
    setSelectedProfileId(profileId === "all" ? null : profileId)
    
    // Update URL with selected profile
    const url = new URL(window.location.href)
    if (profileId === "all") {
      url.searchParams.delete("profile")
    } else {
      url.searchParams.set("profile", profileId)
    }
    window.history.pushState({}, "", url.toString())
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/auth")
  }

  // Handle AI outfit rating
  const handleRateOutfit = async (outfitId: string, rating: number) => {
    try {
      const response = await fetch('/api/rate-outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outfitId, rating })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error rating outfit:', error)
        // TODO: Show toast notification to user
      } else {
        const result = await response.json()
        console.log('Rating saved successfully:', result)
        // TODO: Show success toast notification
      }
    } catch (error) {
      console.error('Failed to save rating:', error)
      // TODO: Show error toast notification
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <Navbar
        navLinks={[
          { name: "AI Outfit Picker", href: "/chat" },
          { name: "Wardrobes", href: "/wardrobes" },
          { name: "Analytics", href: "/analytics" },
        ]}
        currentPath="/analytics"
        onLogout={handleLogout}
        user={user}
        userEmail={user?.email}
        userInitial={user?.email?.[0]?.toUpperCase()}
        userName={user?.email?.split("@")[0]}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/wardrobes">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wardrobes
            </Button>
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Analytics</h1>
                <p className="text-slate-400 mt-1">
                  Insights about your wardrobe, style and outfit usage
                </p>
              </div>
            </div>

            {/* Profile Selector */}
            {!loadingProfiles && profiles.length > 0 && (
              <div className="flex items-center space-x-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Profile</label>
                  <Select value={selectedProfileId || "all"} onValueChange={handleProfileChange}>
                    <SelectTrigger className="w-[200px] bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all" className="text-white hover:bg-slate-700">
                        Main Wardrobe
                      </SelectItem>
                      {profiles.map((profile) => (
                        <SelectItem 
                          key={profile.id} 
                          value={profile.id}
                          className="text-white hover:bg-slate-700"
                        >
                          {profile.name} {profile.is_owner && "(You)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {analyticsData.loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-400">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {analyticsData.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8">
            <p className="text-red-400">Error loading analytics: {analyticsData.error}</p>
          </div>
        )}

        {/* Analytics Content */}
        {!analyticsData.loading && !analyticsData.error && (
          <div className="space-y-8">
            {/* Profile Info Banner */}
            {selectedProfileId && profiles.length > 0 && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-300">
                      Viewing analytics for:{" "}
                      <span className="font-semibold text-white">
                        {profiles.find(p => p.id === selectedProfileId)?.name || "Profile"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Time-Based Analysis */}
            <TimeBasedAnalysis items={analyticsData.allItems} />

            {/* Cost-Per-Wear Dashboard */}
            <CostPerWearDashboard items={analyticsData.allItems} />

            {/* Advanced Charts */}
            <AdvancedCharts items={analyticsData.allItems} />

            {/* Wardrobe Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveCategoryChart data={analyticsData.categoryBreakdown} allItems={analyticsData.allItems} />
              <WeatherReadinessCard data={analyticsData.weatherReadiness} />
            </div>

            {/* Saved Outfits */}
            <SavedOutfitsList outfits={analyticsData.savedOutfits} />

            {/* Style Profile */}
            <StyleProfilePanel profile={analyticsData.styleProfile} />

            {/* Footer Note */}
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm">
                Analytics are updated in real-time based on your wardrobe data
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

