"use client"

import { Button } from "@/components/ui/button"
import { Briefcase, Coffee, Heart, Sparkles, CloudRain, Sun, Snowflake } from "lucide-react"

interface QuickFiltersProps {
  onFilterSelect: (occasion: string) => void
  disabled?: boolean
}

const filters = [
  { label: "Work", value: "work", icon: Briefcase, color: "bg-primary hover:bg-primary/90" },
  { label: "Casual", value: "casual", icon: Coffee, color: "bg-green-600 hover:bg-green-700" },
  { label: "Formal", value: "formal", icon: Sparkles, color: "bg-purple-600 hover:bg-purple-700" },
  { label: "Date", value: "date", icon: Heart, color: "bg-pink-600 hover:bg-pink-700" },
  { label: "Rainy", value: "rainy day", icon: CloudRain, color: "bg-cyan-600 hover:bg-cyan-700" },
  { label: "Hot", value: "hot weather", icon: Sun, color: "bg-orange-600 hover:bg-orange-700" },
  { label: "Cold", value: "cold weather", icon: Snowflake, color: "bg-indigo-600 hover:bg-indigo-700" },
]

export function QuickFilters({ onFilterSelect, disabled }: QuickFiltersProps) {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-semibold text-foreground">Quick Filters</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon
          return (
            <Button
              key={filter.value}
              onClick={() => onFilterSelect(filter.value)}
              disabled={disabled}
              className={`${filter.color} text-foreground text-xs py-2 px-3 flex items-center justify-center gap-1.5 transition-all hover:scale-105`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{filter.label}</span>
            </Button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        💡 Click any filter for instant outfit suggestions
      </p>
    </div>
  )
}
