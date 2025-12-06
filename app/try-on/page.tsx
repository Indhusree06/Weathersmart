"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/ui/navbar"
import { ArrowLeft, Save, Check } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
  type WardrobeItem,
  type WardrobeProfile,
  type MannequinSlots,
  type MannequinType,
  getMannequinType,
  mapOutfitToSlots,
  wardrobeProfileService,
  wardrobeService
} from "@/lib/supabase"
import { MannequinCanvas } from "./components/MannequinCanvas"
import { BodyOptionsPanel } from "./components/BodyOptionsPanel"
import { OutfitItemsPanel } from "./components/OutfitItemsPanel"

function TryOnContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get parameters from URL
  const profileIdParam = searchParams?.get("profileId") || "owner"
  const location = searchParams?.get("location") || "New York, NY"
  const weather = searchParams?.get("weather") || "Unknown"
  
  // State
  const [currentProfile, setCurrentProfile] = useState<WardrobeProfile | null>(null)
  const [outfitItems, setOutfitItems] = useState<WardrobeItem[]>([])
  const [mannequinSlots, setMannequinSlots] = useState<MannequinSlots>({ accessories: [] })
  const [mannequinType, setMannequinType] = useState<MannequinType>('neutral')
  const [isAnimating, setIsAnimating] = useState(false)
  const [skinTone, setSkinTone] = useState<number>(2) // 0-4
  const [bodyType, setBodyType] = useState<string>('avg')

  // Load profile and outfit data
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        // Load profile
        if (profileIdParam === "owner") {
          const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
          const ownerProfile = profiles.find((p: WardrobeProfile) => p.is_owner || p.relation === "self")
          if (ownerProfile) {
            setCurrentProfile(ownerProfile)
            const mType = getMannequinType(ownerProfile)
            setMannequinType(mType)
          }
        } else {
          const profile = await wardrobeProfileService.getWardrobeProfile(profileIdParam)
          if (profile) {
            setCurrentProfile(profile)
            const mType = getMannequinType(profile)
            setMannequinType(mType)
          }
        }

        // Load outfit items from localStorage (passed from chat page)
        const savedOutfit = localStorage.getItem('tryOnOutfit')
        if (savedOutfit) {
          const items = JSON.parse(savedOutfit) as WardrobeItem[]
          setOutfitItems(items)
          const slots = mapOutfitToSlots(items)
          setMannequinSlots(slots)
        }
      } catch (error) {
        console.error("Error loading try-on data:", error)
      }
    }

    loadData()
  }, [user, profileIdParam])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await user?.id
    router.push("/auth")
  }

  const handleWearToday = () => {
    // Save outfit as worn today
    console.log("Wearing outfit today:", mannequinSlots)
    router.push("/chat")
  }

  const handleSaveOutfit = () => {
    // Save outfit for later
    console.log("Saving outfit:", mannequinSlots)
  }

  const handleMannequinTypeChange = (newType: MannequinType) => {
    setIsAnimating(true)
    setTimeout(() => {
      setMannequinType(newType)
      setIsAnimating(false)
    }, 200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <Navbar 
        navLinks={[
          { name: "AI Outfit Picker", href: "/chat" },
          { name: "Wardrobes", href: "/wardrobes" },
          { name: "Weather Essentials", href: "/weather-essentials" },
          { name: "Lifecycle Alerts", href: "/lifecycle-alerts" }
        ]}
        currentPath="/try-on"
        onLogout={handleLogout}
        user={user}
        userEmail={user?.email}
        userInitial={user?.email?.[0]?.toUpperCase()}
        userName={user?.email?.split('@')[0]}
      />

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/chat">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Try On Your Outfit</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleSaveOutfit}
              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Outfit
            </Button>
            <Button 
              onClick={handleWearToday}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Wear Today
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-[1800px] mx-auto flex h-[calc(100vh-180px)]">
        {/* Left Panel - Weather & Body Options */}
        <BodyOptionsPanel 
          location={location}
          weather={weather}
          outfitItems={outfitItems}
          mannequinType={mannequinType}
          onMannequinTypeChange={handleMannequinTypeChange}
          skinTone={skinTone}
          onSkinToneChange={setSkinTone}
          bodyType={bodyType}
          onBodyTypeChange={setBodyType}
          profile={currentProfile}
        />

        {/* Center Panel - Mannequin Canvas */}
        <MannequinCanvas 
          mannequinType={mannequinType}
          slots={mannequinSlots}
          onSlotsChange={setMannequinSlots}
          isAnimating={isAnimating}
          skinTone={skinTone}
          bodyType={bodyType}
        />

        {/* Right Panel - Outfit Items */}
        <OutfitItemsPanel 
          outfitItems={outfitItems}
          currentSlots={mannequinSlots}
          onApplyItem={(item) => {
            const slots = mapOutfitToSlots([item, ...Object.values(mannequinSlots).flat().filter(Boolean) as WardrobeItem[]])
            setMannequinSlots(slots)
          }}
        />
      </div>
    </div>
  )
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <TryOnContent />
    </Suspense>
  )
}
