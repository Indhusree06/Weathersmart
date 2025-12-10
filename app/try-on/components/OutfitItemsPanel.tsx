"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Hand, Check } from "lucide-react"
import Image from "next/image"
import type { WardrobeItem, MannequinSlots, getItemCategory } from "@/lib/supabase"
import { getItemCategory as getCat } from "@/lib/supabase"

interface OutfitItemsPanelProps {
  outfitItems: WardrobeItem[]
  currentSlots: MannequinSlots
  onApplyItem: (item: WardrobeItem) => void
}

export function OutfitItemsPanel({
  outfitItems,
  currentSlots,
  onApplyItem
}: OutfitItemsPanelProps) {
  const isItemApplied = (item: WardrobeItem): boolean => {
    return Object.values(currentSlots).flat().some((slotItem) => slotItem?.id === item.id)
  }

  const getCategoryLabel = (item: WardrobeItem): string => {
    const category = getCat(item)
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="w-[300px] bg-card border-l border-border p-4 overflow-y-auto">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">Recommended Outfit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Drag items onto the mannequin or click Apply
        </p>
      </div>

      {/* Outfit Items */}
      <div className="space-y-3">
        {outfitItems.length === 0 ? (
          <Card className="bg-muted border-border p-4">
            <p className="text-sm text-muted-foreground text-center italic">
              No outfit items to display
            </p>
          </Card>
        ) : (
          outfitItems.map((item) => (
            <Card
              key={item.id}
              className="bg-muted border-border p-3 hover:bg-slate-650 transition-colors cursor-pointer"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('wardrobeItem', JSON.stringify(item))
                e.dataTransfer.effectAllowed = 'copy'
              }}
            >
              <div className="flex space-x-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 bg-card rounded-md overflow-hidden relative">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getCategoryLabel(item)}
                  </p>
                  {item.color && (
                    <p className="text-xs text-slate-500 mt-1">
                      Color: {item.color}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-foreground/80 hover:bg-muted/80 text-xs h-7 px-2"
                      disabled
                    >
                      <Hand className="w-3 h-3 mr-1" />
                      Drag
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onApplyItem(item)}
                      disabled={isItemApplied(item)}
                      className={isItemApplied(item)
                        ? "bg-green-700 text-foreground text-xs h-7 px-2 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-foreground text-xs h-7 px-2"
                      }
                    >
                      {isItemApplied(item) ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Applied
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Optional: Alternatives Section */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Alternatives</h3>
        <Card className="bg-muted border-border p-4">
          <p className="text-xs text-slate-500 text-center italic">
            Coming soon: Alternative item suggestions
          </p>
        </Card>
      </div>
    </div>
  )
}

