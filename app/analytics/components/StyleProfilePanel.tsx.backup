"use client"

import { Card } from "@/components/ui/card"
import { StyleProfile } from "@/hooks/useAnalyticsData"
import { Palette, Tag, Award } from "lucide-react"

interface StyleProfilePanelProps {
  profile: StyleProfile
}

export function StyleProfilePanel({ profile }: StyleProfilePanelProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Your Style Profile</h3>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
            <Palette className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Color Preference</p>
            <p className="text-sm text-slate-300">{profile.colorPreference}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
            <Tag className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Top Categories</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.topCategories.map((category, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
            <Award className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Average Condition</p>
            <p className="text-sm text-slate-300">{profile.averageCondition}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">💡 Style Tip</p>
        <p className="text-sm text-slate-300">
          Your wardrobe shows a preference for {profile.colorPreference.toLowerCase()} and{" "}
          {profile.topCategories[0]?.toLowerCase() || "various items"}. Consider exploring 
          complementary colors to expand your outfit possibilities!
        </p>
      </div>
    </Card>
  )
}

