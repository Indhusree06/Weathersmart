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
        return <Info className="w-5 h-5 text-primary" />
    }
  }

  const getColor = (severity: ClosetInsight["severity"]) => {
    switch (severity) {
      case "warning":
        return "border-amber-500/30 bg-amber-500/10"
      case "success":
        return "border-green-500/30 bg-green-500/10"
      default:
        return "border-blue-500/30 bg-primary/10"
    }
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Closet Insights</h3>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 p-3 rounded-lg border ${getColor(insight.severity)}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(insight.severity)}</div>
            <p className="text-sm text-foreground flex-1">{insight.message}</p>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p>No insights available yet. Keep building your wardrobe!</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">📊 About Insights</p>
        <p className="text-xs text-foreground/80">
          These insights are generated based on your wardrobe composition, wear patterns, 
          and seasonal readiness. Use them to make informed decisions about your style and purchases.
        </p>
      </div>
    </Card>
  )
}

