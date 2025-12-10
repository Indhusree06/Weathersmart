"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WardrobeItem } from "@/lib/supabase"
import { Recycle, Heart, AlertCircle, TrendingUp } from "lucide-react"
import { useState } from "react"

interface LifecycleAlert {
  item: WardrobeItem
  reasons: string[]
  costPerWear: number
  ageInDays: number
  ageDisplay: string
  severity: "high" | "medium" | "low"
}

interface LifecycleAlertsPanelProps {
  items: WardrobeItem[]
}

// Helper to parse money values
const parseMoney = (value: unknown): number => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const n = Number(value.replace(/[^0-9.]/g, ""))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

// Calculate item age
const calculateItemAge = (purchaseDate: string): { display: string; days: number } => {
  try {
    const purchase = new Date(purchaseDate)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - purchase.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    let years = today.getFullYear() - purchase.getFullYear()
    let months = today.getMonth() - purchase.getMonth()
    let days = today.getDate() - purchase.getDate()

    if (days < 0) {
      months -= 1
      const prevMonthDate = new Date(today.getFullYear(), today.getMonth(), 0)
      days += prevMonthDate.getDate()
    }
    if (months < 0) {
      years -= 1
      months += 12
    }

    const parts: string[] = []
    if (years > 0) parts.push(`${years}y`)
    if (months > 0) parts.push(`${months}m`)
    if (days > 0 || parts.length === 0) parts.push(`${days}d`)

    return { display: parts.join(" "), days: diffDays }
  } catch {
    return { display: "Unknown", days: 0 }
  }
}

// Get lifecycle alert reasons
const getLifecycleAlerts = (items: WardrobeItem[]): LifecycleAlert[] => {
  const alerts: LifecycleAlert[] = []

  items.forEach(item => {
    const reasons: string[] = []
    const wears = item.wear_count ?? 0
    const priceNum = parseMoney(item.price)
    const cpw = priceNum > 0 && wears > 0 ? priceNum / wears : 0

    let ageDisplay = ""
    let ageInDays = 0

    if (item.purchase_date) {
      const age = calculateItemAge(item.purchase_date)
      ageDisplay = age.display
      ageInDays = age.days
    }

    // High wear count (consider donating/replacing)
    if (wears >= 50) {
      reasons.push(`Heavy use: ${wears} wears`)
    }

    // High cost per wear (low value)
    if (cpw > 5 && wears > 0) {
      reasons.push(`High cost/wear: $${cpw.toFixed(2)}`)
    }

    // Old item (2+ years)
    if (ageInDays >= 730) {
      reasons.push(`Old: ${Math.floor(ageInDays / 365)}+ years`)
    }

    // Low usage (owned 6+ months but <5 wears)
    if (ageInDays >= 180 && wears < 5) {
      reasons.push(`Rarely worn: ${wears} wears in ${Math.floor(ageInDays / 30)} months`)
    }

    // Never worn but old
    if (wears === 0 && ageInDays >= 90) {
      reasons.push("Never worn")
    }

    if (reasons.length > 0) {
      // Determine severity
      let severity: "high" | "medium" | "low" = "low"
      if (wears === 0 && ageInDays >= 180) severity = "high"
      else if (cpw > 10 || (wears >= 80)) severity = "high"
      else if (cpw > 5 || wears >= 50 || ageInDays >= 730) severity = "medium"

      alerts.push({
        item,
        reasons: reasons.slice(0, 2), // Show max 2 reasons
        costPerWear: cpw,
        ageInDays,
        ageDisplay,
        severity,
      })
    }
  })

  // Sort by severity (high first), then by wear count
  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return (b.item.wear_count || 0) - (a.item.wear_count || 0)
  })
}

export function LifecycleAlertsPanel({ items }: LifecycleAlertsPanelProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const alerts = getLifecycleAlerts(items).filter(alert => !dismissedIds.has(alert.item.id))

  const handleDismiss = (itemId: string) => {
    setDismissedIds(prev => new Set(prev).add(itemId))
  }

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high": return "border-red-500/30 bg-red-500/10"
      case "medium": return "border-amber-500/30 bg-amber-500/10"
      default: return "border-blue-500/30 bg-primary/10"
    }
  }

  const getSeverityIcon = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high": return <AlertCircle className="w-5 h-5 text-red-400" />
      case "medium": return <TrendingUp className="w-5 h-5 text-amber-400" />
      default: return <Heart className="w-5 h-5 text-primary" />
    }
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Lifecycle Alerts</h3>
        <div className="py-8 text-center">
          <Heart className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-foreground/80">All items are in good lifecycle status!</p>
          <p className="text-sm text-slate-500 mt-2">
            No items need attention for donation, repair, or replacement.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Lifecycle Alerts</h3>
        <span className="text-sm text-muted-foreground">{alerts.length} item{alerts.length !== 1 ? 's' : ''} need attention</span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {alerts.slice(0, 10).map((alert) => (
          <div
            key={alert.item.id}
            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start space-x-4">
              {/* Item Image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted/80 flex-shrink-0">
                {alert.item.image_url ? (
                  <img
                    src={alert.item.image_url}
                    alt={alert.item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Alert Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{alert.item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.item.category?.name || "Uncategorized"}
                    </p>
                  </div>
                  {getSeverityIcon(alert.severity)}
                </div>

                {/* Reasons */}
                <div className="space-y-1 mb-3">
                  {alert.reasons.map((reason, idx) => (
                    <p key={idx} className="text-xs text-foreground/80">
                      • {reason}
                    </p>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  <span>{alert.item.wear_count || 0} wears</span>
                  {alert.costPerWear > 0 && (
                    <span>CPW: ${alert.costPerWear.toFixed(2)}</span>
                  )}
                  {alert.ageDisplay && (
                    <span>Age: {alert.ageDisplay}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 bg-muted hover:bg-muted/80 text-foreground border-border"
                    onClick={() => handleDismiss(alert.item.id)}
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    Keep
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 bg-muted hover:bg-muted/80 text-foreground border-border"
                    onClick={() => handleDismiss(alert.item.id)}
                  >
                    <Recycle className="w-3 h-3 mr-1" />
                    Donate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2">💡 Lifecycle Tips</p>
        <div className="space-y-1 text-xs text-foreground/80">
          <p>• Items with 50+ wears may need replacement</p>
          <p>• Never worn items for 3+ months? Consider donating</p>
          <p>• High cost/wear items ($5+) aren't providing good value</p>
          <p>• Items 2+ years old should be evaluated for condition</p>
        </div>
      </div>
    </Card>
  )
}

