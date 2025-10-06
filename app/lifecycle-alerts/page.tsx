"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Shirt, Recycle, Heart, HandHeart, Lightbulb } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { wardrobeService, wardrobeProfileService, type WardrobeItem, type WardrobeProfile } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Navbar } from "@/components/ui/navbar"

/* ------------------------- helpers -------------------------- */

const parseMoney = (value: unknown): number => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const n = Number(value.replace(/[^0-9.]/g, ""))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

const addDays = (d: Date, n: number) => {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

// Human-friendly age (years, months, days) + total days
const calculateItemAge = (purchaseDate: string): string => {
  try {
    const purchase = new Date(purchaseDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - purchase.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    let years = today.getFullYear() - purchase.getFullYear()
    let months = today.getMonth() - purchase.getMonth()
    let days = today.getDate() - purchase.getDate()

    if (days < 0) {
      months -= 1
      const prevMonthDate = new Date(today.getFullYear(), today.getMonth(), 0)
      days += prevMonthDate.getDate()
    }
    if (months < 0) {
      years -= 1
      months += 12
    }

    const parts: string[] = []
    if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`)
    if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`)
    if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`)

    return `${parts.join(", ")} (${diffDays} total days)`
  } catch {
    return "Unknown"
  }
}

const getItemReasons = (
  item: WardrobeItem & { wear_count?: number; price?: unknown; purchase_date?: string },
  threshold: number
): string[] => {
  const reasons: string[] = []
  const wears = item.wear_count ?? 0
  if (wears >= threshold) reasons.push(`Hit ${threshold} wears`)

  const priceNum = parseMoney(item.price)
  const cpw = priceNum > 0 ? priceNum / Math.max(1, wears) : 0
  if (cpw > 3) reasons.push("High CPW")

  if (item.purchase_date) {
    const purchase = new Date(item.purchase_date)
    const ageDays = Math.floor((Date.now() - purchase.getTime()) / (1000 * 60 * 60 * 24))
    if (ageDays >= 730) reasons.push("2+ yrs old")
  }

  if (item.purchase_date && wears < 5) {
    const purchase = new Date(item.purchase_date)
    const ageDays = Math.floor((Date.now() - purchase.getTime()) / (1000 * 60 * 60 * 24))
    if (ageDays >= 180) reasons.push("Low usage")
  }

  return reasons.slice(0, 2)
}

/* -------------------- Keep Inline Component -------------------- */

type KeepInlineActionProps = {
  itemId: string
  itemName: string
  cpw: number
  defaultSnooze?: number | undefined
  onConfirm: (opts: { reason: string; snoozeDays?: number }) => Promise<void> | void
  onUndo: () => Promise<void> | void
  onCancel: () => void
}

function KeepInlineAction({
  itemId,
  itemName,
  cpw,
  defaultSnooze = 60,
  onConfirm,
  onUndo,
  onCancel,
}: KeepInlineActionProps) {
  const reasons = ["Still love it", "Fits great", "Sentimental", "Seasonal"]
  const snoozes = [30, 60, 90]

  const [reason, setReason] = useState<string>(reasons[0])
  const [snooze, setSnooze] = useState<number | undefined>(defaultSnooze)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showWearPlanTip = cpw > 2 // adjust to taste

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await onConfirm({ reason, snoozeDays: snooze })
      setToast(`Kept “${itemName}”${snooze ? ` • Snoozed ${snooze} days` : ""}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-700 bg-slate-800/70 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">Keep this item?</div>
        <div className="text-xs text-slate-400">Hides lifecycle alerts for now</div>
      </div>

      <div className="mt-3">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Reason</div>
        <div className="flex flex-wrap gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={
                "rounded-full border px-3 py-1 text-sm transition " +
                (reason === r
                  ? "bg-emerald-900/40 text-emerald-200 border-emerald-700"
                  : "bg-slate-900/40 text-slate-200 border-slate-700 hover:bg-slate-800/50")
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">Snooze alerts</div>
        <div className="flex flex-wrap gap-2">
          {snoozes.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSnooze(d)}
              className={
                "rounded-md border px-3 py-1.5 text-sm transition " +
                (snooze === d
                  ? "bg-slate-200 text-slate-900 border-slate-300"
                  : "bg-slate-900/40 text-slate-200 border-slate-700 hover:bg-slate-800/50")
              }
            >
              {d} days
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSnooze(undefined)}
            className={
              "rounded-md border px-3 py-1.5 text-sm transition " +
              (snooze === undefined
                ? "bg-slate-200 text-slate-900 border-slate-300"
                : "bg-slate-900/40 text-slate-200 border-slate-700 hover:bg-slate-800/50")
            }
          >
            No snooze
          </button>
        </div>
      </div>

      {showWearPlanTip && (
        <div className="mt-4 rounded-lg border border-amber-700/50 bg-amber-900/30 p-3">
          <div className="text-sm text-amber-200">
            Tip: CPW is a bit high. Wear it twice next week—add to a 2-week rotation?
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="rounded-md border border-amber-600 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-800/40"
              onClick={() => {
                // Hook for your planner
                console.log("Add 2-week wear plan for", { itemId })
              }}
            >
              Add Plan
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          onClick={handleSave}
        >
          {saving ? "Saving…" : "✓ Save & Hide"}
        </button>
      </div>

      {toast && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100">
          <span>{toast}</span>
          <button
            className="rounded-md border border-slate-500 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
            onClick={() => {
              setToast(null)
              onUndo()
            }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------- page -------------------------- */

export default function LifecycleAlertsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams?.get("from") || "/home"

  const navLinks = [
    { name: "AI Outfit Picker", href: "/chat" },
    { name: "Wardrobes", href: "/wardrobes" },
    { name: "Weather Essentials", href: "/weather-essentials" },
    { name: "Lifecycle Alerts", href: "/lifecycle-alerts" },
  ]

  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [wearCountThreshold, setWearCountThreshold] = useState<string>("")
  const [profiles, setProfiles] = useState<WardrobeProfile[]>([])
  const [thresholdItems, setThresholdItems] = useState<(WardrobeItem & { _reasons?: string[]; wear_count?: number })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // donation/repair (unchanged)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showRepairModal, setShowRepairModal] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("Omaha")

  // keep inline
  const [showKeepForId, setShowKeepForId] = useState<string | null>(null)
  const [lastRemoved, setLastRemoved] = useState<null | { item: (WardrobeItem & { wear_count?: number; _reasons?: string[] }); index: number }>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
      return
    }
    const fetchProfiles = async () => {
      try {
        if (user?.id) {
          const userProfiles = await wardrobeProfileService.getWardrobeProfiles(user.id)
          setProfiles(userProfiles || [])
          if (userProfiles?.length) setSelectedProfile(userProfiles[0].id)
        }
      } catch (e) {
        console.error("Error fetching profiles:", e)
      }
    }
    fetchProfiles()
  }, [user, loading, router])

  useEffect(() => {
    const fetchThresholdItems = async () => {
      if (!selectedProfile || !wearCountThreshold) return
      setIsLoading(true)
      try {
        const allItems = await wardrobeService.getWardrobeItems(user?.id || "", selectedProfile)
        const itemsWithWearCount = (allItems || []).map((item) => ({
          ...item,
          wear_count: item.wear_count ?? Math.floor(Math.random() * 120),
        }))
        const thresholdValue = parseInt(wearCountThreshold, 10)
        const filtered = itemsWithWearCount
          .filter((i) => (i.wear_count || 0) >= thresholdValue)
          .map((i) => ({ ...i, _reasons: getItemReasons(i, thresholdValue) }))
        setThresholdItems(filtered)
      } catch (e) {
        console.error("Error fetching items:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchThresholdItems()
  }, [selectedProfile, wearCountThreshold, user?.id])

  const handleActionClick = (itemId: string, action: "donate" | "keep" | "upcycle" | "repair") => {
    if (action === "donate") {
      setSelectedItemId(itemId)
      setShowDonationModal(true)
      return
    }
    if (action === "repair") {
      setSelectedItemId(itemId)
      setShowRepairModal(true)
      return
    }
    if (action === "keep") {
      setShowKeepForId((prev) => (prev === itemId ? null : itemId))
      return
    }
    // upcycle → optimistic remove (you can swap to modal later)
    setThresholdItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  // donation + repair mocks (unchanged lists)
  const donationCenters: Record<string, { id: string; name: string; address: string }[]> = {
    Omaha: [
      { id: "omaha1", name: "Goodwill Donation Center", address: "7522 Dodge St, Omaha, NE 68114" },
      { id: "omaha2", name: "Salvation Army Family Store", address: "10908 John Galt Blvd, Omaha, NE 68137" },
      { id: "omaha3", name: "Habitat for Humanity ReStore", address: "1003 S 24th St, Omaha, NE 68108" },
    ],
    "New York": [
      { id: "ny1", name: "Housing Works Thrift Shops", address: "130 Crosby St, New York, NY 10012" },
      { id: "ny2", name: "Goodwill Industries", address: "157 W 72nd St, New York, NY 10023" },
      { id: "ny3", name: "The Salvation Army", address: "536 W 46th St, New York, NY 10036" },
    ],
    "Los Angeles": [
      { id: "la1", name: "Out of the Closet Thrift Store", address: "8224 Santa Monica Blvd, West Hollywood, CA 90046" },
      { id: "la2", name: "Goodwill Southern California", address: "342 N San Fernando Rd, Los Angeles, CA 90031" },
      { id: "la3", name: "L.A. Road Thrift Store", address: "121 N La Brea Ave, Los Angeles, CA 90036" },
    ],
    Chicago: [
      { id: "chi1", name: "Brown Elephant Resale Shop", address: "5404 N Clark St, Chicago, IL 60640" },
      { id: "chi2", name: "Salvation Army Thrift Store", address: "509 N Union Ave, Chicago, IL 60610" },
      { id: "chi3", name: "Goodwill Store", address: "1201 W Washington Blvd, Chicago, IL 60607" },
    ],
    Houston: [
      { id: "hou1", name: "Family Thrift Center", address: "8705 Lyons Ave, Houston, TX 77020" },
      { id: "hou2", name: "Goodwill Houston", address: "2100 Taylor St, Houston, TX 77007" },
      { id: "hou3", name: "The Salvation Army Family Store", address: "2208 Washington Ave, Houston, TX 77007" },
    ],
  }

  const repairShops: Record<string, { id: string; name: string; address: string; specialty: string }[]> = {
    Omaha: [
      { id: "repair-omaha1", name: "Stitch & Sole Repair", address: "1234 Main St, Omaha, NE 68114", specialty: "Clothing & Shoes" },
      { id: "repair-omaha2", name: "Craftsman Tailors", address: "5678 Center Ave, Omaha, NE 68137", specialty: "Fine Clothing" },
      { id: "repair-omaha3", name: "Quick Fix Alterations", address: "9101 Market St, Omaha, NE 68108", specialty: "General Repairs" },
    ],
    "New York": [
      { id: "repair-ny1", name: "Manhattan Tailor Shop", address: "421 5th Ave, New York, NY 10016", specialty: "Designer Clothing" },
      { id: "repair-ny2", name: "Cobbler's Corner", address: "157 E 34th St, New York, NY 10016", specialty: "Leather & Shoes" },
      { id: "repair-ny3", name: "Garment District Repairs", address: "242 W 36th St, New York, NY 10018", specialty: "All Textiles" },
    ],
    "Los Angeles": [
      { id: "repair-la1", name: "Hollywood Alterations", address: "6523 Hollywood Blvd, Los Angeles, CA 90028", specialty: "Fashion Items" },
      { id: "repair-la2", name: "Beverly Hills Tailoring", address: "9571 Wilshire Blvd, Beverly Hills, CA 90212", specialty: "Luxury Garments" },
      { id: "repair-la3", name: "LA Shoe Hospital", address: "8011 Melrose Ave, Los Angeles, CA 90046", specialty: "Footwear" },
    ],
    Chicago: [
      { id: "repair-chi1", name: "Windy City Tailors", address: "1543 N Wells St, Chicago, IL 60610", specialty: "All Clothing" },
      { id: "repair-chi2", name: "Loop Shoe Repair", address: "29 E Madison St, Chicago, IL 60602", specialty: "Shoes & Boots" },
      { id: "repair-chi3", name: "Chicago Garment Repair", address: "3432 N Southport Ave, Chicago, IL 60657", specialty: "Vintage Clothing" },
    ],
    Houston: [
      { id: "repair-hou1", name: "Texas Tailors", address: "2615 Southwest Fwy, Houston, TX 77098", specialty: "All Garments" },
      { id: "repair-hou2", name: "Houston Shoe Hospital", address: "2019 S Shepherd Dr, Houston, TX 77019", specialty: "Footwear" },
      { id: "repair-hou3", name: "Galleria Alterations", address: "5085 Westheimer Rd, Houston, TX 77056", specialty: "Designer Items" },
    ],
  }

  const handleDonate = (centerId: string) => {
    console.log(`Donating item ${selectedItemId} to center ${centerId}`)
    setShowDonationModal(false)
    setThresholdItems((prev) => prev.filter((i) => i.id !== selectedItemId))
  }

  const handleRepair = (shopId: string, resetCounter: boolean) => {
    console.log(`Repairing item ${selectedItemId} at shop ${shopId}, reset: ${resetCounter}`)
    setShowRepairModal(false)
    setThresholdItems((prev) => prev.filter((i) => i.id !== selectedItemId))
  }

  const calculateRepairCost = (price: number) => {
    const minCost = Math.round(price * 0.15)
    const maxCost = Math.round(price * 0.3)
    return { minCost, maxCost }
  }

  const handleLogout = () => router.push("/login")

  /* --------------------------- UI --------------------------- */

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar navLinks={navLinks} currentPath="/lifecycle-alerts" onLogout={handleLogout} />

      <header className="sticky top-0 z-10 bg-slate-800/70 border-b border-slate-700 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Link href={from}>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-white">Lifecycle Alerts</h1>
          </div>
        </div>
      </header>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="sm:max-w-md border border-slate-700 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Select Donation Center</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col space-y-2">
              <label htmlFor="city" className="text-sm text-slate-300">City</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger id="city" className="border-slate-700 bg-slate-800 text-white">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-white">
                  {Object.keys(donationCenters).map((city) => (
                    <SelectItem key={city} value={city} className="text-white">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm text-slate-300">Available Donation Centers</h3>
              <div className="space-y-2">
                {donationCenters[selectedCity]?.map((center) => (
                  <div key={center.id} className="rounded-md border border-slate-700 bg-slate-800 p-3">
                    <div className="font-medium">{center.name}</div>
                    <div className="text-sm text-slate-400">{center.address}</div>
                    <Button size="sm" className="mt-3 w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleDonate(center.id)}>
                      Select This Center
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-200" onClick={() => setShowDonationModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Repair Modal */}
      <Dialog open={showRepairModal} onOpenChange={setShowRepairModal}>
        <DialogContent className="sm:max-w-md border border-slate-700 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Repair Options</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {thresholdItems.find((i) => i.id === selectedItemId) && (() => {
              const it = thresholdItems.find((i) => i.id === selectedItemId)!
              const price = parseMoney(it.price)
              const { minCost, maxCost } = calculateRepairCost(price)
              const worthRepairing = price > 0 ? maxCost < price * 0.7 : false
              return (
                <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
                  <h3 className="font-medium">Cost Analysis</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-300">
                    <div>Original Price:</div>
                    <div className="font-medium text-white">{price > 0 ? `$${price.toFixed(2)}` : "—"}</div>
                    <div>Estimated Repair Cost:</div>
                    <div className="font-medium text-white">${minCost} - ${maxCost}</div>
                    <div>New Item Cost:</div>
                    <div className="font-medium text-white">{price > 0 ? `$${price.toFixed(2)}` : "—"}</div>
                  </div>
                  <div className={`mt-3 rounded p-2 text-sm ${worthRepairing ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300"}`}>
                    <strong>Recommendation:</strong> {worthRepairing ? "Worth repairing — cheaper than buying new." : "Consider replacing — repair cost is close to new."}
                  </div>
                </div>
              )
            })()}

            <div className="flex flex-col space-y-2">
              <label htmlFor="repair-city" className="text-sm text-slate-300">City</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger id="repair-city" className="border-slate-700 bg-slate-800 text-white">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-white">
                  {Object.keys(repairShops).map((city) => (
                    <SelectItem key={city} value={city} className="text-white">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm text-slate-300">Available Repair Shops</h3>
              <div className="space-y-2">
                {repairShops[selectedCity]?.map((shop) => (
                  <div key={shop.id} className="rounded-md border border-slate-700 bg-slate-800 p-3">
                    <div className="font-medium">{shop.name}</div>
                    <div className="text-sm text-slate-400">{shop.address}</div>
                    <div className="mt-1 text-xs text-blue-300">Specialty: {shop.specialty}</div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-200" onClick={() => handleRepair(shop.id, false)}>
                        Repair Only
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRepair(shop.id, true)}>
                        Fix & Reset Counter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-200" onClick={() => setShowRepairModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main */}
      <main className="container mx-auto px-6 py-6">
        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Select Profile</label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-white">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-white">
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-white">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Wear Count Threshold</label>
              <Select value={wearCountThreshold} onValueChange={setWearCountThreshold}>
                <SelectTrigger className="w-full border-slate-700 bg-slate-800 text-white">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-800 text-white">
                  {[5, 10, 20, 50, 70, 100].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-white">
                      {n} wears
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
          </div>
        ) : thresholdItems.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-10 text-center">
            <Shirt className="mx-auto mb-4 h-14 w-14 text-slate-600" />
            <h3 className="mb-2 text-xl font-medium text-white">No items found</h3>
            <p className="text-slate-400">No items have reached the selected wear count threshold yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {thresholdItems.map((item, index) => {
              const priceNum = parseMoney(item.price)
              const wears = item.wear_count || 1
              const cpwNum = priceNum > 0 ? priceNum / wears : 0
              const cpw = cpwNum.toFixed(2)

              const isKeepOpen = showKeepForId === item.id

              return (
                <Card key={item.id} className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-sm transition-transform hover:-translate-y-0.5">
                  <div className="relative h-40 overflow-hidden bg-slate-700 md:h-44 lg:h-48">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Shirt className="h-8 w-8 text-slate-400" />
                      </div>
                    )}

                    {Array.isArray(item._reasons) && item._reasons.length > 0 && (
                      <div className="absolute left-2 top-2 flex flex-col gap-1">
                        {item._reasons.map((r, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border border-blue-400/40 bg-blue-600/80 px-2 py-0.5 text-[11px] leading-none text-white shadow-sm"
                            title={r}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <h3 className="mb-0.5 truncate text-sm font-medium text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400">Worn {item.wear_count || 0} times</p>
                    <p className="mt-1 text-xs font-medium text-emerald-400">CPW: ${cpw}</p>
                    {item.purchase_date && (
                      <p className="mt-1 text-[11px] text-slate-400">Age: {calculateItemAge(item.purchase_date)}</p>
                    )}

                    {/* actions */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent px-2 text-rose-300 hover:bg-rose-900/20 hover:text-rose-200 border-slate-600"
                        onClick={() => handleActionClick(item.id, "donate")}
                      >
                        <HandHeart className="mr-1 h-3.5 w-3.5" />
                        Donate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 bg-transparent px-2 border-slate-600 ${
                          isKeepOpen ? "text-emerald-200 bg-emerald-900/10" : "text-emerald-300 hover:bg-emerald-900/20 hover:text-emerald-200"
                        }`}
                        onClick={() => handleActionClick(item.id, "keep")}
                      >
                        <Heart className="mr-1 h-3.5 w-3.5" />
                        Keep
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent px-2 text-blue-300 hover:bg-blue-900/20 hover:text-blue-200 border-slate-600"
                        onClick={() => handleActionClick(item.id, "upcycle")}
                      >
                        <Recycle className="mr-1 h-3.5 w-3.5" />
                        Upcycle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-transparent px-2 text-amber-300 hover:bg-amber-900/20 hover:text-amber-200 border-slate-600"
                        onClick={() => handleActionClick(item.id, "repair")}
                      >
                        <Lightbulb className="mr-1 h-3.5 w-3.5" />
                        Repair
                      </Button>
                    </div>

                    {/* Keep inline panel */}
                    {isKeepOpen && (
                      <KeepInlineAction
                        itemId={item.id}
                        itemName={item.name}
                        cpw={cpwNum}
                        onCancel={() => setShowKeepForId(null)}
                        onConfirm={async ({ reason, snoozeDays }) => {
                          // optimistic remove
                          setShowKeepForId(null)
                          setThresholdItems((prev) => {
                            const idx = prev.findIndex((x) => x.id === item.id)
                            if (idx === -1) return prev
                            setLastRemoved({ item: prev[idx], index: idx })
                            const copy = prev.slice()
                            copy.splice(idx, 1)
                            return copy
                          })

                          // TODO: persist "keep" to DB
                          // await wardrobeService.keepItem({
                          //   userId: user?.id,
                          //   itemId: item.id,
                          //   status: "active",
                          //   keep_reason: reason,
                          //   snooze_until: snoozeDays ? addDays(new Date(), snoozeDays).toISOString() : null,
                          // })

                          console.log("KEPT", {
                            itemId: item.id,
                            reason,
                            snoozeDays,
                            snoozeUntil: snoozeDays ? addDays(new Date(), snoozeDays).toISOString() : null,
                          })
                        }}
                        onUndo={async () => {
                          // restore last removed if matches
                          setThresholdItems((prev) => {
                            if (!lastRemoved) return prev
                            const exists = prev.find((x) => x.id === lastRemoved.item.id)
                            if (exists) return prev
                            const copy = prev.slice()
                            copy.splice(lastRemoved.index, 0, lastRemoved.item)
                            return copy
                          })
                          setLastRemoved(null)

                          // TODO: revert keep in DB if you persisted it
                          // await wardrobeService.undoKeepItem({ userId: user?.id, itemId: lastRemoved?.item.id })
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
