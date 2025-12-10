"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Navbar } from "@/components/ui/navbar"
import {
  Loader2, MapPin, Cloud, User, Users, Shirt, Check, ChevronsUpDown, Settings, Star, Palette, Lightbulb, Thermometer, Send
} from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase, wardrobeProfileService, wardrobeService } from "@/lib/supabase"
import { createSimpleOutfitRecommendation, analyzeColorHarmony } from "./createSimpleOutfitRecommendation"
import { generateSmartOutfit, generateMultipleOutfits } from "@/lib/smartRecommendation"
import { QuickFilters } from "./components/QuickFilters"
import { VoiceInput } from "./components/VoiceInput"
import { SwapItemButton } from "./components/SwapItemButton"
import { OutfitRating } from "./components/OutfitRating"
import { OutfitOptions } from "./components/OutfitOptions"
import { EnhancedOutfitDisplay } from "./components/EnhancedOutfitDisplay"

/* --------------------------------- Types --------------------------------- */

// Generate natural weather message based on conditions
function getWeatherMessage(weather: WeatherData | null): string {
  if (!weather) return "Check the weather before you head out!";
  
  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();
  
  // Temperature-based messages
  if (temp < 32) {
    if (condition.includes('snow')) return "Bundle up! It's snowing and freezing out there.";
    return "It's freezing! Layer up with warm clothes.";
  } else if (temp < 50) {
    if (condition.includes('rain')) return "Cold and rainy - perfect weather for a cozy jacket!";
    return "Chilly day ahead - don't forget your jacket!";
  } else if (temp < 65) {
    if (condition.includes('rain')) return "Light jacket weather with some rain expected.";
    if (condition.includes('cloud')) return "Cool and cloudy - great layering weather!";
    return "Pleasant and cool - perfect for light layers.";
  } else if (temp < 75) {
    if (condition.includes('rain')) return "Mild with showers - bring an umbrella!";
    if (condition.includes('sun') || condition.includes('clear')) return "Beautiful day! Perfect weather for any outfit.";
    return "Comfortable temperature - dress however you like!";
  } else if (temp < 85) {
    if (condition.includes('rain')) return "Warm and humid with rain - stay cool and dry!";
    return "Warm and pleasant - time for lighter clothes!";
  } else {
    if (condition.includes('sun') || condition.includes('clear')) return "Hot and sunny! Keep it light and breezy.";
    return "It's hot out there - stay cool with breathable fabrics!";
  }
}

interface WeatherData {
  location: string
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

interface WardrobeProfile {
  id: string
  name: string
  relationship: string
  age?: number
}

/* --------------------------- Locations (trimmed) -------------------------- */
const US_LOCATIONS = [
  { city: "New York", state: "NY", isCapital: false },
  { city: "Los Angeles", state: "CA", isCapital: false },
  { city: "Chicago", state: "IL", isCapital: false },
  { city: "Houston", state: "TX", isCapital: false },
  { city: "Phoenix", state: "AZ", isCapital: true },
  { city: "Philadelphia", state: "PA", isCapital: false },
  { city: "San Antonio", state: "TX", isCapital: false },
  { city: "San Diego", state: "CA", isCapital: false },
  { city: "Dallas", state: "TX", isCapital: false },
  { city: "San Jose", state: "CA", isCapital: false },
  { city: "Miami", state: "FL", isCapital: false },
  { city: "Orlando", state: "FL", isCapital: false },
  { city: "Tampa", state: "FL", isCapital: false },
  { city: "Las Vegas", state: "NV", isCapital: false },
  { city: "Seattle", state: "WA", isCapital: false },
  { city: "Portland", state: "OR", isCapital: false },
  { city: "San Francisco", state: "CA", isCapital: false },
  { city: "Detroit", state: "MI", isCapital: false },
  { city: "Minneapolis", state: "MN", isCapital: false },
  { city: "Cleveland", state: "OH", isCapital: false },
  { city: "New Orleans", state: "LA", isCapital: false },
  { city: "Wichita", state: "KS", isCapital: false },
  { city: "Arlington", state: "TX", isCapital: false },
  { city: "Bakersfield", state: "CA", isCapital: false },
  { city: "Aurora", state: "CO", isCapital: false },
  { city: "Anaheim", state: "CA", isCapital: false },
  { city: "Santa Ana", state: "CA", isCapital: false },
  { city: "Corpus Christi", state: "TX", isCapital: false },
  { city: "Riverside", state: "CA", isCapital: false },
  { city: "Lexington", state: "KY", isCapital: false },
  { city: "Stockton", state: "CA", isCapital: false },
  { city: "St. Louis", state: "MO", isCapital: false },
  { city: "Cincinnati", state: "OH", isCapital: false },
  { city: "Pittsburgh", state: "PA", isCapital: false },
  { city: "Greensboro", state: "NC", isCapital: false },
  { city: "Plano", state: "TX", isCapital: false },
  { city: "Anchorage", state: "AK", isCapital: false },
  { city: "Omaha", state: "NE", isCapital: false },
  { city: "Irvine", state: "CA", isCapital: false },
  { city: "Newark", state: "NJ", isCapital: false },
  { city: "Durham", state: "NC", isCapital: false },
  { city: "Chula Vista", state: "CA", isCapital: false },
  { city: "Toledo", state: "OH", isCapital: false },
  { city: "Fort Wayne", state: "IN", isCapital: false },
  { city: "St. Petersburg", state: "FL", isCapital: false },
  { city: "Laredo", state: "TX", isCapital: false },
  { city: "Jersey City", state: "NJ", isCapital: false },
  { city: "Chandler", state: "AZ", isCapital: false },
  { city: "Lubbock", state: "TX", isCapital: false },
  { city: "Scottsdale", state: "AZ", isCapital: false },
  { city: "Reno", state: "NV", isCapital: false },
  { city: "Buffalo", state: "NY", isCapital: false },
  { city: "Gilbert", state: "AZ", isCapital: false },
  { city: "Glendale", state: "AZ", isCapital: false },
  { city: "North Las Vegas", state: "NV", isCapital: false },
  { city: "Winston-Salem", state: "NC", isCapital: false },
  { city: "Chesapeake", state: "VA", isCapital: false },
  { city: "Norfolk", state: "VA", isCapital: false },
  { city: "Fremont", state: "CA", isCapital: false },
  { city: "Garland", state: "TX", isCapital: false },
  { city: "Irving", state: "TX", isCapital: false },
  { city: "Hialeah", state: "FL", isCapital: false },
  { city: "Spokane", state: "WA", isCapital: false }
]

/* --------------------------- Color Helper Utils --------------------------- */
const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  ivory: "#FFFFF0",
  cream: "#FFF1D6",
  offwhite: "#F8F8F4",
  "off-white": "#F8F8F4",
  beige: "#F5F5DC",
  tan: "#D2B48C",
  khaki: "#C3B091",
  camel: "#C19A6B",
  brown: "#8B4513",
  chocolate: "#7B3F00",
  grey: "#808080",
  gray: "#808080",
  charcoal: "#36454F",
  silver: "#C0C0C0",
  navy: "#001F3F",
  blue: "#1E90FF",
  skyblue: "#87CEEB",
  lightblue: "#ADD8E6",
  cobalt: "#0047AB",
  teal: "#008080",
  turquoise: "#40E0D0",
  green: "#228B22",
  olive: "#556B2F",
  sage: "#B2AC88",
  lime: "#00FF00",
  yellow: "#FFD400",
  mustard: "#E1AD01",
  orange: "#FFA500",
  coral: "#FF7F50",
  red: "#FF3B30",
  maroon: "#800000",
  burgundy: "#800020",
  pink: "#FFC0CB",
  hotpink: "#FF69B4",
  magenta: "#FF00FF",
  purple: "#800080",
  violet: "#8F00FF",
  indigo: "#4B0082",
  gold: "#FFD700"
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const RGB_RE = /^rgba?\(\s*([.\d]+)\s*,\s*([.\d]+)\s*,\s*([.\d]+)(?:\s*,\s*([.\d]+))?\s*\)$/i

function normalizeColorString(input?: string): string | null {
  if (!input) return null
  const raw = String(input).trim().toLowerCase()
  if (HEX_RE.test(raw)) return raw.length === 4 ? "#" + raw.slice(1).split("").map(ch => ch + ch).join("") : raw
  const rgb = raw.match(RGB_RE)
  if (rgb) {
    const r = Math.max(0, Math.min(255, Math.round(Number(rgb[1]))))
    const g = Math.max(0, Math.min(255, Math.round(Number(rgb[2]))))
    const b = Math.max(0, Math.min(255, Math.round(Number(rgb[3]))))
    return "#" + [r, g, b].map(n => n.toString(16).padStart(2, "0")).join("")
  }
  const tokens = raw.replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean)
  const condensed = tokens.join("")
  if (COLOR_MAP[condensed]) return COLOR_MAP[condensed]
  for (const t of tokens) if (COLOR_MAP[t]) return COLOR_MAP[t]
  for (const key of Object.keys(COLOR_MAP)) if (raw.includes(key)) return COLOR_MAP[key]
  if (raw.includes("cream")) return COLOR_MAP["cream"]
  if (raw.includes("ivory")) return COLOR_MAP["ivory"]
  if (raw.includes("off white") || raw.includes("off-white")) return COLOR_MAP["offwhite"]
  return null
}
function colorForItemDot(color?: string): string {
  return normalizeColorString(color) ?? "#888888"
}

