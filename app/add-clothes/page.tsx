"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft, Baby, Briefcase, Calendar, Check, Cloud, CloudRain, DollarSign, GraduationCap,
  Loader2, Shirt, Shield, Snowflake, Sparkles, Sun, Upload, User, Wind, X, Zap
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { wardrobeService, wardrobeProfileService, type WardrobeProfile, type Category } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Navbar } from "@/components/ui/navbar"

// ---------------------------------- Constants ----------------------------------

const CONDITIONS = [
  { value: "new", label: "New with tags" },
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
] as const

const COLORS = [
  "black","white","blue","red","pink","gray","green","yellow","purple","brown","orange","navy","beige","cream","maroon",
] as const

const WEATHER_CONDITIONS = [
  { value: "hot", label: "Hot weather", icon: Sun },
  { value: "cold", label: "Cold weather", icon: Snowflake },
  { value: "rainy", label: "Rainy weather", icon: CloudRain },
  { value: "windy", label: "Windy weather", icon: Wind },
  { value: "mild", label: "Mild weather", icon: Cloud },
] as const

const SEASONS = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall/Autumn" },
  { value: "winter", label: "Winter" },
] as const

const ENHANCED_SAFETY_FEATURES = [
  { value: "reflective", label: "🔆 Reflective strips" },
  { value: "bright_colors", label: "🌈 Bright/visible colors" },
  { value: "non_slip", label: "👟 Non-slip soles" },
  { value: "soft_materials", label: "🧸 Soft materials" },
  { value: "no_small_parts", label: "🔒 No small parts" },
  { value: "flame_resistant", label: "🔥 Flame resistant" },
  { value: "easy_fasteners", label: "✨ Easy fasteners (velcro, snaps)" },
  { value: "machine_washable", label: "🧺 Machine washable" },
  { value: "hypoallergenic", label: "🌿 Hypoallergenic materials" },
  { value: "uv_protection", label: "☀️ UV protection" },
  { value: "breathable_fabric", label: "💨 Breathable fabric" },
  { value: "reinforced_knees", label: "💪 Reinforced knees/elbows" },
  { value: "rounded_edges", label: "🔄 Rounded edges/no sharp parts" },
  { value: "secure_buttons", label: "🔘 Secure buttons/no choking hazards" },
  { value: "tag_free", label: "🏷️ Tag-free or soft tags" },
  { value: "lead_free", label: "✅ Lead-free materials" },
] as const

// ---------------------------------- Types ----------------------------------

type ColorValue = typeof COLORS[number]
type ConditionValue = typeof CONDITIONS[number]["value"]
type WeatherValue = typeof WEATHER_CONDITIONS[number]["value"]
type SeasonValue = typeof SEASONS[number]["value"]
type SafetyValue = typeof ENHANCED_SAFETY_FEATURES[number]["value"]

type DraftStatus = "idle" | "uploading" | "analyzing" | "ready" | "saving" | "saved" | "error"

interface DraftFields {
  name: string
  description: string
  brand?: string
  color?: ColorValue | ""
  size?: string
  price?: string
  purchaseDate?: string
  categoryId?: string // DB UUID
  condition: ConditionValue
  timesWorn?: string
  weatherSuitability: WeatherValue[]
  seasonalUse: SeasonValue[]
  occasions: string[]
  schoolCompliant?: boolean
  workAppropriate?: boolean
  hasGrowthRoom?: boolean
  safetyFeatures: SafetyValue[]
  careInstructions?: string
}

interface DraftItem {
  id: string
  file: File
  preview: string
  storageUrl?: string
  storagePath?: string
  status: DraftStatus
  error?: string
  fields: DraftFields
  selected: boolean
  ai?: any
}

// ---------------------------------- Helpers ----------------------------------

const createId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

const synonyms: Record<string, string[]> = {
  outerwear: ["jacket","coat","hoodie","parka","windbreaker"],
  shoes: ["sneakers","boots","heels","sandals"],
  tops: ["t-shirt","tee","shirt","blouse","sweatshirt","sweater"],
  bottoms: ["pants","trousers","jeans","shorts","skirt"],
  dresses: ["dress","gown"],
  activewear: ["gym","workout","running","yoga"],
  uniform: ["school uniform"],
}

const normalize = (s?: string) => (s || "").toLowerCase().trim()

