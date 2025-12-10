"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OutfitRatingProps {
  outfitId: string
  initialRating?: number | null
  onRatingChange?: (rating: number) => void
}

export function OutfitRating({ outfitId, initialRating, onRatingChange }: OutfitRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRate = async (newRating: number) => {
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfitId,
          rating: newRating,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to rate outfit')
      }

      const data = await response.json()
      setRating(newRating)
      
      if (onRatingChange) {
        onRatingChange(newRating)
      }

      // Show success feedback briefly
      setTimeout(() => {
        setError(null)
      }, 2000)
    } catch (err) {
      console.error('Error rating outfit:', err)
      setError(err instanceof Error ? err.message : 'Failed to save rating')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRate(8)}
          disabled={isLoading}
          className={cn(
            "transition-all",
            rating && rating >= 6
              ? "bg-green-600 text-foreground border-green-600 hover:bg-green-700"
              : "bg-muted border-border text-foreground/80 hover:bg-muted/80"
          )}
        >
          {isLoading && rating && rating >= 6 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsUp className="w-4 h-4" />
          )}
          <span className="ml-2">Love it</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRate(3)}
          disabled={isLoading}
          className={cn(
            "transition-all",
            rating && rating < 6
              ? "bg-red-600 text-foreground border-red-600 hover:bg-red-700"
              : "bg-muted border-border text-foreground/80 hover:bg-muted/80"
          )}
        >
          {isLoading && rating && rating < 6 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ThumbsDown className="w-4 h-4" />
          )}
          <span className="ml-2">Not for me</span>
        </Button>
      </div>

      {rating !== null && !isLoading && (
        <p className="text-xs text-muted-foreground">
          {rating >= 6 ? "Thanks! We'll suggest more like this." : "Got it! We'll adjust future suggestions."}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
