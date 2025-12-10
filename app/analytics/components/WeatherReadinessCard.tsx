"use client"

import { Card } from "@/components/ui/card"
import { CloudRain, Snowflake, Sun } from "lucide-react"
import { WeatherReadiness } from "@/hooks/useAnalyticsData"

interface WeatherReadinessCardProps {
  data: WeatherReadiness
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  const percentage = (value / 5) * 100
  
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export function WeatherReadinessCard({ data }: WeatherReadinessCardProps) {
  const getReadinessLevel = (rating: number) => {
    if (rating >= 4) return "Excellent"
    if (rating >= 3) return "Good"
    if (rating >= 2) return "Fair"
    return "Limited"
  }

  const getColorClass = (rating: number) => {
    if (rating >= 4) return "bg-green-500"
    if (rating >= 3) return "bg-blue-500"
    if (rating >= 2) return "bg-orange-400"
    return "bg-red-400"
  }

  return (
    <Card className="bg-white border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Weather Readiness</h3>
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <CloudRain className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-900">Rain Gear</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700">
                {getReadinessLevel(data.rain.rating)}
              </span>
              <p className="text-xs text-slate-500">{data.rain.count} items</p>
            </div>
          </div>
          <ProgressBar value={data.rain.rating} color={getColorClass(data.rain.rating)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-100 rounded-lg">
                <Snowflake className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="text-sm font-medium text-slate-900">Winter Gear</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700">
                {getReadinessLevel(data.winter.rating)}
              </span>
              <p className="text-xs text-slate-500">{data.winter.count} items</p>
            </div>
          </div>
          <ProgressBar value={data.winter.rating} color={getColorClass(data.winter.rating)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg">
                <Sun className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-slate-900">Summer Gear</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700">
                {getReadinessLevel(data.summer.rating)}
              </span>
              <p className="text-xs text-slate-500">{data.summer.count} items</p>
            </div>
          </div>
          <ProgressBar value={data.summer.rating} color={getColorClass(data.summer.rating)} />
        </div>
      </div>
    </Card>
  )
}
