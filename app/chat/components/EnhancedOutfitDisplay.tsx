"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SwapItemButton } from "./SwapItemButton"
import { Palette, Lightbulb, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryDisplayName, autoCategorizeItem } from "@/lib/autoCategorize"

interface WardrobeItem {
  id: string
  name: string
  category?: string
  color?: string
  brand?: string
  image?: string
  wear_count?: number
}

interface OutfitDisplayProps {
  items: WardrobeItem[]
  reasoning?: string[]
  colorHarmony?: {
    score: number
    type: string
    description: string
  }
  onSwapItem?: (item: WardrobeItem, alternatives: WardrobeItem[]) => void
  wardrobeItems?: WardrobeItem[]
  className?: string
}

export function EnhancedOutfitDisplay({
  items,
  reasoning = [],
  colorHarmony,
  onSwapItem,
  wardrobeItems = [],
  className
}: OutfitDisplayProps) {
  const handleSwap = (item: WardrobeItem) => {
    if (!onSwapItem) return

    // Find alternative items in the same category
    const itemCategory = autoCategorizeItem(item)
    const alternatives = wardrobeItems.filter(
      wardrobeItem =>
        wardrobeItem.id !== item.id &&
        autoCategorizeItem(wardrobeItem) === itemCategory
    )

    onSwapItem(item, alternatives)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Outfit Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, index) => {
          const category = autoCategorizeItem(item)
          const categoryDisplay = getCategoryDisplayName(category)

          return (
            <Card key={item.id} className="relative overflow-hidden group">
              {/* Swap Button */}
              {onSwapItem && wardrobeItems.length > 0 && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SwapItemButton
                    item={item}
                    wardrobeItems={wardrobeItems}
                    onSwap={handleSwap}
                  />
                </div>
              )}

              {/* Item Image */}
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-center p-4">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-3 space-y-2">
                <div>
                  <h4 className="font-medium text-sm text-foreground line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{categoryDisplay}</p>
                </div>

                {/* Item Details */}
                <div className="flex flex-wrap gap-1">
                  {item.color && (
                    <Badge variant="secondary" className="text-xs">
                      {item.color}
                    </Badge>
                  )}
                  {item.wear_count !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Worn {item.wear_count}x
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Color Harmony Section */}
      {colorHarmony && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Color Harmony
              </h4>
              <p className="text-sm text-muted-foreground">
                {colorHarmony.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${colorHarmony.score * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-purple-700">
                  {Math.round(colorHarmony.score * 100)}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Styling Tips */}
      {reasoning && reasoning.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-2">
                Why This Works
              </h4>
              <ul className="space-y-1">
                {reasoning.map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
