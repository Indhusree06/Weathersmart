"use client"

import { Card } from "@/components/ui/card"
import { CloudRain, Snowflake, Sun, Star } from "lucide-react"
import { WeatherReadiness } from "@/hooks/useAnalyticsData"

interface WeatherReadinessCardProps {
  data: WeatherReadiness
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
          }`}
        />
      ))}
    </div>
  )
}

export function WeatherReadinessCard({ data }: WeatherReadinessCardProps) {
  return (
    <Card className="bg-white border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Weather Readiness</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <CloudRain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Rain Gear</p>
              <p className="text-xs text-slate-600">{data.rain.count} items</p>
            </div>
          </div>
          <StarRating rating={data.rain.rating} />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Snowflake className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Winter Gear</p>
              <p className="text-xs text-slate-600">{data.winter.count} items</p>
            </div>
          </div>
          <StarRating rating={data.winter.rating} />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Sun className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Summer Gear</p>
              <p className="text-xs text-slate-600">{data.summer.count} items</p>
            </div>
          </div>
          <StarRating rating={data.summer.rating} />
        </div>
      </div>
    </Card>
  )
}