/* -------------------------------- Component ------------------------------- */
export default function ChatPage() {
  const { signOut } = useAuth()
  const router = useRouter()

  // --- State ---
  const [user, setUser] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  const [selectedLocation, setSelectedLocation] = useState("New York, NY")
  const [mainLocationOpen, setMainLocationOpen] = useState(false)
  const [mainSearchQuery, setMainSearchQuery] = useState("")

  const [selectedProfile, setSelectedProfile] = useState<string>("owner")
  const [wardrobeProfiles, setWardrobeProfiles] = useState<WardrobeProfile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)

  const [currentOutfit, setCurrentOutfit] = useState<any>(null)
  const [outfitOptions, setOutfitOptions] = useState<any[]>([])
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0)
  const outfitDisplayRef = useRef<HTMLDivElement>(null)
  const [currentWardrobeItems, setCurrentWardrobeItems] = useState<any[]>([])
  const [wardrobeLoading, setWardrobeLoading] = useState(false)
  const [showMultipleOptions, setShowMultipleOptions] = useState(false)

  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastRequest, setLastRequest] = useState<string>("What should I wear today?")

  const addMessage = (m: any) => setMessages(prev => [...prev, m])

  /* ------------------------------- Auth check ------------------------------ */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: supaUser } } = await supabase.auth.getUser()
        if (!supaUser) {
          router.push('/')
          return
        }
        if (currentUserId && currentUserId !== supaUser.id) {
          setCurrentOutfit(null)
          setMessages([])
          setCurrentWardrobeItems([])
          setWardrobeProfiles([])
          setSelectedProfile("owner")
          setInput("")
          localStorage.removeItem('weathersmart-chat-session')
          localStorage.removeItem('weathersmart-outfit-session')
        }
        setUser(supaUser)
        setCurrentUserId(supaUser.id)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentOutfit(null)
        setMessages([])
        setCurrentWardrobeItems([])
        setWardrobeProfiles([])
        setSelectedProfile("owner")
        setInput("")
        setCurrentUserId(null)
        localStorage.removeItem('weathersmart-chat-session')
        localStorage.removeItem('weathersmart-outfit-session')
      } else if (event === 'SIGNED_IN' && session?.user) {
        if (currentUserId && currentUserId !== session.user.id) {
          setCurrentOutfit(null)
          setMessages([])
          setCurrentWardrobeItems([])
          setWardrobeProfiles([])
          setSelectedProfile("owner")
          setInput("")
          localStorage.removeItem('weathersmart-chat-session')
          localStorage.removeItem('weathersmart-outfit-session')
        }
        setCurrentUserId(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => {
    if (!loading && !user) router.push("/auth")
  }, [user, loading, router])

  /* ---------------------------- Load profiles/items ---------------------------- */
  useEffect(() => {
    const loadProfiles = async () => {
      if (!user) return
      setProfilesLoading(true)
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        let profiles: any[] | null = null
        let useMockData = false

        if (!uuidRegex.test(user.id)) {
          useMockData = true
        } else {
          profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
          if (!profiles || profiles.length === 0) useMockData = true
        }

        if (profiles && profiles.length > 0) {
          const formattedProfiles = await Promise.all(
            profiles.map(async (profile: any) => {
              let itemCount = 0
              try {
                const items = await wardrobeService.getWardrobeItems(user.id, profile.id)
                itemCount = items?.length || 0
              } catch { itemCount = 0 }
              return {
                id: profile.id,
                name: profile.name,
                relationship: profile.relation || "other",
                age: profile.age,
                itemCount,
              }
            })
          )
          setWardrobeProfiles(formattedProfiles)
          const ownerProfile = formattedProfiles.find((p: any) => p.relationship === "self")
          setSelectedProfile(ownerProfile ? "owner" : (formattedProfiles[0]?.id ?? "owner"))
        } else if (useMockData) {
          setWardrobeProfiles([])
        }
      } catch (error) {
        console.error("Error loading wardrobe profiles:", error)
        setWardrobeProfiles([])
      } finally {
        setProfilesLoading(false)
      }
    }
    loadProfiles()
  }, [user])

  useEffect(() => {
    const loadWardrobeItems = async () => {
      if (!user || !selectedProfile || profilesLoading) return
      setWardrobeLoading(true)
      try {
        let items: any[] = []

        if (selectedProfile === "family") {
          const allItems: any[] = []
          for (const profile of wardrobeProfiles) {
            const profileItems = await wardrobeService.getWardrobeItems(user.id, profile.id)
            if (profileItems) allItems.push(...profileItems)
          }
          const mainItems = await wardrobeService.getWardrobeItems(user.id)
          if (mainItems) allItems.push(...mainItems)
          items = allItems
        } else if (selectedProfile === "owner") {
          const ownerProfile = wardrobeProfiles.find((p) => p.relationship === "self")
          if (ownerProfile) {
            items = await wardrobeService.getWardrobeItems(user.id, ownerProfile.id)
          }
          const mainItems = await wardrobeService.getWardrobeItems(user.id)
          if (mainItems) items = [...(items || []), ...mainItems]
        } else {
          items = await wardrobeService.getWardrobeItems(user.id, selectedProfile)
        }

        const sanitizedItems = (items || []).map((item) => ({
          ...item,
          name: String(item.name || 'Unknown Item'),
          category: String(item.category || 'Uncategorized'),
          color: String(item.color || ''),
          brand: String(item.brand || ''),
          description: String(item.description || ''),
          id: String(item.id || ''),
          created_at: String(item.created_at || ''),
          price: typeof item.price === 'number' ? item.price : 0,
          wear_count: typeof item.wear_count === 'number' ? item.wear_count : 0,
          image: item.image_url || item.image_path || item.image || '/images/placeholder.png',
        }))

        setCurrentWardrobeItems(sanitizedItems)
      } catch (error) {
        console.error("Error loading wardrobe items:", error)
        setCurrentWardrobeItems([])
      } finally {
        setWardrobeLoading(false)
      }
    }
    loadWardrobeItems()
  }, [user, selectedProfile, wardrobeProfiles, profilesLoading])

  /* -------------------------------- Weather -------------------------------- */
  const fetchWeather = async (location: string) => {
    setWeatherLoading(true)
    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`, { cache: "no-store" })
      if (response.ok) {
        const data = await response.json()
        setWeather(data)
      } else {
        console.error("Failed to fetch weather")
        setWeather(null)
      }
    } catch (error) {
      console.error("Weather fetch error:", error)
      setWeather(null)
    } finally {
      setWeatherLoading(false)
    }
  }

  // IMPORTANT: refetch on every location change (no !weather gate)
  useEffect(() => {
    if (!selectedLocation) return
    setWeather(null)                // optional: clear stale weather
    fetchWeather(selectedLocation)  // always refetch
  }, [selectedLocation])

  /* ------------------------------- Persistence ------------------------------ */
  useEffect(() => {
    const chatSession = { 
      messages, 
      currentOutfit, 
      selectedProfile, 
      selectedLocation,
      outfitOptions,
      showMultipleOptions,
      selectedOptionIndex,
      timestamp: Date.now() 
    }
    localStorage.setItem('weathersmart-chat-session', JSON.stringify(chatSession))
  }, [messages, currentOutfit, selectedProfile, selectedLocation, outfitOptions, showMultipleOptions, selectedOptionIndex])

  useEffect(() => {
    const restore = () => {
      try {
        const saved = localStorage.getItem('weathersmart-chat-session')
        if (saved) {
          const s = JSON.parse(saved)
          const isRecent = Date.now() - s.timestamp < 24 * 60 * 60 * 1000
          if (isRecent) {
            if (s.messages) setMessages(s.messages)
            if (s.currentOutfit) setCurrentOutfit(s.currentOutfit)
            if (s.selectedLocation) setSelectedLocation(s.selectedLocation)
            if (s.outfitOptions) setOutfitOptions(s.outfitOptions)
            if (s.showMultipleOptions !== undefined) setShowMultipleOptions(s.showMultipleOptions)
            if (s.selectedOptionIndex !== undefined) setSelectedOptionIndex(s.selectedOptionIndex)
          }
        }
      } catch (e) { console.error("restore error", e) }
    }
    if (!profilesLoading && user) restore()
  }, [profilesLoading, user])

  /* ------------------------------- UI helpers ------------------------------- */
  const mainFilteredLocations = useMemo(() => {
    return US_LOCATIONS
      .filter((l) => `${l.city}, ${l.state}`.toLowerCase().includes(mainSearchQuery.toLowerCase()))
      .slice(0, 50)
  }, [mainSearchQuery])

  const handleMainLocationSelect = (location: string) => {
    setSelectedLocation(location)
    setMainLocationOpen(false)
    setMainSearchQuery("")
    setWeather(null)               // clear current weather
    fetchWeather(location)         // proactively fetch
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth")
    } catch (error) { console.error("Logout error:", error) }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  /* --------------------------------- Submit -------------------------------- */
  const handleSubmit = async (
    e: React.FormEvent & { isButtonClick?: boolean; skipErrorMessage?: boolean; target?: any },
    directMessage?: string  // Allow passing message directly to avoid state race condition
  ) => {
    e.preventDefault()
    
    // Use directMessage if provided (from quick action buttons), otherwise use input state
    const userMessage = (directMessage || input).trim()
    if (!userMessage || isLoading) return

    // Store the request for potential regeneration
    setLastRequest(userMessage)

    setInput("")
    setIsLoading(true)

    const newUserMessage = { id: Date.now().toString(), role: "user", content: String(userMessage || '') }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      const isButtonClick = e?.isButtonClick === true
      const lower = userMessage.toLowerCase()
      const isOutfitRequest = isButtonClick || /wear|outfit|recommend/.test(lower)

      if (isOutfitRequest) {
        // Enhanced occasion detection with child-specific occasions
        let occasion: string = "casual"
        
        // Child-specific occasions (check these first)
        if (/(school|class|classroom|learning|homework)/i.test(lower)) occasion = "school"
        else if (/(playground|park|playing outside|outdoor play)/i.test(lower)) occasion = "playground"
        else if (/(playdate|play date|friend.?s house|playing with friends)/i.test(lower)) occasion = "playdate"
        else if (/(birthday|bday|birthday party)/i.test(lower)) occasion = "birthday"
        // Adult occasions
        else if (/(work|office|business|professional|meeting|interview)/i.test(lower)) occasion = "work"
        else if (/(formal|elegant|gala|wedding|ceremony)/i.test(lower)) occasion = "formal"
        else if (/(party|club|night out|celebration|festive)/i.test(lower)) occasion = "party"
        else if (/(date|dinner|romantic|evening out)/i.test(lower)) occasion = "date"
        else if (/(weekend|relaxed|chill|laid-back|brunch)/i.test(lower)) occasion = "weekend"
        else if (/(workout|gym|exercise|sport|athletic|running|fitness|soccer|basketball|tennis)/i.test(lower)) occasion = "athletic"
        else if (/(beach|pool|summer|vacation|resort|swimming)/i.test(lower)) occasion = "beach"
        else if (/(weather|today|rain|cold|hot|sunny|warm|cool)/i.test(lower)) occasion = "weather-based"

        // profile - get full profile info for child detection
        let profileIdToUse = selectedProfile
        let profileInfo: { age?: number; relationship?: string; name?: string } = {}
        
        if (selectedProfile === "owner") {
          const ownerProfile = wardrobeProfiles.find((p) => p.relationship === "self")
          if (ownerProfile) {
            profileIdToUse = ownerProfile.id
            profileInfo = { age: ownerProfile.age, relationship: ownerProfile.relationship, name: ownerProfile.name }
          }
        } else if (selectedProfile !== "family") {
          const selectedProfileData = wardrobeProfiles.find((p) => p.id === selectedProfile)
          if (selectedProfileData) {
            profileInfo = { age: selectedProfileData.age, relationship: selectedProfileData.relationship, name: selectedProfileData.name }
          }
        }

        // Weather summary to send to API (FIXED)
        const weatherSummary =
          weatherLoading
            ? "Loading"
            : weather
              ? `${weather.temperature}°F ${weather.condition}`
              : "Weather unavailable"

        const startTime = Date.now()
        try {
          const response = await fetch('/api/outfit-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              occasion,
              weather: weatherSummary,
              profileId: profileIdToUse,
              profileAge: profileInfo.age,
              profileRelationship: profileInfo.relationship,
              profileName: profileInfo.name,
              location: selectedLocation,
            }),
          })
          if (!response.ok) throw new Error('Failed to get outfit recommendation')
          const recommendation = await response.json()
          if (!recommendation.items || recommendation.items.length === 0) throw new Error('No outfit items returned from API')

          const itemsWithColors = recommendation.items.map((it: any) => ({
            ...it,
            category: typeof it.category === 'object' ? (it.category?.name || 'No category') : (it.category || 'No category'),
            color: it.color ? it.color : "",
            _hex: colorForItemDot(it.color)
          }))

          const computedColorHarmony = analyzeColorHarmony(itemsWithColors)
          setCurrentOutfit({
            id: `outfit-${Date.now()}`,
            name: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Outfit`,
            items: itemsWithColors,
            occasion,
            weather_suitability: weatherSummary,
            style_notes: recommendation.reasoning,
            colorHarmony: computedColorHarmony,
          })
          // Clear previous outfit options when generating new outfit
          setOutfitOptions([])
          setShowMultipleOptions(false)
          setSelectedOptionIndex(0)
          
          // Smooth scroll to outfit display
          setTimeout(() => {
            outfitDisplayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)

          if (recommendation?.reasoning) {
            setMessages((prev) => [...prev, {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: `${recommendation.reasoning}\n\n**Weather:** ${weatherSummary}`
            }])
          }
        } catch (err) {
          console.error("Outfit recommendation error:", err)
          if (!e?.skipErrorMessage) {
            addMessage({
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: "I'm having trouble generating an outfit recommendation. Please try again or check your connection.",
            })
          }
        } finally {
          const elapsed = Date.now() - startTime
          const min = 1200
          if (elapsed < min) setTimeout(() => setIsLoading(false), min - elapsed)
          else setIsLoading(false)
        }
        return
      }

      // general chat path
      let profileIdToUse = selectedProfile
      if (selectedProfile === "owner") {
        const ownerProfile = wardrobeProfiles.find((p) => p.relationship === "self")
        if (ownerProfile) profileIdToUse = ownerProfile.id
      }

      let response: Response | null = null
      let retries = 3
      let delay = 800
      while (retries > 0) {
        try {
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, newUserMessage],
              profileId: profileIdToUse,
              weather: weather ? {
                temperature: weather.temperature,
                condition: weather.condition,
                description: weather.description,
                humidity: weather.humidity,
                windSpeed: weather.windSpeed,
                icon: weather.icon,
                location: weather.location,
              } : null,
              userId: user?.id,
              timestamp: Date.now(),
            }),
            cache: 'no-store',
          })
          break
        } catch (netErr) {
          console.error(`Network error during chat API call (${retries} left):`, netErr)
          retries--
          if (retries === 0) throw new Error('Failed to connect to the chat service after multiple attempts.')
          await new Promise((res) => setTimeout(res, delay))
          delay *= 2
        }
      }

      if (!response || !response.ok) {
        let msg = 'Failed to get AI response'
        try { msg += `: ${await response?.text()}` } catch {}
        throw new Error(msg)
      }

      let content = ''
      try {
        content = (await response.text())?.trim()
        if (!content) throw new Error('Empty response from chat service')
      } catch (readErr) {
        console.error('Error reading chat response:', readErr)
        throw new Error('Failed to read the AI response')
      }

      setMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), role: "assistant", content }])
      setIsLoading(false)
    } catch (error) {
      console.error("Chat error:", error)
      if (!e?.skipErrorMessage) {
        addMessage({ id: (Date.now() + 2).toString(), role: "assistant", content: "I'm sorry, I encountered an error. Please try again or check your connection." })
      }
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (message: string) => {
    if (message === "Pick a dress for me") message = "What should I wear today?"
    setInput(message)
    setLastRequest(message) // Store the request for regeneration
    try { window.localStorage.setItem('skipNextErrorMessage', 'true') } catch {}
    const fakeEvent = {
      preventDefault: () => {},
      isButtonClick: true,
      skipErrorMessage: true,
      target: { skipErrorMessage: true },
    } as unknown as React.FormEvent & { isButtonClick: boolean; skipErrorMessage: boolean; target: { skipErrorMessage: boolean } }
    // Pass message directly to avoid race condition with setInput state update
    await handleSubmit(fakeEvent, message)
    setTimeout(() => { try { window.localStorage.removeItem('skipNextErrorMessage') } catch {} }, 4000)
  }

  const handleSwapItem = (oldItem: any, newItem: any) => {
    if (!currentOutfit) return
    
    // Replace the old item with the new item in the outfit
    const updatedItems = currentOutfit.items.map((item: any) => 
      item.id === oldItem.id ? { ...newItem, _hex: colorForItemDot(newItem.color) } : item
    )
    
    // Recalculate color harmony with new items
    const computedColorHarmony = analyzeColorHarmony(updatedItems)
    
    // Update the outfit state
    setCurrentOutfit({
      ...currentOutfit,
      items: updatedItems,
      colorHarmony: computedColorHarmony,
    })
  }

  const getAlternativeItems = (currentItem: any) => {
    if (!currentWardrobeItems || currentWardrobeItems.length === 0) return []
    
    // Filter by same category and exclude current outfit items
    const currentOutfitIds = currentOutfit?.items?.map((item: any) => item.id) || []
    
    return currentWardrobeItems
      .filter((item: any) => {
        // Must be same category
        const sameCategory = item.category?.toLowerCase() === currentItem.category?.toLowerCase()
        // Must not be in current outfit
        const notInOutfit = !currentOutfitIds.includes(item.id)
        // Must not be the current item
        const notCurrentItem = item.id !== currentItem.id
        
        return sameCategory && notInOutfit && notCurrentItem
      })
      .sort((a: any, b: any) => {
        // Sort by least worn first
        const aWorn = a.worn_count || a.wear_count || 0
        const bWorn = b.worn_count || b.wear_count || 0
        return aWorn - bWorn
      })
      .slice(0, 6) // Limit to 6 alternatives
  }

  /* ----------------------------- Derived colors ---------------------------- */
  const uniqueItemColors = useMemo(() => {
    if (!currentOutfit?.items) return []
    const arr: { name: string; hex: string }[] = []
    for (const it of currentOutfit.items) {
      const hex = colorForItemDot(it?.color)
      const name = (String(it?.color || "").trim() || "color").toLowerCase()
      if (!arr.some((c) => c.hex === hex)) arr.push({ name, hex })
    }
    return arr.slice(0, 6)
  }, [currentOutfit])

  /* ----------------------------- Child Profile Detection ---------------------------- */
  const isChildProfileSelected = useMemo(() => {
    if (selectedProfile === "owner" || selectedProfile === "family") return false
    const profile = wardrobeProfiles.find(p => p.id === selectedProfile)
    if (!profile) return false
    
    const childRelationships = ['child', 'son', 'daughter', 'grandchild', 'kid', 'kids']
    const isChild = (profile.age && profile.age < 13) || 
                    (profile.relationship && childRelationships.includes(profile.relationship.toLowerCase()))
    return isChild
  }, [selectedProfile, wardrobeProfiles])

  const selectedProfileName = useMemo(() => {
    if (selectedProfile === "owner") return "you"
    if (selectedProfile === "family") return "family"
    const profile = wardrobeProfiles.find(p => p.id === selectedProfile)
    return profile?.name || "them"
  }, [selectedProfile, wardrobeProfiles])

  /* ---------------------------------- UI ---------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2 text-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar 
        navLinks={[
          { name: "AI Outfit Picker", href: "/chat" },
          { name: "Wardrobes", href: "/wardrobes" },
          { name: "Analytics", href: "/analytics" }
        ]}
        currentPath="/chat"
        onLogout={handleLogout}
        user={user}
        userEmail={user?.email}
        userInitial={user?.email?.[0]?.toUpperCase()}
        userName={user?.email?.split('@')[0]}
      />

      {/* Weather Ticker */}
      <div className="bg-primary px-6 py-2">
        <div className="overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm text-foreground font-medium">
            <span className="inline-block px-8">
              {selectedLocation}: {
                weatherLoading
                  ? "Loading weather..."
                  : weather
                    ? `${weather.temperature}°F, ${weather.condition}`
                    : "Weather unavailable"
              } | Humidity: {weather && typeof weather.humidity === "number" ? `${weather.humidity}%` : "-"} | Wind: {weather && typeof weather.windSpeed === "number" ? `${weather.windSpeed} mph` : "-"} | {getWeatherMessage(weather)}
            </span>
            <span className="inline-block px-8">{weather?.description || 'partly cloudy'}</span>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="bg-card">
        <div className="container mx-auto px-6 pt-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Location */}
            <div className="col-span-12 md:col-span-6">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground text-sm font-medium">Location</span>
              </div>
              <Popover open={mainLocationOpen} onOpenChange={setMainLocationOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-card border-border text-foreground hover:bg-muted">
                    {selectedLocation}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 bg-card border-border">
                  <Command className="bg-card">
                    <CommandInput placeholder="Search cities..." value={mainSearchQuery} onValueChange={setMainSearchQuery} className="text-foreground" />
                    <CommandEmpty className="text-muted-foreground p-4">No cities found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList className="max-h-60">
                        {mainFilteredLocations.map((l) => (
                          <CommandItem
                            key={`loc-${l.city}-${l.state}`}
                            value={`${l.city}, ${l.state}`}
                            onSelect={() => handleMainLocationSelect(`${l.city}, ${l.state}`)}
                            className="text-foreground hover:bg-muted cursor-pointer"
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedLocation === `${l.city}, ${l.state}` ? "opacity-100" : "opacity-0")} />
                            {l.city}, {l.state}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Wardrobe */}
            <div className="col-span-12 md:col-span-6">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground text-sm font-medium">Wardrobe</span>
              </div>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className="w-full bg-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {profilesLoading ? (
                    <SelectItem value="loading" className="text-muted-foreground" disabled>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading profiles...</span>
                      </div>
                    </SelectItem>
                  ) : wardrobeProfiles.length > 0 ? (
                    <>
                      {wardrobeProfiles.map((p) => (
                        <SelectItem key={p.id} value={p.relationship === "self" ? "owner" : p.id} className="text-foreground hover:bg-muted">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>
                              {String(p.name || 'Unknown')} {p.relationship === "self" ? " (You)" : ` (${String(p.relationship || 'Unknown')})`}
                              {p.age ? ` - ${String(p.age)} years` : ""}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="family" className="text-foreground hover:bg-muted">
                        <div className="flex items-center space-x-2"><Users className="w-4 h-4" /><span>All Family Members</span></div>
                      </SelectItem>
                    </>
                  ) : (
                    <SelectItem value="owner" className="text-foreground hover:bg-muted">
                      <div className="flex items-center space-x-2"><User className="w-4 h-4" /><span>My Wardrobe</span></div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Two Column Main */}
          <div className="grid grid-cols-12 gap-6 mt-4 pb-8">
            {/* Chat (left) */}
            <section className="col-span-12 lg:col-span-7">
              <div className="bg-background rounded-lg p-4 h-[72vh] flex flex-col">
                <div className="mb-2">
                  <p className="text-foreground/80 text-sm font-normal leading-relaxed">
                    {isChildProfileSelected 
                      ? `Hi! I'm here to help pick outfits for ${selectedProfileName}! 🌈 Tell me what ${selectedProfileName} is doing today and I'll suggest something cute and weather-appropriate.`
                      : "Hi! I'm your AI Outfit Picker. Tell me your plans and I'll suggest an outfit that matches the weather, occasion, and your wardrobe."
                    }
                  </p>
                </div>

                {/* Quick Filters */}
                {!isChildProfileSelected && (
                  <QuickFilters 
                    onFilterSelect={(occasion) => handleQuickAction(`Suggest an outfit for ${occasion}`)}
                    disabled={isLoading}
                  />
                )}

                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    {messages.map((m) => (
                      <div key={m.id} className="mb-3">
                        <div className={`${m.role === "user" ? "bg-primary text-foreground ml-auto max-w-md" : "bg-muted text-foreground max-w-2xl"} rounded-lg px-3 py-2 text-sm font-normal leading-relaxed`}>
                          {typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="bg-muted text-foreground max-w-2xl rounded-lg px-3 py-2 flex items-center space-x-2 text-sm font-normal">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {isChildProfileSelected ? (
                    <>
                      {/* Child-specific buttons */}
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction(`What should ${selectedProfileName} wear to school today?`)} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        🎒 School outfit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction(`Suggest a playground outfit for ${selectedProfileName}`)} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        🛝 Playground
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction(`What should ${selectedProfileName} wear to a playdate?`)} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        🧸 Playdate
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction(`What's good for ${selectedProfileName} in this weather?`)} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        🌤️ Weather outfit
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Adult buttons */}
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction("What should I wear today?")} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        What should I wear today?
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction("Suggest a work outfit")} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        Suggest a work outfit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction("Show me weekend casual looks")} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        Weekend casual
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction("What's good for this weather?")} className="bg-card border-border text-foreground/80 hover:bg-muted">
                        Weather outfit
                      </Button>
                    </>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me about outfits, styling, or wardrobe advice..."
                    className="flex-1 bg-card border-border text-foreground placeholder-slate-400 font-normal"
                    disabled={isLoading}
                  />
                  <VoiceInput 
                    onTranscript={(text) => {
                      setInput(text)
                      // Auto-submit after voice input
                      setTimeout(() => {
                        if (text.trim()) {
                          handleQuickAction(text)
                        }
                      }, 100)
                    }}
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </section>

            {/* Recommendation (right) */}
            <aside className="col-span-12 lg:col-span-5">
              <div className="bg-background rounded-lg p-4 h-[72vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-foreground text-sm font-semibold">Recommended Outfit</h3>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-normal">
                    <Cloud className="w-3 h-3" />
                    {selectedLocation}{
                      weatherLoading ? " | Loading..." : weather ? ` | ${weather.temperature}°F | ${weather.condition}` : ""
                    }
                  </span>
                </div>

                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full pr-2">
                    {isLoading && !currentOutfit ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="bg-card rounded-lg p-3">
                          <div className="flex gap-3">
                            <div className="w-28 h-28 bg-muted rounded-xl"></div>
                            <div className="w-28 h-28 bg-muted rounded-xl"></div>
                            <div className="w-28 h-28 bg-muted rounded-xl"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-16 bg-muted rounded-lg"></div>
                          <div className="h-16 bg-muted rounded-lg"></div>
                          <div className="h-16 bg-muted rounded-lg"></div>
                        </div>
                      </div>
                    ) : !currentOutfit ? (
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h4 className="text-foreground font-medium">No Outfit Selected</h4>
                        <p className="text-muted-foreground text-xs mt-1 font-normal leading-relaxed">Ask me to pick an outfit and I'll show you recommendations from your actual wardrobe items.</p>
                        <div className="space-y-2 mt-4">
                          <Button onClick={() => handleQuickAction("What should I wear today?")} className="bg-primary hover:bg-primary/90 w-full text-sm">
                            What should I wear today?
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                const response = await fetch("/api/add-sample-wardrobe", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ userId: user?.id }),
                                })
                                const result = await response.json()
                                if (result.success) alert(`Added ${result.items?.length || 0} sample wardrobe items!`)
                                else alert(`Error: ${result.error}`)
                              } catch { alert("Error adding sample items") }
                            }}
                            variant="outline"
                            className="bg-green-600 border-green-500 text-foreground hover:bg-green-700 w-full text-sm"
                          >
                            Add Sample Wardrobe Items
                          </Button>
                          <Link href="/add-clothes">
                            <Button variant="outline" className="bg-card border-border text-foreground hover:bg-muted w-full text-sm">
                              Add Items to Wardrobe
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div ref={outfitDisplayRef}>
                        {/* Reasoning */}
                        <p className="text-foreground/80 text-xs mb-3 font-normal leading-relaxed">{currentOutfit.style_notes}</p>

                        {/* Preview row */}
                        <div className="bg-card rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                            {Array.isArray(currentOutfit.items) && currentOutfit.items.map((item: any, idx: number) => (
                              <div key={`preview-${item.id || idx}`} className="relative shrink-0">
                                <div className="w-28 h-28 bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.image?.startsWith("http") ? item.image : `${typeof window !== 'undefined' ? window.location.origin : ""}${item.image}`}
                                    alt={item.name || "Clothing item"}
                                    className="w-full h-full object-cover"
                                    onError={(ev) => { (ev.target as HTMLImageElement).style.display = "none" }}
                                  />
                                  {!item.image && <Shirt className="w-7 h-7 text-muted-foreground" />}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-[3px] shadow-md">
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item._hex ?? colorForItemDot(item.color) }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <Button
                              onClick={() => handleQuickAction(lastRequest)}
                              className="bg-green-600 hover:bg-green-700 w-full text-xs"
                              disabled={isLoading}
                            >
                              {isLoading ? "Getting New..." : "New Outfit"}
                            </Button>
                            <Button
                              onClick={async () => {
                                setIsLoading(true)
                                try {
                                  // Determine occasion from last request or current outfit
                                  let occasion = 'casual'
                                  const requestLower = lastRequest.toLowerCase()
                                  if (requestLower.includes('work') || requestLower.includes('professional') || requestLower.includes('business')) {
                                    occasion = 'work'
                                  } else if (requestLower.includes('date') || requestLower.includes('dinner') || requestLower.includes('evening')) {
                                    occasion = 'date'
                                  } else if (requestLower.includes('workout') || requestLower.includes('gym') || requestLower.includes('athletic')) {
                                    occasion = 'workout'
                                  } else if (currentOutfit?.occasion) {
                                    occasion = currentOutfit.occasion
                                  }

                                  const recommendations = generateMultipleOutfits(
                                    currentWardrobeItems,
                                    {
                                      occasion,
                                      weather: weather ? { temperature: weather.temperature, condition: weather.condition } : undefined
                                    },
                                    3
                                  )
                                  
                                  // Convert OutfitRecommendation to Outfit format
                                  const options = recommendations.map((rec, idx) => ({
                                    id: `option-${Date.now()}-${idx}`,
                                    name: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Option ${idx + 1}`,
                                    items: rec.items.map((it: any) => ({
                                      ...it,
                                      category: typeof it.category === 'object' ? (it.category?.name || 'No category') : (it.category || 'No category'),
                                      _hex: colorForItemDot(it.color)
                                    })),
                                    occasion,
                                    weather_suitability: weather ? `${weather.temperature}°F, ${weather.condition}` : 'N/A',
                                    style_notes: rec.reasoning.join('. '),
                                    colorHarmony: rec.colorHarmony,
                                  }))
                                  
                                  setOutfitOptions(options)
                                  setShowMultipleOptions(true)
                                  setSelectedOptionIndex(0)
                                  if (options.length > 0) setCurrentOutfit(options[0])
                                } catch (e) {
                                  console.error('Error generating options:', e)
                                  alert('Could not generate outfit options')
                                } finally {
                                  setIsLoading(false)
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 w-full text-xs"
                              disabled={isLoading}
                            >
                              {isLoading ? "Loading..." : "Show 3 Options"}
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  if (!currentOutfit?.items) {
                                    alert("No outfit selected")
                                    return
                                  }

                                  // Save outfit to history and update wear counts via API
                                  const response = await fetch('/api/save-outfit-worn', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      outfit: {
                                        items: currentOutfit.items,
                                        weather: weather ? `${weather.temperature}°F, ${weather.condition}` : null,
                                        location: weather?.location || null,
                                        occasion: null
                                      },
                                      profileId: selectedProfile === "owner" ? null : selectedProfile,
                                      userId: user?.id
                                    })
                                  })

                                  const result = await response.json()
                                  
                                  if (response.ok) {
                                    alert("✅ Great choice! Outfit saved to your history and wear counts updated.")
                                    // Refresh wardrobe items to show updated wear counts
                                    const { data: refreshedItems } = await supabase
                                      .from('wardrobe_items')
                                      .select('*')
                                      .eq('profile_id', selectedProfile === "owner" ? user?.id : selectedProfile)
                                    if (refreshedItems) {
                                      setCurrentWardrobeItems(refreshedItems)
                                    }
                                  } else {
                                    throw new Error(result.error || 'Failed to save outfit')
                                  }
                                } catch (e) {
                                  console.error("Error saving outfit:", e)
                                  alert("❌ Failed to save outfit. Please try again.")
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700 w-full text-xs"
                            >
                              I'll Wear This
                            </Button>
                          </div>

                          {/* Try On Button */}
                          <div className="mt-2">
                            <Button
                              onClick={() => {
                                // Save outfit to localStorage for Try-On page
                                if (currentOutfit?.items) {
                                  localStorage.setItem('tryOnOutfit', JSON.stringify(currentOutfit.items))
                                  // Navigate to Try-On page
                                  const profileParam = selectedProfile === "owner" ? "owner" : selectedProfile
                                  const weatherInfo = weather ? `${weather.temperature}°F · ${weather.condition}` : "Unknown"
                                  router.push(`/try-on?profileId=${profileParam}&location=${encodeURIComponent(selectedLocation)}&weather=${encodeURIComponent(weatherInfo)}`)
                                }
                              }}
                              className="bg-cyan-600 hover:bg-cyan-700 w-full text-xs"
                              disabled={!currentOutfit?.items || currentOutfit.items.length === 0}
                            >
                              🧍 Try This Outfit On
                            </Button>
                          </div>

                          {/* Download Outfit Report */}
                          <div className="mt-2">
                            <Button
                              onClick={async () => {
                                const { downloadOutfitReport } = await import('@/lib/downloadOutfitReport')
                                downloadOutfitReport(currentOutfit, weather, selectedLocation)
                              }}
                              className="bg-green-600 hover:bg-green-700 w-full text-xs"
                              disabled={!currentOutfit?.items || currentOutfit.items.length === 0}
                            >
                              📥 Download Outfit Report
                            </Button>
                          </div>

                          {/* Outfit Options Display */}
                          {outfitOptions.length > 0 && (
                            <div className="mt-4">
                              <OutfitOptions
                                options={outfitOptions}
                                selectedIndex={selectedOptionIndex}
                                onSelect={(index) => {
                                  setSelectedOptionIndex(index)
                                  setCurrentOutfit(outfitOptions[index])
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Items list */}
                        <div className="space-y-2 mb-3">
                          {Array.isArray(currentOutfit.items) && currentOutfit.items.map((item: any, index: number) => (
                            <div
                              key={item.id || `item-${index}`}
                              className="bg-card rounded-lg p-2 flex items-center gap-3 hover:bg-muted transition-colors cursor-pointer relative"
                              onClick={() => {
                                const profileParam = selectedProfile === "owner" ? wardrobeProfiles.find((p) => p.relationship === "self")?.id : selectedProfile
                                const match = currentWardrobeItems.find((wi) => wi.name.toLowerCase().includes(String(item.name).toLowerCase()) || String(item.name).toLowerCase().includes(wi.name.toLowerCase()))
                                if (match) router.push(`/wardrobe?profile=${profileParam}&item=${match.id}&from=chat&highlight=${match.name}`)
                                else router.push(`/wardrobe?profile=${profileParam}&from=chat&search=${encodeURIComponent(item.name)}`)
                              }}
                            >
                              <div onClick={(e) => e.stopPropagation()}>
                                <SwapItemButton
                                  currentItem={item}
                                  alternativeItems={getAlternativeItems(item)}
                                  onSwap={(newItem) => handleSwapItem(item, newItem)}
                                />
                              </div>
                              <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.image?.startsWith("http") ? item.image : `${typeof window !== 'undefined' ? window.location.origin : ""}${item.image}`}
                                  alt={item.name || 'item'}
                                  className="w-full h-full object-cover"
                                  onError={(ev) => { (ev.target as HTMLImageElement).style.display = "none" }}
                                />
                                {!item.image && <Shirt className="w-5 h-5 text-muted-foreground" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-foreground text-xs font-medium leading-tight">{item.name || 'Unknown Item'}</p>
                                <p className="text-muted-foreground text-[11px] font-normal">{typeof item.category === 'object' ? (item.category?.name || 'No category') : (item.category || 'No category')}</p>
                                {typeof item.wear_count === 'number' && (
                                  <p className="text-yellow-400 text-[11px] flex items-center gap-1 font-normal">
                                    <Star className="w-3 h-3" /> Worn {item.wear_count} times
                                  </p>
                                )}
                              </div>
                              <div className="w-3 h-3 rounded-full" title={String(item.color || '').toUpperCase()} style={{ backgroundColor: item._hex ?? colorForItemDot(item.color) }} />
                            </div>
                          ))}
                        </div>

                        {/* Weather & Occasion */}
                        <div className="text-left space-y-1 mb-3">
                          <div className="flex items-center text-[11px]">
                            <Cloud className="w-3 h-3 text-muted-foreground mr-2" />
                            <span className="text-foreground/80">
                              {typeof currentOutfit.weather_suitability === 'string' ? currentOutfit.weather_suitability : 'Any weather'}
                            </span>
                          </div>
                          <div className="flex items-center text-[11px]">
                            <User className="w-3 h-3 text-muted-foreground mr-2" />
                            <span className="text-foreground/80 capitalize">
                              {typeof currentOutfit.occasion === 'string' ? currentOutfit.occasion : 'casual'}
                            </span>
                          </div>
                        </div>

                        {/* Color Harmony */}
                        <div className="bg-card rounded-lg p-3">
                          <h5 className="text-foreground text-sm font-medium flex items-center gap-2 mb-2">
                            <Palette className="w-4 h-4" /> Color Harmony
                          </h5>

                          <div className="flex gap-2 mb-2">
                            {uniqueItemColors.length === 0 ? (
                              <span className="text-muted-foreground text-xs">No colors detected.</span>
                            ) : uniqueItemColors.map((c, i) => (
                              <div key={i} className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                                <span className="text-[10px] text-muted-foreground mt-1">{c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name}</span>
                              </div>
                            ))}
                          </div>

                          {currentOutfit.colorHarmony && (
                            <>
                              <p className="text-foreground/80 text-xs mb-1">{currentOutfit.colorHarmony.harmonyType}</p>
                              <p className="text-muted-foreground text-[11px]">{currentOutfit.colorHarmony.explanation}</p>

                              <div className="space-y-2 mt-3">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-foreground/80 text-[11px]">
                                    <span className="text-yellow-400 font-medium">Why This Works</span><br />
                                    {currentOutfit.colorHarmony.styleNotes}
                                  </p>
                                </div>
                                {currentOutfit.colorHarmony.weatherMatch && (
                                  <div className="flex items-start gap-2">
                                    <Thermometer className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                                    <p className="text-foreground/80 text-[11px]">
                                      <span className="text-primary font-medium">Weather Match</span><br />
                                      {currentOutfit.colorHarmony.weatherMatch}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Outfit Rating */}
                        {currentOutfit && (
                          <div className="mt-3">
                            <OutfitRating
                              outfitId={currentOutfit.id || `outfit-${Date.now()}`}
                              userId={user?.id}
                              onRatingChange={(rating) => {
                                console.log('Outfit rated:', rating)
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
