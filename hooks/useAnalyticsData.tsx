"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase, WardrobeItem, Outfit, OutfitRecommendation } from "@/lib/supabase"

// Analytics types
export interface AnalyticsSummary {
  totalItems: number
  mostWornItem: WardrobeItem | null
  leastWornItem: WardrobeItem | null
  wardrobeHealth: number
}

export interface CategoryBreakdown {
  category: string
  count: number
  percentage: number
}

export interface ColorBreakdown {
  colorFamily: string
  count: number
}

export interface WeatherReadiness {
  rain: { count: number; rating: number }
  winter: { count: number; rating: number }
  summer: { count: number; rating: number }
}

export interface StyleProfile {
  colorPreference: string
  topCategories: string[]
  averageCondition: string
}

export interface ClosetInsight {
  message: string
  severity: "info" | "warning" | "success"
}

export interface AIOutfitWithRating extends OutfitRecommendation {
  rating?: number
  items?: WardrobeItem[]
}

export interface AnalyticsData {
  summary: AnalyticsSummary
  categoryBreakdown: CategoryBreakdown[]
  colorBreakdown: ColorBreakdown[]
  weatherReadiness: WeatherReadiness
  mostWornItems: WardrobeItem[]
  leastWornItems: WardrobeItem[]
  savedOutfits: Outfit[]
  aiOutfits: AIOutfitWithRating[]
  styleProfile: StyleProfile
  closetInsights: ClosetInsight[]
  loading: boolean
  error: string | null
}

// Helper to determine color family
function getColorFamily(color?: string): string {
  if (!color) return "unknown"
  const c = color.toLowerCase()
  
  if (["black", "grey", "gray", "white", "beige", "cream", "tan"].some(n => c.includes(n))) {
    return "neutral"
  }
  if (["red", "orange", "yellow", "pink", "coral"].some(n => c.includes(n))) {
    return "warm"
  }
  if (["blue", "green", "purple", "teal", "cyan"].some(n => c.includes(n))) {
    return "cool"
  }
  if (["neon", "bright", "vibrant"].some(n => c.includes(n))) {
    return "bright"
  }
  if (["navy", "dark", "charcoal"].some(n => c.includes(n))) {
    return "dark"
  }
  
  return "other"
}

// Helper to check if item is weather appropriate
function hasWeatherTag(item: WardrobeItem, tag: string): boolean {
  const name = (item.name || "").toLowerCase()
  const desc = (item.description || "").toLowerCase()
  const tags = item.tags?.map(t => t.tag?.name?.toLowerCase() || "") || []
  
  const searchText = `${name} ${desc} ${tags.join(" ")}`
  
  switch (tag) {
    case "rain":
      return searchText.includes("rain") || searchText.includes("waterproof") || searchText.includes("umbrella")
    case "winter":
      return searchText.includes("winter") || searchText.includes("warm") || searchText.includes("coat") || 
             searchText.includes("sweater") || searchText.includes("jacket")
    case "summer":
      return searchText.includes("summer") || searchText.includes("light") || searchText.includes("shorts") || 
             searchText.includes("tank") || searchText.includes("sandal")
    default:
      return false
  }
}

// Calculate wardrobe health score (0-100)
function calculateWardrobeHealth(items: WardrobeItem[], categoryBreakdown: CategoryBreakdown[]): number {
  if (items.length === 0) return 0
  
  let score = 50 // Base score
  
  // Category balance (up to +20)
  const hasTopics = categoryBreakdown.some(c => c.category.toLowerCase().includes("top"))
  const hasBottoms = categoryBreakdown.some(c => c.category.toLowerCase().includes("bottom") || c.category.toLowerCase().includes("pant"))
  const hasShoes = categoryBreakdown.some(c => c.category.toLowerCase().includes("shoe"))
  const hasOuterwear = categoryBreakdown.some(c => c.category.toLowerCase().includes("jacket") || c.category.toLowerCase().includes("coat"))
  
  if (hasTopics) score += 5
  if (hasBottoms) score += 5
  if (hasShoes) score += 5
  if (hasOuterwear) score += 5
  
  // Wear distribution (up to +20)
  const wornItems = items.filter(i => i.wear_count > 0)
  const wearPercentage = wornItems.length / items.length
  score += Math.floor(wearPercentage * 20)
  
  // Condition check (up to +10)
  const goodConditionItems = items.filter(i => ["new", "excellent", "good"].includes(i.condition))
  const conditionPercentage = goodConditionItems.length / items.length
  score += Math.floor(conditionPercentage * 10)
  
  return Math.min(100, Math.max(0, score))
}