function mapToKnownCategory(name: string | undefined, categories: Category[]): string | undefined {
  if (!name || categories.length === 0) return undefined
  const needle = normalize(name)
  const exact = categories.find((c) => normalize(c.name) === needle)
  if (exact) return exact.id
  const inc = categories.find((c) => normalize(c.name).includes(needle) || needle.includes(normalize(c.name)))
  if (inc) return inc.id
  for (const [canonical, syns] of Object.entries(synonyms)) {
    if (syns.some((s) => needle.includes(s))) {
      const found = categories.find((c) => normalize(c.name) === canonical)
      if (found) return found.id
    }
  }
  return undefined
}

function mapToKnownColor(raw?: string): ColorValue | "" {
  const n = normalize(raw)
  if (!n) return ""
  const direct = COLORS.find((c) => c === n)
  if (direct) return direct
  if (n.includes("navy")) return "navy"
  if (n.includes("beige")) return "beige"
  if (n.includes("grey") || n.includes("gray")) return "gray"
  if (n.includes("maroon")) return "maroon"
  if (n.includes("cream")) return "cream"
  if (n.includes("green")) return "green"
  if (n.includes("blue")) return "blue"
  if (n.includes("red")) return "red"
  if (n.includes("pink")) return "pink"
  if (n.includes("purple")) return "purple"
  if (n.includes("brown")) return "brown"
  if (n.includes("orange")) return "orange"
  if (n.includes("yellow")) return "yellow"
  if (n.includes("black")) return "black"
  if (n.includes("white")) return "white"
  return ""
}

function isChildProfile(profile: WardrobeProfile | null) {
  if (!profile?.relation) return !!profile?.age && profile.age < 13
  const rel = normalize(profile.relation)
  return ["child", "son", "daughter", "grandchild"].includes(rel) || (!!profile.age && profile.age < 13)
}

function ageCategory(profile: WardrobeProfile | null) {
  if (!profile?.age) return isChildProfile(profile) ? "Child" : "Adult"
  if (profile.age < 5) return "Toddler"
  if (profile.age < 13) return "Child"
  if (profile.age < 18) return "Teen"
  return "Adult"
}

function buildDescription(fields: DraftFields, profile: WardrobeProfile | null) {
  const parts: string[] = []
  if (fields.description) parts.push(fields.description.trim())
  if (fields.weatherSuitability.length) parts.push(`Weather: ${fields.weatherSuitability.join(", ")}`)
  if (fields.seasonalUse.length) parts.push(`Seasons: ${fields.seasonalUse.join(", ")}`)
  if (fields.occasions.length) parts.push(`Occasions: ${fields.occasions.join(", ")}`)
  if (profile?.age !== undefined) parts.push(`Age-appropriate for: ${ageCategory(profile)} (${profile.age} years old)`)
  if (fields.schoolCompliant) parts.push("School dress code compliant")
  if (fields.workAppropriate) parts.push("Work appropriate")
  if (fields.hasGrowthRoom) parts.push("Has room for growth")
  if (fields.safetyFeatures.length) parts.push(`Safety features: ${fields.safetyFeatures.join(", ")}`)
  if (fields.careInstructions) parts.push(`Care: ${fields.careInstructions}`)
  return parts.join("\n")
}

// Timeout + abort for fetch
async function fetchJsonWithTimeout(input: RequestInfo, init: RequestInit = {}, ms = 30000) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

// Ensure cards don't remain in "analyzing"
function finalizeAnalyzingToError(setter: React.Dispatch<React.SetStateAction<DraftItem[]>>) {
  setter((ds) =>
    ds.map((d) => (d.status === "analyzing" ? { ...d, status: "error", error: "Analysis failed or timed out" } : d)),
  )
}

// ---------------------------------- Component ----------------------------------

type Mode = "single" | "bulk"

