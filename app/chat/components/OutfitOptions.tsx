"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface WardrobeItem {
  id: string
  name: string
  category?: string
  color?: string
  image?: string
  wear_count?: number
}

interface OutfitOption {
  items: WardrobeItem[]
  score: number
  reasoning: string[]
  colorHarmony: {
    score: number
    type: string
    description: string
  }
}

interface OutfitOptionsProps {
  options: OutfitOption[]
  selectedIndex: number
  onSelect: (index: number) => void
  className?: string
}

export function OutfitOptions({ options, selectedIndex, onSelect, className }: OutfitOptionsProps) {
  if (options.length === 0) return null

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Choose Your Favorite</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option, index) => (
          <Card
            key={index}
            className={cn(
              "p-3 cursor-pointer transition-all hover:shadow-md",
              selectedIndex === index
                ? "border-2 border-primary bg-primary/5"
                : "border border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(index)}
          >
            {/* Outfit Preview */}
            <div className="flex gap-2 mb-2">
              {option.items.slice(0, 3).map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="w-16 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center px-1">
                      {item.name.substring(0, 10)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Option Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  Option {index + 1}
                </span>
                {selectedIndex === index && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {option.colorHarmony.description}
              </p>
            </div>

            {/* Score Badge */}
            <div className="mt-2 flex items-center gap-1">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(option.score, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(option.score)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        💡 Click an option to see full details
      </p>
    </div>
  )
}
