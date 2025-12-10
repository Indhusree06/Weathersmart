"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, MapPin, Cloud, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"

interface OutfitHistoryItem {
  id: string
  worn_date: string
  outfit_data: {
    items: Array<{
      id: string
      name: string
      category: string
      image_path?: string
    }>
    weather?: string
    location?: string
    occasion?: string
  }
}

export function OutfitHistory() {
  const [history, setHistory] = useState<OutfitHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("outfit_history")
        .select("*")
        .order("worn_date", { ascending: false })
        .limit(10)

      if (error) throw error
      setHistory(data || [])
    } catch (error) {
      console.error("Error fetching outfit history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
      })
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Outfit History</h3>
        <div className="text-center py-8 text-slate-500">Loading...</div>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className="bg-white border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Outfit History</h3>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No outfits worn yet</p>
          <p className="text-slate-400 text-xs mt-1">
            Click "I'll Wear This" on the AI Outfit Picker to start tracking
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Outfit History</h3>
        <span className="text-xs text-slate-500">{history.length} recent outfits</span>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
          >
            {/* Date */}
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-slate-900">
                {formatDate(item.worn_date)}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(item.worn_date).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </span>
            </div>

            {/* Weather & Location */}
            {(item.outfit_data.weather || item.outfit_data.location) && (
              <div className="flex flex-wrap gap-3 mb-3 text-xs">
                {item.outfit_data.weather && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Cloud className="w-3 h-3" />
                    <span>{item.outfit_data.weather}</span>
                  </div>
                )}
                {item.outfit_data.location && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3 h-3" />
                    <span>{item.outfit_data.location}</span>
                  </div>
                )}
              </div>
            )}

            {/* Outfit Items */}
            <div className="flex flex-wrap gap-2">
              {item.outfit_data.items.map((outfitItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100"
                >
                  <span className="text-xs text-slate-700">{outfitItem.name}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{outfitItem.category}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
