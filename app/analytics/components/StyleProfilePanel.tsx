"use client"

import { Card } from "@/components/ui/card"
import { StyleProfile } from "@/hooks/useAnalyticsData"
import { Palette, Tag, Award } from "lucide-react"

interface StyleProfilePanelProps {
  profile: StyleProfile
}

export function StyleProfilePanel({ profile }: StyleProfilePanelProps) {
  return (
    <Card className="bg-white border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Style Profile</h3>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
            <Palette className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Color Preference</p>
            <p className="text-sm text-slate-700">{profile.colorPreference}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Top Categories</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.topCategories.map((category, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 border border-slate-200"
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
            <p className="text-sm font-medium text-slate-900">Average Condition</p>
            <p className="text-sm text-slate-700">{profile.averageCondition}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-slate-600 mb-2">💡 Style Tip</p>
        <p className="text-sm text-slate-700">
          Your wardrobe shows a preference for {profile.colorPreference.toLowerCase()} and{" "}
          {profile.topCategories[0]?.toLowerCase() || "various items"}. Consider exploring 
          complementary colors to expand your outfit possibilities!
        </p>
      </div>
    </Card>
  )
}

