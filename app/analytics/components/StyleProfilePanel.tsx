"use client"

import { Card } from "@/components/ui/card"
import { Palette, TrendingUp, AlertTriangle, Sparkles, Target } from "lucide-react"

interface StyleProfilePanelProps {
  profile: {
    colorPreference: string
    topCategories: string[]
    averageCondition: string
  }
}

export function StyleProfilePanel({ profile }: StyleProfilePanelProps) {
  // Generate meaningful insights based on profile data
  const generateInsights = () => {
    const insights = []

    // Color diversity insight
    if (profile.colorPreference.toLowerCase().includes("neutral")) {
      insights.push({
        icon: <Palette className="w-4 h-4 text-purple-500" />,
        title: "Add Color Variety",
        description: "Your wardrobe leans heavily on neutral tones. Try adding jewel tones (emerald, sapphire, ruby) to create more versatile outfit combinations.",
        type: "suggestion"
      })
    } else {
      insights.push({
        icon: <Palette className="w-4 h-4 text-green-500" />,
        title: "Great Color Balance",
        description: `You have a good mix of ${profile.colorPreference.toLowerCase()}. Consider adding complementary neutrals for more mixing options.`,
        type: "positive"
      })
    }

    // Category balance insight
    const topCategory = profile.topCategories[0]?.toLowerCase() || "items"
    if (topCategory === "tops") {
      insights.push({
        icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
        title: "Balance Your Categories",
        description: "You have plenty of tops! Consider investing in quality bottoms and outerwear to maximize outfit combinations.",
        type: "suggestion"
      })
    } else if (topCategory === "dresses") {
      insights.push({
        icon: <Sparkles className="w-4 h-4 text-pink-500" />,
        title: "Dress Lover",
        description: "Dresses are your go-to! Add versatile jackets and accessories to transform them for different occasions.",
        type: "positive"
      })
    } else {
      insights.push({
        icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
        title: "Category Focus",
        description: `${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} dominate your wardrobe. Balance with complementary pieces for more variety.`,
        type: "suggestion"
      })
    }

    // Condition insight
    if (profile.averageCondition === "Excellent" || profile.averageCondition === "Very Good") {
      insights.push({
        icon: <Sparkles className="w-4 h-4 text-green-500" />,
        title: "Well-Maintained Wardrobe",
        description: "Your items are in great condition! Keep up the good care habits to maximize their lifespan.",
        type: "positive"
      })
    } else {
      insights.push({
        icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
        title: "Refresh Needed",
        description: "Some items may need repair or replacement. Focus on quality over quantity for your next purchases.",
        type: "warning"
      })
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <Card className="bg-white border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-slate-900">Personalized Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              insight.type === "positive"
                ? "bg-green-50 border-green-200"
                : insight.type === "warning"
                ? "bg-orange-50 border-orange-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{insight.icon}</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500 mb-1">Color Style</p>
            <p className="text-sm font-semibold text-slate-900">{profile.colorPreference}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Top Category</p>
            <p className="text-sm font-semibold text-slate-900">
              {profile.topCategories[0] || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Condition</p>
            <p className="text-sm font-semibold text-slate-900">{profile.averageCondition}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