export function useAnalyticsData(userId?: string, profileId?: string | null): AnalyticsData {
  const [allItems, setAllItems] = useState<WardrobeItem[]>([])
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([])
  const [aiOutfits, setAiOutfits] = useState<AIOutfitWithRating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Check if wardrobe_profile_id column exists
        const { data: columnCheck } = await supabase
          .from("wardrobe_items")
          .select("wardrobe_profile_id")
          .limit(1)
        
        const hasProfileColumn = !columnCheck || columnCheck !== null

        // Build query for wardrobe items with profile filter
        let itemsQuery = supabase
          .from("wardrobe_items")
          .select(`
            *,
            category:categories(*),
            tags:wardrobe_item_tags(
              tag:tags(*)
            )
          `)
          .eq("user_id", userId)

        // Filter by profile if specified and column exists
        if (hasProfileColumn) {
          if (profileId) {
            itemsQuery = itemsQuery.eq("wardrobe_profile_id", profileId)
          } else {
            // If no profile specified, get items without profile (main wardrobe)
            itemsQuery = itemsQuery.is("wardrobe_profile_id", null)
          }
        }

        const { data: itemsData, error: itemsError } = await itemsQuery

        if (itemsError) throw itemsError

        // Transform items
        const transformedItems: WardrobeItem[] = (itemsData || []).map((item: any) => ({
          ...item,
          tags: item.tags?.map((tagAssoc: any) => ({
            tag_id: tagAssoc.tag?.id,
            wardrobe_item_id: item.id,
            tag: tagAssoc.tag,
          })) || [],
        }))

        setAllItems(transformedItems)

        // Fetch saved outfits
        const { data: outfitsData, error: outfitsError } = await supabase
          .from("outfits")
          .select("*")
          .eq("user_id", userId)

        if (outfitsError) {
          console.warn("Error fetching outfits:", outfitsError)
          setAllOutfits([])
        } else {
          setAllOutfits(outfitsData || [])
        }

        // Fetch AI outfit recommendations
        const { data: aiData, error: aiError } = await supabase
          .from("outfit_recommendations")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (aiError) {
          console.warn("Error fetching AI recommendations:", aiError)
          setAiOutfits([])
        } else {
          // Transform AI outfits and match with items
          const transformedAiOutfits: AIOutfitWithRating[] = (aiData || []).map((rec: any) => {
            const itemIds = rec.recommended_items || []
            const matchedItems = transformedItems.filter(item => itemIds.includes(item.id))
            
            return {
              ...rec,
              rating: rec.rating || undefined,
              items: matchedItems,
            }
          })
          setAiOutfits(transformedAiOutfits)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError(err instanceof Error ? err.message : "Failed to load analytics data")
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, profileId])

  // Compute analytics from the data
  const analyticsData = useMemo((): Omit<AnalyticsData, "loading" | "error"> => {
    // Category breakdown
    const categoryMap = new Map<string, number>()
    allItems.forEach(item => {
      const category = item.category?.name || "Uncategorized"
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const categoryBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / allItems.length) * 100,
    }))

    // Color breakdown
    const colorMap = new Map<string, number>()
    allItems.forEach(item => {
      const family = getColorFamily(item.color)
      colorMap.set(family, (colorMap.get(family) || 0) + 1)
    })

    const colorBreakdown: ColorBreakdown[] = Array.from(colorMap.entries()).map(([colorFamily, count]) => ({
      colorFamily,
      count,
    }))

    // Weather readiness
    const rainItems = allItems.filter(item => hasWeatherTag(item, "rain"))
    const winterItems = allItems.filter(item => hasWeatherTag(item, "winter"))
    const summerItems = allItems.filter(item => hasWeatherTag(item, "summer"))

    const weatherReadiness: WeatherReadiness = {
      rain: { 
        count: rainItems.length, 
        rating: Math.min(5, Math.ceil(rainItems.length / 2)) 
      },
      winter: { 
        count: winterItems.length, 
        rating: Math.min(5, Math.ceil(winterItems.length / 5)) 
      },
      summer: { 
        count: summerItems.length, 
        rating: Math.min(5, Math.ceil(summerItems.length / 5)) 
      },
    }

    // Most and least worn
    const sortedByWear = [...allItems].sort((a, b) => b.wear_count - a.wear_count)
    const mostWornItems = sortedByWear.slice(0, 5)
    const leastWornItems = [...allItems]
      .filter(item => item.wear_count >= 0)
      .sort((a, b) => a.wear_count - b.wear_count)
      .slice(0, 5)

    // Summary
    const summary: AnalyticsSummary = {
      totalItems: allItems.length,
      mostWornItem: sortedByWear[0] || null,
      leastWornItem: leastWornItems[0] || null,
      wardrobeHealth: calculateWardrobeHealth(allItems, categoryBreakdown),
    }

    // Style profile
    const topColor = colorBreakdown.sort((a, b) => b.count - a.count)[0]
    const topCategories = categoryBreakdown
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(c => c.category)
    
    const avgConditionScore = allItems.reduce((sum, item) => {
      const conditionScores: Record<string, number> = { new: 5, excellent: 4, good: 3, fair: 2, poor: 1 }
      return sum + (conditionScores[item.condition] || 3)
    }, 0) / allItems.length

    const avgCondition = avgConditionScore >= 4.5 ? "Excellent" : 
                         avgConditionScore >= 3.5 ? "Very Good" :
                         avgConditionScore >= 2.5 ? "Good" : "Fair"

    const styleProfile: StyleProfile = {
      colorPreference: topColor ? `${topColor.colorFamily.charAt(0).toUpperCase() + topColor.colorFamily.slice(1)} tones` : "Mixed",
      topCategories,
      averageCondition: avgCondition,
    }

    // Closet insights
    const closetInsights: ClosetInsight[] = []
    
    // Check category balance
    const topCount = allItems.filter(item => 
      item.category?.name?.toLowerCase().includes("top") || 
      item.category?.name?.toLowerCase().includes("shirt")
    ).length
    const bottomCount = allItems.filter(item => 
      item.category?.name?.toLowerCase().includes("bottom") || 
      item.category?.name?.toLowerCase().includes("pant") ||
      item.category?.name?.toLowerCase().includes("jean")
    ).length

    if (topCount < bottomCount * 0.6) {
      closetInsights.push({
        message: `You have ${bottomCount} bottoms but only ${topCount} tops — consider adding more tops for balance.`,
        severity: "warning",
      })
    }

    if (bottomCount < topCount * 0.4) {
      closetInsights.push({
        message: `You have ${topCount} tops but only ${bottomCount} bottoms — consider adding more bottoms.`,
        severity: "warning",
      })
    }

    // Weather readiness insights
    if (rainItems.length < 2) {
      closetInsights.push({
        message: `You have very few rain-friendly items (${rainItems.length}). Consider adding a waterproof jacket or umbrella.`,
        severity: "warning",
      })
    }

    if (winterItems.length < 3) {
      closetInsights.push({
        message: `Limited winter gear detected (${winterItems.length} items). You may need more warm clothing.`,
        severity: "info",
      })
    }

    // Unworn items insight
    const unwornItems = allItems.filter(item => item.wear_count === 0)
    if (unwornItems.length > allItems.length * 0.3) {
      closetInsights.push({
        message: `${unwornItems.length} items haven't been worn yet. Consider styling or donating them.`,
        severity: "info",
      })
    }

    // Positive insights
    if (summary.wardrobeHealth >= 80) {
      closetInsights.push({
        message: "Your wardrobe is well-balanced and regularly used. Great job!",
        severity: "success",
      })
    }

    if (closetInsights.length === 0) {
      closetInsights.push({
        message: "Your wardrobe looks good! Keep maintaining your items and tracking your outfits.",
        severity: "success",
      })
    }

    return {
      summary,
      categoryBreakdown,
      colorBreakdown,
      weatherReadiness,
      mostWornItems,
      leastWornItems,
      savedOutfits: allOutfits,
      aiOutfits,
      styleProfile,
      closetInsights,
    }
  }, [allItems, allOutfits, aiOutfits])

  return {
    ...analyticsData,
    loading,
    error,
  }
}

