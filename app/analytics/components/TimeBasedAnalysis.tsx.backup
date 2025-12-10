"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar, TrendingUp, DollarSign, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WardrobeItem {
  id: string
  name: string
  category: string
  price: number
  wear_count: number
  last_worn?: string
  created_at: string
  purchase_date?: string
}

interface TimeBasedAnalysisProps {
  items: WardrobeItem[]
}

type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y" | "all"

const TIME_RANGES: { value: TimeRange; label: string; days: number | null }[] = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "3m", label: "Last 3 months", days: 90 },
  { value: "6m", label: "Last 6 months", days: 180 },
  { value: "1y", label: "Last year", days: 365 },
  { value: "all", label: "All time", days: null },
]

export function TimeBasedAnalysis({ items }: TimeBasedAnalysisProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("30d")

  // Calculate filtered data based on time range
  const filteredData = useMemo(() => {
    const range = TIME_RANGES.find(r => r.value === selectedRange)
    if (!range || !range.days) return items

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - range.days)

    return items.filter(item => {
      const itemDate = new Date(item.created_at)
      return itemDate >= cutoffDate
    })
  }, [items, selectedRange])

  // Generate wear frequency data
  const wearFrequencyData = useMemo(() => {
    const range = TIME_RANGES.find(r => r.value === selectedRange)
    const days = range?.days || 365
    const data: { date: string; wears: number; items: number }[] = []

    // Generate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Group by week for longer periods, by day for shorter
    const groupByWeek = days > 90
    const intervals = groupByWeek ? Math.ceil(days / 7) : days

    for (let i = 0; i < intervals; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + (groupByWeek ? i * 7 : i))
      
      const dateStr = groupByWeek 
        ? `Week ${i + 1}`
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      // Calculate wears for this period
      const periodItems = filteredData.filter(item => {
        const itemDate = new Date(item.created_at)
        const periodEnd = new Date(date)
        periodEnd.setDate(periodEnd.getDate() + (groupByWeek ? 7 : 1))
        return itemDate >= date && itemDate < periodEnd
      })

      const totalWears = periodItems.reduce((sum, item) => sum + item.wear_count, 0)

      data.push({
        date: dateStr,
        wears: totalWears,
        items: periodItems.length,
      })
    }

    return data
  }, [filteredData, selectedRange])

  // Generate spending data
  const spendingData = useMemo(() => {
    const range = TIME_RANGES.find(r => r.value === selectedRange)
    const days = range?.days || 365
    const data: { month: string; spending: number; items: number }[] = []

    // Group by month
    const months = Math.ceil(days / 30)
    const endDate = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(endDate)
      monthDate.setMonth(monthDate.getMonth() - i)
      
      const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

      // Calculate spending for this month
      const monthItems = filteredData.filter(item => {
        const itemDate = new Date(item.purchase_date || item.created_at)
        return itemDate.getMonth() === monthDate.getMonth() && 
               itemDate.getFullYear() === monthDate.getFullYear()
      })

      const totalSpending = monthItems.reduce((sum, item) => sum + (item.price || 0), 0)

      data.push({
        month: monthStr,
        spending: totalSpending,
        items: monthItems.length,
      })
    }

    return data
  }, [filteredData, selectedRange])

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalWears = filteredData.reduce((sum, item) => sum + item.wear_count, 0)
    const totalSpending = filteredData.reduce((sum, item) => sum + (item.price || 0), 0)
    const avgWearPerItem = filteredData.length > 0 ? totalWears / filteredData.length : 0
    const itemsAdded = filteredData.length

    return {
      totalWears,
      totalSpending,
      avgWearPerItem: avgWearPerItem.toFixed(1),
      itemsAdded,
    }
  }, [filteredData])

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <CardTitle>Time-Based Analysis</CardTitle>
            </div>
          </div>
          <CardDescription>Track your wardrobe usage and spending over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
                className={selectedRange === range.value ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRange}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wears</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-blue-600"
              >
                {stats.totalWears}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {stats.avgWearPerItem} avg per item
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-green-600"
              >
                ${stats.totalSpending.toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                On {stats.itemsAdded} items
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Added</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-purple-600"
              >
                {stats.itemsAdded}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                New wardrobe items
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost/Wear</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-orange-600"
              >
                ${stats.totalWears > 0 ? (stats.totalSpending / stats.totalWears).toFixed(2) : "0.00"}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Per wear
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Wear Frequency Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`wear-${selectedRange}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Wear Frequency Over Time
              </CardTitle>
              <CardDescription>
                How often you wore items during this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={wearFrequencyData}>
                  <defs>
                    <linearGradient id="colorWears" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wears" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorWears)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Spending Trend Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`spending-${selectedRange}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Spending Trend
              </CardTitle>
              <CardDescription>
                Your wardrobe purchases over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="items" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
