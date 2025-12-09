"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  AreaChart,
  Area
} from "recharts"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Grid3x3, Layers } from "lucide-react"

interface WardrobeItem {
  id: string
  name: string
  category: string
  price: number
  wear_count: number
  color?: string
}

interface AdvancedChartsProps {
  items: WardrobeItem[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

export function AdvancedCharts({ items }: AdvancedChartsProps) {
  const [activeChart, setActiveChart] = useState<"bubble" | "radar" | "treemap" | "area">("bubble")

  // Prepare Bubble Chart Data (Cost vs Wear Frequency)
  const bubbleData = items
    .filter(item => item.wear_count > 0)
    .map(item => ({
      name: item.name,
      x: item.wear_count,
      y: item.price,
      z: item.price / (item.wear_count || 1), // Cost per wear
      category: item.category,
      color: item.color
    }))

  // Prepare Radar Chart Data (Style Profile)
  const categoryStats = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, wears: 0, value: 0 }
    }
    acc[item.category].count++
    acc[item.category].wears += item.wear_count
    acc[item.category].value += item.price
    return acc
  }, {} as Record<string, { count: number; wears: number; value: number }>)

  const radarData = Object.entries(categoryStats).map(([category, stats]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count: stats.count,
    wears: stats.wears,
    value: Math.round(stats.value)
  }))

  // Prepare Treemap Data (Hierarchical Categories)
  const treemapData = Object.entries(categoryStats).map(([category, stats], index) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    size: stats.count,
    value: stats.value,
    fill: COLORS[index % COLORS.length]
  }))

  // Prepare Area Chart Data (Cumulative Value Over Time)
  const sortedItems = [...items].sort((a, b) => {
    // Sort by creation date (using ID as proxy since we don't have created_at)
    return a.id.localeCompare(b.id)
  })

  let cumulativeValue = 0
  let cumulativeItems = 0
  const areaData = sortedItems.slice(0, 30).map((item, index) => {
    cumulativeValue += item.price
    cumulativeItems++
    return {
      index: index + 1,
      value: cumulativeValue,
      items: cumulativeItems,
      avgValue: cumulativeValue / cumulativeItems
    }
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-white mb-1">{data.name}</p>
          {data.category && <p className="text-xs text-slate-400">Category: {data.category}</p>}
          {data.x !== undefined && <p className="text-sm text-blue-400">Wears: {data.x}</p>}
          {data.y !== undefined && <p className="text-sm text-green-400">Price: ${data.y.toFixed(2)}</p>}
          {data.z !== undefined && <p className="text-sm text-orange-400">Cost/Wear: ${data.z.toFixed(2)}</p>}
        </div>
      )
    }
    return null
  }

  const TreemapContent = ({ x, y, width, height, name, size, fill }: any) => {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke="#1e293b"
          strokeWidth={2}
          opacity={0.8}
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize={12}
            >
              {size} items
            </text>
          </>
        )}
      </g>
    )
  }

  return (
    <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <CardTitle>Advanced Analytics</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeChart === "bubble" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("bubble")}
              className={activeChart === "bubble" ? "bg-blue-600" : "border-slate-600"}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Bubble
            </Button>
            <Button
              variant={activeChart === "radar" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("radar")}
              className={activeChart === "radar" ? "bg-purple-600" : "border-slate-600"}
            >
              <Grid3x3 className="h-4 w-4 mr-1" />
              Radar
            </Button>
            <Button
              variant={activeChart === "treemap" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("treemap")}
              className={activeChart === "treemap" ? "bg-green-600" : "border-slate-600"}
            >
              <Layers className="h-4 w-4 mr-1" />
              Treemap
            </Button>
            <Button
              variant={activeChart === "area" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("area")}
              className={activeChart === "area" ? "bg-orange-600" : "border-slate-600"}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Area
            </Button>
          </div>
        </div>
        <CardDescription>
          {activeChart === "bubble" && "Cost vs. Wear Frequency - Bubble size shows cost-per-wear"}
          {activeChart === "radar" && "Multi-dimensional wardrobe profile across categories"}
          {activeChart === "treemap" && "Hierarchical view of wardrobe composition by category"}
          {activeChart === "area" && "Cumulative wardrobe value growth over time"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeChart === "bubble" && (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Wears"
                  stroke="#9ca3af"
                  label={{ value: "Number of Wears", position: "bottom", fill: "#9ca3af" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Price"
                  stroke="#9ca3af"
                  label={{ value: "Price ($)", angle: -90, position: "left", fill: "#9ca3af" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Scatter
                  name="Items"
                  data={bubbleData}
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}

          {activeChart === "radar" && (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar
                  name="Item Count"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Total Wears"
                  dataKey="wears"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px"
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {activeChart === "treemap" && (
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="#1e293b"
                fill="#3b82f6"
                content={<TreemapContent />}
              />
            </ResponsiveContainer>
          )}

          {activeChart === "area" && (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="index"
                  stroke="#9ca3af"
                  label={{ value: "Items Added", position: "bottom", fill: "#9ca3af" }}
                />
                <YAxis
                  stroke="#9ca3af"
                  label={{ value: "Value ($)", angle: -90, position: "left", fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px"
                  }}
                />
                <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  name="Total Value"
                />
                <Area
                  type="monotone"
                  dataKey="avgValue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorAvg)"
                  name="Avg Value"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
          <p className="text-sm text-slate-300">
            {activeChart === "bubble" && "💡 Larger bubbles = higher cost per wear. Items in the top-left are expensive but rarely worn."}
            {activeChart === "radar" && "💡 The radar shows your wardrobe balance. Larger areas indicate more items and usage in that category."}
            {activeChart === "treemap" && "💡 Larger rectangles = more items in that category. Hover to see exact counts."}
            {activeChart === "area" && "💡 Shows how your wardrobe value has grown. The gap between lines shows average item value."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
