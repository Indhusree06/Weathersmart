"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface WardrobeItem {
  id: string
  name: string
  category?: string
  color?: string
  image_url?: string
  worn_count?: number
}

interface SwapItemButtonProps {
  currentItem: WardrobeItem
  alternativeItems: WardrobeItem[]
  onSwap: (newItem: WardrobeItem) => void
  isLoading?: boolean
}

export function SwapItemButton({ 
  currentItem, 
  alternativeItems, 
  onSwap,
  isLoading = false 
}: SwapItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null)

  const handleSwap = (item: WardrobeItem) => {
    setSelectedItem(item)
    onSwap(item)
    setTimeout(() => {
      setIsOpen(false)
      setSelectedItem(null)
    }, 300)
  }

  if (!alternativeItems || alternativeItems.length === 0) {
    return null
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        disabled={isLoading}
        className="absolute top-2 right-2 bg-card/90 hover:bg-muted text-foreground border border-border backdrop-blur-sm z-10"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <RefreshCw className="w-3 h-3" />
        )}
        <span className="ml-1 text-xs">Swap</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Swap {currentItem.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose an alternative item from your wardrobe
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {alternativeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSwap(item)}
                className={cn(
                  "relative group rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                  selectedItem?.id === item.id
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-border hover:border-slate-400"
                )}
              >
                <div className="aspect-square bg-muted relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <RefreshCw className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                </div>
                <div className="p-3 bg-background">
                  <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                  {item.category && (
                    <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                  )}
                  {item.color && (
                    <div className="flex items-center mt-1 space-x-1">
                      <div
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground capitalize truncate">{item.color}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Worn {item.worn_count || 0} times
                  </p>
                </div>
              </button>
            ))}
          </div>

          {alternativeItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No alternative items available in this category</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
