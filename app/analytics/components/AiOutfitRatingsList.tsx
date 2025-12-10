"use client"

import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { AIOutfitWithRating } from "@/hooks/useAnalyticsData"
import { useState } from "react"
import { Calendar, Star } from "lucide-react"

interface AiOutfitRatingsListProps {
  outfits: AIOutfitWithRating[]
  onRate: (outfitId: string, rating: number) => void
}

export function AiOutfitRatingsList({ outfits, onRate }: AiOutfitRatingsListProps) {
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    outfits.forEach(outfit => {
      initial[outfit.id] = outfit.rating || 5
    })
    return initial
  })

  const handleRatingChange = (outfitId: string, value: number[]) => {
    const newRating = value[0]
    setRatings(prev => ({ ...prev, [outfitId]: newRating }))
    onRate(outfitId, newRating)
  }

  // Calculate aggregate analytics
  const ratedOutfits = Object.values(ratings).filter(r => r > 0)
  const averageRating = ratedOutfits.length > 0
    ? (ratedOutfits.reduce((sum, r) => sum + r, 0) / ratedOutfits.length).toFixed(1)
    : "N/A"

  // Simple insight based on ratings
  const highRatedCount = ratedOutfits.filter(r => r >= 7).length
  const insight = highRatedCount > outfits.length * 0.6
    ? "You're loving most AI recommendations! The AI knows your style well."
    : highRatedCount > outfits.length * 0.3
    ? "You like some AI recommendations. Try adjusting your preferences for better matches."
    : "The AI is still learning your style. Rate more outfits to improve recommendations."

  if (outfits.length === 0) {
    return (
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Outfit Ratings</h3>
        <div className="py-8 text-center text-muted-foreground">
          <p>No AI-generated outfits yet.</p>
          <p className="text-sm mt-2">Visit the AI Outfit Picker to get personalized recommendations!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">AI Outfit Ratings</h3>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
          <p className="text-2xl font-bold text-foreground flex items-center">
            <Star className="w-5 h-5 text-yellow-400 mr-1 fill-yellow-400" />
            {averageRating}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Outfits</p>
          <p className="text-2xl font-bold text-foreground">{outfits.length}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-muted-foreground mb-1">💡 Insight</p>
          <p className="text-sm text-foreground/80">{insight}</p>
        </div>
      </div>

      {/* Outfit List */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        {outfits.slice(0, 10).map((outfit) => (
          <div
            key={outfit.id}
            className="p-4 bg-muted/50 rounded-lg border border-border"
          >
            {/* Outfit Preview */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex space-x-2 flex-1">
                {outfit.items && outfit.items.length > 0 ? (
                  outfit.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="w-16 h-16 rounded-lg overflow-hidden bg-muted/80 flex-shrink-0"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No items available</div>
                )}
              </div>

              <div className="flex-shrink-0">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(outfit.created_at).toLocaleDateString()}</span>
                </div>
                {outfit.occasion && (
                  <div className="text-xs text-slate-500 mt-1">
                    {outfit.occasion}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground/80">
                  Rate this outfit
                </label>
                <span className="text-lg font-bold text-foreground">
                  {ratings[outfit.id] || 5}/10
                </span>
              </div>
              <Slider
                value={[ratings[outfit.id] || 5]}
                onValueChange={(value) => handleRatingChange(outfit.id, value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Not my style</span>
                <span>Love it!</span>
              </div>
            </div>

            {/* AI Response (if available) */}
            {outfit.ai_response && (
              <div className="mt-3 p-3 bg-muted/80/30 rounded text-xs text-foreground/80">
                {outfit.ai_response.slice(0, 150)}
                {outfit.ai_response.length > 150 && "..."}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

