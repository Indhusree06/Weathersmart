"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { CategoryBreakdown } from "@/hooks/useAnalyticsData"

interface WardrobeCategoryChartProps {
  data: CategoryBreakdown[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

export function WardrobeCategoryChart({ data }: WardrobeCategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Wardrobe Categories</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">No items in your wardrobe yet</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Wardrobe Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ category, percentage }) => `${category} (${percentage.toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#1e293b", 
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#fff"
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ color: "#cbd5e1" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}