export default function AddClothesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = searchParams.get("profile") || undefined
  const { user } = useAuth()
  const { toast } = useToast()

  const [mode, setMode] = useState<Mode>("single")

  const [currentProfile, setCurrentProfile] = useState<WardrobeProfile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const isKids = isChildProfile(currentProfile)

  // ----- SINGLE form state -----
  const [singlePreview, setSinglePreview] = useState<string | null>(null)
  const [singleImage, setSingleImage] = useState<File | null>(null)
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleAnalyzing, setSingleAnalyzing] = useState(false)
  const [single, setSingle] = useState<DraftFields>({
    name: "", description: "", color: "", condition: "good",
    weatherSuitability: [], seasonalUse: [], occasions: [], safetyFeatures: [],
  })

  // ----- BULK state -----
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [globalProgress, setGlobalProgress] = useState({ total: 0, done: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const singleFileRef = useRef<HTMLInputElement>(null)

  // Load profile + categories
  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        const cats = (await wardrobeService.getCategories()) || []
        setCategories(cats)
        if (profileId) {
          const profiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
          setCurrentProfile(profiles?.find((p) => p.id === profileId) || null)
        }
      } catch (e) {
        console.error(e)
        toast({ title: "Error", description: "Failed to load categories/profile.", variant: "destructive" })
      }
    }
    load()
  }, [user, profileId, toast])

  // --------------- MODE SWITCH ---------------
  const TabButton = ({ value, children }: { value: Mode; children: React.ReactNode }) => (
    <Button
      variant={mode === value ? "default" : "outline"}
      className={mode === value ? "bg-white text-black" : "border-border text-foreground"}
      onClick={() => setMode(value)}
    >
      {children}
    </Button>
  )

  // ---------------- SINGLE handlers ----------------
  const onSinglePick = (f?: File) => {
    if (!f) return
    setSingleImage(f)
    setSinglePreview(URL.createObjectURL(f))
  }

  const analyzeSingle = async () => {
    if (!singleImage) return
    setSingleAnalyzing(true)
    try {
      const fd = new FormData()
      fd.append("image", singleImage)
      if (profileId) fd.append("profileId", String(profileId))
      const res = await fetchJsonWithTimeout("/api/analyze-image", { method: "POST", body: fd }, 60000)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const a = data?.analysis || {}
      setSingle((prev) => ({
        ...prev,
        name: a.name || prev.name,
        description: a.description || prev.description,
        color: mapToKnownColor(a.color) || prev.color,
        categoryId: mapToKnownCategory(a.category, categories) || prev.categoryId,
        weatherSuitability: Array.isArray(a.weatherSuitability) ? a.weatherSuitability.filter((x: string) => WEATHER_CONDITIONS.some(w => w.value === x)) : prev.weatherSuitability,
        seasonalUse: Array.isArray(a.seasonalUse) ? a.seasonalUse.filter((x: string) => SEASONS.some(s => s.value === x)) : prev.seasonalUse,
        occasions: Array.isArray(a.occasions) ? a.occasions : prev.occasions,
        ...(isKids && { schoolCompliant: true, hasGrowthRoom: true, safetyFeatures: ["soft_materials","machine_washable","breathable_fabric","tag_free"] }),
      }))
    } catch (e: any) {
      toast({ title: "Analysis error", description: e?.message || "Could not analyze image.", variant: "destructive" })
    } finally {
      setSingleAnalyzing(false)
    }
  }

  const saveSingle = async () => {
    if (!user) return
    if (!single.name?.trim()) { toast({ title: "Missing name", description: "Please enter an item name." }); return }
    if (!single.categoryId) { toast({ title: "Missing category", description: "Please select a category." }); return }

    setSingleLoading(true)
    try {
      const payload = {
        user_id: user.id,
        name: single.name.trim(),
        description: buildDescription(single, currentProfile),
        brand: single.brand || undefined,
        color: single.color || undefined,
        size: single.size || undefined,
        price: single.price ? parseFloat(single.price) : undefined,
        purchase_date: single.purchaseDate || undefined,
        category_id: single.categoryId,
        condition: single.condition,
        wear_count: single.timesWorn ? parseInt(single.timesWorn) || 0 : 0,
        wardrobe_profile_id: profileId,
      }
      const saved = await wardrobeService.addWardrobeItem(payload)

      if (singleImage) {
        const { url, path } = await wardrobeService.uploadImage(singleImage, user.id, saved.id)
        await wardrobeService.updateWardrobeItem(saved.id, { image_url: url, image_path: path })
      }

      toast({ title: "Item added", description: `"${single.name}" saved to wardrobe.` })
      // reset
      setSingle({
        name: "", description: "", color: "", condition: "good",
        weatherSuitability: [], seasonalUse: [], occasions: [], safetyFeatures: [],
      })
      setSingleImage(null); setSinglePreview(null)
      singleFileRef.current?.value && (singleFileRef.current.value = "")
    } catch (e: any) {
      toast({ title: "Save error", description: e?.message || "Failed to add item.", variant: "destructive" })
    } finally {
      setSingleLoading(false)
    }
  }

  // ---------------- BULK handlers ----------------
  const onBulkPick = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (imgs.length === 0) return
    const remainingSlots = Math.max(0, 5 - drafts.length)
    const take = imgs.slice(0, remainingSlots)
    if (imgs.length > remainingSlots) {
      toast({ title: "Limit reached", description: "You can upload up to 5 images at a time.", variant: "default" })
    }
    const newDrafts: DraftItem[] = take.map((file) => ({
      id: createId(), file, preview: URL.createObjectURL(file), status: "idle", selected: true,
      fields: { name: "", description: "", color: "", condition: "good", weatherSuitability: [], seasonalUse: [], occasions: [], safetyFeatures: [] },
    }))
    setDrafts((d) => [...d, ...newDrafts])
    // Reset file input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const patchDraft = (id: string, patch: Partial<DraftItem>) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch, fields: { ...d.fields, ...(patch as any).fields } } : d)))

  const setField = <K extends keyof DraftFields>(id: string, key: K, value: DraftFields[K]) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, fields: { ...d.fields, [key]: value } } : d)))

  const toggleSelect = (id: string, v?: boolean) =>
    setDrafts((ds) => ds.map((d) => (d.id === id ? { ...d, selected: v ?? !d.selected } : d)))

  const removeDraft = (id: string) => setDrafts((ds) => ds.filter((d) => d.id !== id))

  const selectedDrafts = useMemo(() => drafts.filter((d) => d.selected), [drafts])

  const analyzeSelected = async () => {
    if (!user) return
    const workNow = drafts.filter((d) => d.selected && d.status !== "saved")
    if (workNow.length === 0) return

    setAnalyzing(true)
    setGlobalProgress({ total: workNow.length, done: 0 })

    // 1) Upload for storage + show progress
    const uploaded: { id: string; url?: string; path?: string }[] = []
    for (const d of workNow) {
      patchDraft(d.id, { status: "uploading", error: undefined })
      try {
        const { url, path } = await wardrobeService.uploadImage(d.file, user.id, undefined)
        uploaded.push({ id: d.id, url, path })
        patchDraft(d.id, { storageUrl: url, storagePath: path, status: "analyzing" })
      } catch (e: any) {
        patchDraft(d.id, { status: "error", error: e?.message || "Upload failed" })
        setGlobalProgress((p) => ({ ...p, done: p.done + 1 }))
      }
    }

    const toAnalyze = uploaded.filter((u) => !!u.url)
    if (toAnalyze.length === 0) { setAnalyzing(false); return }

    // 2) Best-effort batch by URL (may fail on private buckets)
    let batch: any[] | null = null
    try {
      const res = await fetchJsonWithTimeout(
        "/api/analyze-images",
        { method: "POST", headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ images: toAnalyze.map((x) => x.url), profileId }) },
        60000,
      )
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.analyses)) batch = data.analyses
      }
    } catch { /* ignore, fallback below */ }

    // 3) Ensure each item gets analyzed; fallback sends *File bytes*
    const results: any[] = new Array(toAnalyze.length)
    for (let i = 0; i < toAnalyze.length; i++) {
      const a = batch?.[i]
      const meaningful = !!(a?.name || a?.category || a?.color || (Array.isArray(a?.weatherSuitability) && a.weatherSuitability.length))
      if (meaningful) { results[i] = a; continue }

      const row = toAnalyze[i]
      const draft = workNow.find((d) => d.id === row.id)
      try {
        const fd = new FormData()
        if (draft?.file) fd.append("image", draft.file, draft.file.name) // **critical: send bytes**
        if (profileId) fd.append("profileId", String(profileId))

        const r = await fetchJsonWithTimeout("/api/analyze-image", { method: "POST", body: fd }, 45000)
        const j = await r.json().catch(() => ({}))
        results[i] = j?.analysis || {}
      } catch {
        results[i] = {}
      }
    }

    // 4) Merge results → card state
    toAnalyze.forEach((u, i) => {
      const a = results[i] || {}
      const mappedCategoryId = mapToKnownCategory(a.category, categories)
      const mappedColor = mapToKnownColor(a.color)
      const weather: WeatherValue[] = Array.isArray(a.weatherSuitability)
        ? a.weatherSuitability.filter((x: string) => WEATHER_CONDITIONS.some((w) => w.value === x))
        : []
      const seasons: SeasonValue[] = Array.isArray(a.seasonalUse)
        ? a.seasonalUse.filter((x: string) => SEASONS.some((s) => s.value === x))
        : []
      const occasions: string[] = Array.isArray(a.occasions) ? a.occasions : []

      const hasMeaningful = !!(a?.name || mappedCategoryId || mappedColor || weather.length || seasons.length || occasions.length)

      const prev = drafts.find((d) => d.id === u.id)
      patchDraft(u.id, {
        status: hasMeaningful ? "ready" : "error",
        error: hasMeaningful ? undefined : "No attributes detected",
        ai: a,
        fields: hasMeaningful
          ? {
              ...prev?.fields!,
              name: a.name || prev?.fields.name || "",
              description: a.description || prev?.fields.description || "",
              color: mappedColor || prev?.fields.color || "",
              categoryId: mappedCategoryId || prev?.fields.categoryId,
              weatherSuitability: weather,
              seasonalUse: seasons,
              occasions,
              ...(isKids && {
                schoolCompliant: true,
                hasGrowthRoom: true,
                safetyFeatures: ["soft_materials", "machine_washable", "breathable_fabric", "tag_free"],
              }),
            }
          : prev?.fields!,
      })

      setGlobalProgress((p) => ({ ...p, done: Math.min(p.total, p.done + 1) }))
    })

    finalizeAnalyzingToError(setDrafts)
    setAnalyzing(false)
  }

  const saveAll = async () => {
    if (!user) return
    const toSave = drafts.filter((d) => d.status === "ready")
    if (!toSave.length) return
    setSaving(true)
    setGlobalProgress({ total: toSave.length, done: 0 })

    for (const d of toSave) {
      patchDraft(d.id, { status: "saving", error: undefined })
      try {
        const payload = {
          user_id: user.id,
          name: d.fields.name?.trim() || "Untitled Item",
          description: buildDescription(d.fields, currentProfile),
          brand: d.fields.brand || undefined,
          color: d.fields.color || undefined,
          size: d.fields.size || undefined,
          price: d.fields.price ? parseFloat(d.fields.price) : undefined,
          purchase_date: d.fields.purchaseDate || undefined,
          category_id: d.fields.categoryId,
          condition: d.fields.condition,
          wear_count: d.fields.timesWorn ? parseInt(d.fields.timesWorn) || 0 : 0,
          wardrobe_profile_id: profileId,
        }
        if (!payload.category_id) throw new Error("Missing category. Pick a category before saving.")

        const saved = await wardrobeService.addWardrobeItem(payload)
        if (d.storageUrl && d.storagePath) {
          await wardrobeService.updateWardrobeItem(saved.id, { image_url: d.storageUrl, image_path: d.storagePath })
        }
        patchDraft(d.id, { status: "saved" })
      } catch (e: any) {
        patchDraft(d.id, { status: "error", error: e?.message || "Save failed" })
      } finally {
        setGlobalProgress((p) => ({ ...p, done: p.done + 1 }))
      }
    }

    setSaving(false)
    const ok = drafts.filter((d) => d.status === "saved").length
    if (ok) toast({ title: "Items added", description: `${ok} item${ok > 1 ? "s" : ""} saved.` })
  }

  // ---------------------------------- UI ----------------------------------

  const AgeIcon = () => {
    if (isKids) return <Baby className="w-5 h-5" />
    if (!currentProfile?.age) return <User className="w-5 h-5" />
    if (currentProfile.age < 5) return <Baby className="w-5 h-5" />
    if (currentProfile.age < 18) return <GraduationCap className="w-5 h-5" />
    return <Briefcase className="w-5 h-5" />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background grid place-items-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to add clothes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Nav */}
      <Navbar 
        navLinks={[
          { name: "AI Outfit Picker", href: "/chat" },
          { name: "Wardrobes", href: "/wardrobes" },
          { name: "Weather Essentials", href: "/weather-essentials" },
          { name: "Lifecycle Alerts", href: "/lifecycle-alerts" }
        ]}
        currentPath="/add-clothes"
        onLogout={handleLogout}
        user={user}
        userEmail={user?.email}
        userInitial={user?.email?.[0]?.toUpperCase()}
        userName={user?.email?.split('@')[0]}
      />

      {/* Mode Switch */}
      <div className="container mx-auto px-6 pt-6">
        <div className="flex items-center gap-2">
          <TabButton value="single">Single upload</TabButton>
          <TabButton value="bulk">Bulk upload (max 5)</TabButton>
        </div>
      </div>

      {/* SINGLE MODE */}
      {mode === "single" && (
        <div className="container mx-auto px-6 py-6 max-w-4xl">
          <Card className="bg-card/70 border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Item Image</CardTitle>
            </CardHeader>
            <CardContent>
              {singlePreview ? (
                <div className="relative">
                  <img src={singlePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg border-2 border-border" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setSingleImage(null); setSinglePreview(null); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-muted/80 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground/80 mb-2">Upload an image of your clothing item</p>
                  <input ref={singleFileRef} type="file" accept="image/*" onChange={(e)=> e.target.files && onSinglePick(e.target.files[0])} className="hidden" id="single-file" />
                  <Button className="bg-white hover:bg-gray-200 text-black" onClick={() => singleFileRef.current?.click()}>Choose Image</Button>
                </div>
              )}

              {singlePreview && (
                <div className="mt-4 flex items-center gap-3">
                  <Button variant="secondary" onClick={analyzeSingle} disabled={singleAnalyzing} className="bg-gray-200/20 text-foreground hover:bg-gray-200/30 border border-border">
                    {singleAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Let AI fill details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic fields */}
          <Card className="mt-6 bg-card/70 border-border">
            <CardHeader><CardTitle className="text-foreground">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-foreground/80">Item Name *</Label>
                <Input className="mt-1 bg-muted border-border text-foreground" value={single.name} onChange={(e)=>setSingle({...single, name:e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/80">Category *</Label>
                  <Select value={single.categoryId} onValueChange={(v)=>setSingle({...single, categoryId:v})}>
                    <SelectTrigger className="mt-1 bg-muted border-border text-foreground"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent className="bg-card text-foreground border-border">
                      {categories.map((c)=> <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground/80">Color</Label>
                  <Select value={single.color} onValueChange={(v)=>setSingle({...single, color: v as ColorValue})}>
                    <SelectTrigger className="mt-1 bg-muted border-border text-foreground"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-card text-foreground border-border">
                      {COLORS.map((c)=> <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/80">Size</Label>
                  <Input className="mt-1 bg-muted border-border text-foreground" value={single.size || ""} onChange={(e)=>setSingle({...single, size:e.target.value})}/>
                </div>
                <div>
                  <Label className="text-foreground/80">Condition</Label>
                  <Select value={single.condition} onValueChange={(v)=>setSingle({...single, condition:v as ConditionValue})}>
                    <SelectTrigger className="mt-1 bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card text-foreground border-border">
                      {CONDITIONS.map((c)=> <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Weather/Season quick tags */}
              <div className="grid grid-cols-2 gap-2">
                {WEATHER_CONDITIONS.map((w)=>(
                  <label key={`single-w-${w.value}`} className="flex items-center gap-2">
                    <Checkbox checked={single.weatherSuitability.includes(w.value)}
                      onCheckedChange={(c)=>{ const next=new Set(single.weatherSuitability); c?next.add(w.value):next.delete(w.value); setSingle({...single, weatherSuitability: Array.from(next) as WeatherValue[]}) }} />
                    <span className="text-foreground/80 text-xs flex items-center gap-1"><w.icon className="w-3 h-3" />{w.label}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SEASONS.map((s)=>(
                  <label key={`single-s-${s.value}`} className="flex items-center gap-2">
                    <Checkbox checked={single.seasonalUse.includes(s.value)}
                      onCheckedChange={(c)=>{ const next=new Set(single.seasonalUse); c?next.add(s.value):next.delete(s.value); setSingle({...single, seasonalUse: Array.from(next) as SeasonValue[]}) }} />
                    <span className="text-foreground/80 text-xs">{s.label}</span>
                  </label>
                ))}
              </div>

              {/* Kids vs Adults: SPECIAL UI for children */}
              {isKids ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!single.schoolCompliant} onCheckedChange={(c)=>setSingle({...single, schoolCompliant: c===true})} />
                    <span className="text-foreground/80 text-sm flex items-center gap-1"><GraduationCap className="w-3 h-3" /> School compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={!!single.hasGrowthRoom} onCheckedChange={(c)=>setSingle({...single, hasGrowthRoom: c===true})} />
                    <span className="text-foreground/80 text-sm flex items-center gap-1"><Zap className="w-3 h-3" /> Room to grow</span>
                  </div>
                  <Card className="bg-background/40 border-green-700/40">
                    <CardHeader className="py-2"><CardTitle className="text-foreground text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Safety features</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 gap-1">
                      {ENHANCED_SAFETY_FEATURES.map((sf)=>(
                        <label key={`single-sf-${sf.value}`} className="flex items-center gap-2">
                          <Checkbox checked={single.safetyFeatures.includes(sf.value)}
                            onCheckedChange={(c)=>{ const next=new Set(single.safetyFeatures); c?next.add(sf.value):next.delete(sf.value); setSingle({...single, safetyFeatures: Array.from(next) as SafetyValue[]}) }} />
                          <span className="text-foreground/80 text-xs">{sf.label}</span>
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                  <div>
                    <Label className="text-foreground/80">Care Instructions</Label>
                    <Textarea rows={2} className="mt-1 bg-muted border-border text-foreground" value={single.careInstructions || ""} onChange={(e)=>setSingle({...single, careInstructions:e.target.value})} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Checkbox checked={!!single.workAppropriate} onCheckedChange={(c)=>setSingle({...single, workAppropriate: c===true})} />
                  <span className="text-foreground/80 text-sm flex items-center gap-1"><Briefcase className="w-3 h-3" /> Work appropriate</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/80">Price</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="number" step="0.01" className="pl-10 bg-muted border-border text-foreground" value={single.price || ""} onChange={(e)=>setSingle({...single, price:e.target.value})}/>
                  </div>
                </div>
                <div>
                  <Label className="text-foreground/80">Purchase Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="date" className="pl-10 bg-muted border-border text-foreground" value={single.purchaseDate || ""} onChange={(e)=>setSingle({...single, purchaseDate:e.target.value})}/>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-foreground/80">Description</Label>
                <Textarea rows={3} className="mt-1 bg-muted border-border text-foreground" value={single.description} onChange={(e)=>setSingle({...single, description:e.target.value})}/>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSingle} disabled={singleLoading} className="text-black bg-white hover:bg-gray-200 min-w-[140px]">
                  {singleLoading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />Saving…</> : <> <Sparkles className="w-4 h-4 mr-2" />Add Item</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BULK MODE */}
      {mode === "bulk" && (
        <>
          <div className="container mx-auto px-6 pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e)=> e.target.files && onBulkPick(e.target.files)} className="hidden" />
                <Button className="bg-white hover:bg-gray-200 text-black" onClick={()=>fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Photos (max 5)
                </Button>
                <Button variant="secondary" onClick={analyzeSelected} disabled={selectedDrafts.length===0 || analyzing} className="bg-gray-200/20 text-foreground hover:bg-gray-200/30 border border-border">
                  {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />} Analyze with AI{selectedDrafts.length ? ` (${selectedDrafts.length})` : ""}
                </Button>
                <Button onClick={saveAll} disabled={saving || drafts.every((d)=>d.status!=="ready")} className="bg-white hover:bg-gray-200 text-black">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Add {drafts.filter((d)=>d.status==="ready").length || ""} Items
                </Button>
              </div>
              <div className="flex-1" />
            </div>

            {(analyzing || saving) && (
              <div className="mt-3 text-sm text-foreground/80">
                {analyzing && <>Analyzing {globalProgress.done}/{globalProgress.total}…</>}
                {saving && <>Saving {globalProgress.done}/{globalProgress.total}…</>}
              </div>
            )}
          </div>

          <div className="container mx-auto px-6 py-6">
            {drafts.length === 0 ? (
              <Card className="bg-card/60 border-border">
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 bg-muted/80 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-foreground/80" />
                  </div>
                  <p className="text-foreground/80">Drag & drop up to 5 photos or click <span className="underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>Upload Photos</span>.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {drafts.map((d)=>(
                  <Card key={d.id} className={`bg-card/70 border ${d.selected ? "border-white/40" : "border-border"} relative`}>
                    <div className="absolute top-2 left-2 z-10"><Checkbox checked={d.selected} onCheckedChange={(c)=>toggleSelect(d.id, c===true)} /></div>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 text-foreground/80 hover:text-foreground" onClick={()=>removeDraft(d.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                    <CardHeader className="pb-2">
                      <div className="w-full aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background">
                        <img src={d.preview} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="mt-2 flex items-center flex-wrap gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          d.status==="ready" ? "bg-green-500/20 text-green-300 border border-green-500/40" :
                          d.status==="saved" ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40" :
                          d.status==="error" ? "bg-red-600/20 text-red-300 border border-red-500/40" :
                          (d.status==="analyzing"||d.status==="uploading"||d.status==="saving") ? "bg-primary/20 text-blue-300 border border-blue-500/40" :
                          "bg-muted/80/20 text-foreground/80 border border-border/40"
                        }`}>{d.status.charAt(0).toUpperCase()+d.status.slice(1)}</span>
                        {d.error && <p className="text-xs text-red-300">{d.error}</p>}
                        {d.status === "error" && (
                          <Button
                            variant="secondary"
                            size="xs"
                            className="h-6 px-2 bg-gray-200/20 text-foreground hover:bg-gray-200/30 border border-border"
                            onClick={() => { toggleSelect(d.id, true); analyzeSelected() }}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-foreground/80">Name</Label>
                        <Input className="mt-1 bg-muted border-border text-foreground" value={d.fields.name} onChange={(e)=>setField(d.id,"name",e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-foreground/80">Category</Label>
                          <Select value={d.fields.categoryId} onValueChange={(v)=>setField(d.id,"categoryId",v)}>
                            <SelectTrigger className="mt-1 bg-muted border-border text-foreground"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className="bg-card text-foreground border-border">
                              {categories.map((c)=> <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-foreground/80">Color</Label>
                          <Select value={d.fields.color} onValueChange={(v)=>setField(d.id,"color",v as ColorValue)}>
                            <SelectTrigger className="mt-1 bg-muted border-border text-foreground"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent className="bg-card text-foreground border-border">
                              {COLORS.map((c)=> <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-foreground/80">Size</Label>
                          <Input className="mt-1 bg-muted border-border text-foreground" value={d.fields.size || ""} onChange={(e)=>setField(d.id,"size",e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-foreground/80">Condition</Label>
                          <Select value={d.fields.condition} onValueChange={(v)=>setField(d.id,"condition",v as ConditionValue)}>
                            <SelectTrigger className="mt-1 bg-muted border-border text-foreground"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-card text-foreground border-border">
                              {CONDITIONS.map((c)=> <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground/80">Description</Label>
                        <Textarea rows={2} className="mt-1 bg-muted border-border text-foreground" value={d.fields.description} onChange={(e)=>setField(d.id,"description",e.target.value)} />
                      </div>
                      {/* Weather/Season */}
                      <div className="grid grid-cols-2 gap-2">
                        {WEATHER_CONDITIONS.map((w)=>(
                          <label key={`${d.id}-w-${w.value}`} className="flex items-center gap-2">
                            <Checkbox checked={d.fields.weatherSuitability.includes(w.value)}
                              onCheckedChange={(c)=>{ const next=new Set(d.fields.weatherSuitability); c?next.add(w.value):next.delete(w.value); setField(d.id,"weatherSuitability",Array.from(next) as WeatherValue[])}} />
                            <span className="text-foreground/80 text-xs flex items-center gap-1"><w.icon className="w-3 h-3" />{w.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {SEASONS.map((s)=>(
                          <label key={`${d.id}-s-${s.value}`} className="flex items-center gap-2">
                            <Checkbox checked={d.fields.seasonalUse.includes(s.value)}
                              onCheckedChange={(c)=>{ const next=new Set(d.fields.seasonalUse); c?next.add(s.value):next.delete(s.value); setField(d.id,"seasonalUse",Array.from(next) as SeasonValue[])}} />
                            <span className="text-foreground/80 text-xs">{s.label}</span>
                          </label>
                        ))}
                      </div>
                      {/* Kids vs Adults */}
                      {isKids ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={!!d.fields.schoolCompliant} onCheckedChange={(c)=>setField(d.id,"schoolCompliant",c===true)} />
                            <span className="text-foreground/80 text-sm flex items-center gap-1"><GraduationCap className="w-3 h-3" /> School compliant</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={!!d.fields.hasGrowthRoom} onCheckedChange={(c)=>setField(d.id,"hasGrowthRoom",c===true)} />
                            <span className="text-foreground/80 text-sm flex items-center gap-1"><Zap className="w-3 h-3" /> Room to grow</span>
                          </div>
                          <Card className="bg-background/40 border-green-700/40">
                            <CardHeader className="py-2"><CardTitle className="text-foreground text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Safety features</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 gap-1">
                              {ENHANCED_SAFETY_FEATURES.map((sf)=>(
                                <label key={`${d.id}-sf-${sf.value}`} className="flex items-center gap-2">
                                  <Checkbox checked={d.fields.safetyFeatures.includes(sf.value)}
                                    onCheckedChange={(c)=>{ const next=new Set(d.fields.safetyFeatures); c?next.add(sf.value):next.delete(sf.value); setField(d.id,"safetyFeatures",Array.from(next) as SafetyValue[])}} />
                                  <span className="text-foreground/80 text-xs">{sf.label}</span>
                                </label>
                              ))}
                            </CardContent>
                          </Card>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Checkbox checked={!!d.fields.workAppropriate} onCheckedChange={(c)=>setField(d.id,"workAppropriate",c===true)} />
                          <span className="text-foreground/80 text-sm flex items-center gap-1"><Briefcase className="w-3 h-3" /> Work appropriate</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="container mx-auto px-6 pb-10">
            <div className="flex justify-end gap-3">
              <Link href={profileId ? `/wardrobe?profile=${profileId}` : "/wardrobe"}>
                <Button variant="outline" className="border-border hover:bg-muted bg-transparent text-foreground">Cancel</Button>
              </Link>
              <Button onClick={saveAll} disabled={saving || drafts.every((d)=>d.status!=="ready")} className="bg-white hover:bg-gray-200 text-black min-w-[160px]">
                {saving ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />Saving…</>
                  : <><Sparkles className="w-4 h-4 mr-2" />Add {drafts.filter((d)=>d.status==="ready").length} Items</>}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
