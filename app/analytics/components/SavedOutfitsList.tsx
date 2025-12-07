"use client"

import { Card } from "@/components/ui/card"
import { Outfit } from "@/lib/supabase"
import { Heart, Calendar } from "lucide-react"

interface SavedOutfitsListProps {
  outfits: Outfit[]
}

export function SavedOutfitsList({ outfits }: SavedOutfitsListProps) {
  if (outfits.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Saved Outfits</h3>
        <div className="py-8 text-center text-slate-400">
          <p>No saved outfits yet.</p>
          <p className="text-sm mt-2">Save your favorite combinations to track them here!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Saved Outfits</h3>
        <span className="text-sm text-slate-400">{outfits.length} total</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {outfits.slice(0, 6).map((outfit) => (
          <div
            key={outfit.id}
            className="relative group bg-slate-700/50 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors border border-slate-600"
          >
            {/* Outfit Image/Placeholder */}
            <div className="aspect-square bg-slate-600 flex items-center justify-center">
              {outfit.image_url ? (
                <img
                  src={outfit.image_url}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-center p-4">
                  <div className="text-4xl mb-2">👔</div>
                  <p className="text-xs">No preview</p>
                </div>
              )}
            </div>

            {/* Outfit Info */}
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white truncate flex-1">
                  {outfit.name || "Unnamed Outfit"}
                </h4>
                {outfit.is_favorite && (
                  <Heart className="w-4 h-4 text-red-400 fill-red-400 flex-shrink-0 ml-2" />
                )}
              </div>

              {outfit.occasion && (
                <p className="text-xs text-slate-400 mb-2">{outfit.occasion}</p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(outfit.created_at).toLocaleDateString()}</span>
                </div>
                {outfit.worn_date && (
                  <span>Last worn: {new Date(outfit.worn_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {outfits.length > 6 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            Showing 6 of {outfits.length} outfits
          </p>
        </div>
      )}
    </Card>
  )
}

