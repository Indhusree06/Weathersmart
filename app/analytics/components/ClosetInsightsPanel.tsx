"use client"

import { Card } from "@/components/ui/card"
import { ClosetInsight } from "@/hooks/useAnalyticsData"
import { AlertCircle, Info, CheckCircle } from "lucide-react"

interface ClosetInsightsPanelProps {
  insights: ClosetInsight[]
}

export function ClosetInsightsPanel({ insights }: ClosetInsightsPanelProps) {
  const getIcon = (severity: ClosetInsight["severity"]) => {
    switch (severity) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-400" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getColor = (severity: ClosetInsight["severity"]) => {
    switch (severity) {
      case "warning":
        return "border-amber-500/30 bg-amber-500/10"
      case "success":
        return "border-green-500/30 bg-green-500/10"
      default:
        return "border-blue-500/30 bg-blue-500/10"
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Closet Insights</h3>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${getColor(insight.severity)}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(insight.severity)}</div>
            <p className="text-sm text-slate-200 flex-1">{insight.message}</p>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="py-8 text-center text-slate-400">
          <p>No insights available yet. Keep building your wardrobe!</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">📊 About Insights</p>
        <p className="text-xs text-slate-300">
          These insights are generated based on your wardrobe composition, wear patterns, 
          and seasonal readiness. Use them to make informed decisions about your style and purchases.
        </p>
      </div>
    </Card>
  )
}

