"use client"

import { Card } from "@/components/ui/card"
import { WardrobeItem } from "@/lib/supabase"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MostLeastListProps {
  type: "most" | "least"
  items: WardrobeItem[]
}

export function MostLeastList({ type, items }: MostLeastListProps) {
  const title = type === "most" ? "Most Worn Items" : "Least Worn Items"
  const Icon = type === "most" ? TrendingUp : TrendingDown
  const emptyMessage = type === "most" 
    ? "No wear data available yet. Start wearing your items!"
    : "All your items are being worn regularly!"

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className={`w-5 h-5 ${type === "most" ? "text-green-400" : "text-amber-400"}`} />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted/80 flex-shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.category?.name || "Uncategorized"}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-foreground/80">
                    {item.wear_count} {item.wear_count === 1 ? "wear" : "wears"}
                  </span>
                  {item.last_worn && (
                    <span className="text-xs text-slate-500">
                      • Last: {new Date(item.last_worn).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {type === "least" && item.wear_count === 0 && (
                <div className="text-xs text-amber-400 whitespace-nowrap">
                  Never worn
                </div>
              )}
            </div>
          ))}

          {type === "least" && items.some(item => item.wear_count === 0) && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              💡 Consider re-styling or donating items you haven't worn
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

