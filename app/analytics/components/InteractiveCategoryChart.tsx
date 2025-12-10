"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { CategoryBreakdown } from "@/hooks/useAnalyticsData"
import { motion, AnimatePresence } from "framer-motion"
import { PieChartIcon, X, ArrowLeft, TrendingUp } from "lucide-react"

interface WardrobeItem {
  id: string
  name: string
  category: string
  price: number
  wear_count: number
  color?: string
  image_path?: string
}

interface InteractiveCategoryChartProps {
  data: CategoryBreakdown[]
  allItems: WardrobeItem[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

export function InteractiveCategoryChart({ data, allItems }: InteractiveCategoryChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  // Get items for selected category
  const selectedCategoryItems = selectedCategory
    ? allItems.filter(item => item.category === selectedCategory)
    : []

  // Sort items by wear count for drill-down
  const sortedCategoryItems = [...selectedCategoryItems].sort((a, b) => b.wear_count - a.wear_count)

  // Handle pie slice click
  const handlePieClick = (entry: CategoryBreakdown) => {
    setSelectedCategory(entry.category)
  }

  // Close drill-down
  const handleClose = () => {
    setSelectedCategory(null)
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Wardrobe Categories
          </CardTitle>
          <CardDescription>Click on any category to see details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No items in your wardrobe yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <CardTitle>Wardrobe Categories</CardTitle>
          </div>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </Button>
          )}
        </div>
        <CardDescription>
          {selectedCategory ? `Viewing ${selectedCategory}` : "Click on any category to see details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            // Pie Chart View
            <motion.div
              key="pie-chart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={hoveredCategory ? 110 : 100}
                    label={({ category, percentage }) => `${category} (${percentage.toFixed(0)}%)`}
                    labelLine={false}
                    onClick={(entry) => handlePieClick(entry)}
                    onMouseEnter={(entry) => setHoveredCategory(entry.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        opacity={hoveredCategory === null || hoveredCategory === entry.category ? 1 : 0.5}
                        style={{
                          filter: hoveredCategory === entry.category ? 'brightness(1.2)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                            <p className="font-semibold text-foreground mb-1">{data.category}</p>
                            <p className="text-sm text-foreground/80">Count: {data.count}</p>
                            <p className="text-sm text-foreground/80">Percentage: {data.percentage.toFixed(1)}%</p>
                            <p className="text-xs text-primary mt-2">Click to view items</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ color: "#cbd5e1" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  💡 Click on any slice to see items in that category
                </p>
              </div>
            </motion.div>
          ) : (
            // Drill-Down View
            <motion.div
              key="drill-down"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
                <div>
                  <h3 className="text-xl font-bold text-foreground capitalize">{selectedCategory}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategoryItems.length} items • {selectedCategoryItems.reduce((sum, item) => sum + item.wear_count, 0)} total wears
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="border-border text-foreground/80 hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>

              {/* Wear Frequency Bar Chart */}
              <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Wear Frequency
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sortedCategoryItems.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      fontSize={11}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="wear_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-semibold text-foreground sticky top-0 bg-card py-2">
                  All Items ({selectedCategoryItems.length})
                </h4>
                {sortedCategoryItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.image_path && (
                        <img
                          src={item.image_path}
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.color && `${item.color} • `}
                          ${item.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{item.wear_count} wears</p>
                      {item.wear_count > 0 && item.price && (
                        <p className="text-xs text-slate-500">
                          ${(item.price / item.wear_count).toFixed(2)}/wear
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
