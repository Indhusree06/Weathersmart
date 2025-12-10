"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface CostPerWearDashboardProps {
  items: any[];
}

export default function CostPerWearDashboard({ items }: CostPerWearDashboardProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // Calculate cost per wear for each item
  const itemsWithCPW = items
    .filter(item => item.price && item.price > 0)
    .map(item => {
      const wearCount = item.wear_count || 0;
      const cpw = wearCount > 0 ? item.price / wearCount : item.price;
      
      // Categorize value
      let valueRating = "";
      let color = "";
      if (wearCount === 0) {
        valueRating = "Unworn";
        color = "#6b7280"; // gray
      } else if (cpw < 2) {
        valueRating = "Excellent";
        color = "#10b981"; // green
      } else if (cpw < 5) {
        valueRating = "Good";
        color = "#3b82f6"; // blue
      } else if (cpw < 10) {
        valueRating = "Fair";
        color = "#f59e0b"; // orange
      } else {
        valueRating = "Poor";
        color = "#ef4444"; // red
      }

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        wearCount,
        cpw: parseFloat(cpw.toFixed(2)),
        valueRating,
        color,
        category: item.category,
        image: item.image_path,
      };
    });

  // Filter by selected value rating
  const filteredItems = selectedValue
    ? itemsWithCPW.filter(item => item.valueRating === selectedValue)
    : itemsWithCPW;

  // Calculate statistics
  const totalSpent = itemsWithCPW.reduce((sum, item) => sum + item.price, 0);
  const totalWears = itemsWithCPW.reduce((sum, item) => sum + item.wearCount, 0);
  const avgCPW = totalWears > 0 ? totalSpent / totalWears : 0;
  const unwornCount = itemsWithCPW.filter(item => item.wearCount === 0).length;
  const unwornValue = itemsWithCPW
    .filter(item => item.wearCount === 0)
    .reduce((sum, item) => sum + item.price, 0);

  // Value distribution
  const valueDistribution = [
    {
      rating: "Excellent",
      count: itemsWithCPW.filter(item => item.valueRating === "Excellent").length,
      color: "#10b981",
    },
    {
      rating: "Good",
      count: itemsWithCPW.filter(item => item.valueRating === "Good").length,
      color: "#3b82f6",
    },
    {
      rating: "Fair",
      count: itemsWithCPW.filter(item => item.valueRating === "Fair").length,
      color: "#f59e0b",
    },
    {
      rating: "Poor",
      count: itemsWithCPW.filter(item => item.valueRating === "Poor").length,
      color: "#ef4444",
    },
    {
      rating: "Unworn",
      count: itemsWithCPW.filter(item => item.valueRating === "Unworn").length,
      color: "#6b7280",
    },
  ];

  // Top 5 best value items
  const bestValue = [...itemsWithCPW]
    .filter(item => item.wearCount > 0)
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 5);

  // Top 5 worst value items
  const worstValue = [...itemsWithCPW]
    .filter(item => item.wearCount > 0)
    .sort((a, b) => b.cpw - a.cpw)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white mb-1">{data.name}</p>
          <p className="text-sm text-slate-300">Price: ${data.price}</p>
          <p className="text-sm text-slate-300">Wears: {data.wearCount}</p>
          <p className="text-sm text-slate-300">Cost/Wear: ${data.cpw}</p>
          <p className="text-sm font-semibold" style={{ color: data.color }}>
            {data.valueRating} Value
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Cost-Per-Wear Analysis</h2>
          <p className="text-slate-400">Understand the true value of your wardrobe</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Avg Cost/Wear</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">${avgCPW.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Per wear across wardrobe</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total Spent</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">On {itemsWithCPW.length} items</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Unworn Items</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{unwornCount}</p>
          <p className="text-xs text-slate-500 mt-1">${unwornValue.toFixed(2)} value</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total Wears</span>
            <TrendingDown className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalWears}</p>
          <p className="text-xs text-slate-500 mt-1">Across all items</p>
        </motion.div>
      </div>

      {/* Value Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedValue(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedValue === null
              ? "bg-purple-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          All Items
        </button>
        {valueDistribution.map(({ rating, count, color }) => (
          <button
            key={rating}
            onClick={() => setSelectedValue(rating)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedValue === rating
                ? "text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            style={
              selectedValue === rating
                ? { backgroundColor: color }
                : {}
            }
          >
            {rating} ({count})
          </button>
        ))}
      </div>

      {/* Scatter Plot */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Value Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis
              type="number"
              dataKey="wearCount"
              name="Wears"
              stroke="#9ca3af"
              label={{ value: "Number of Wears", position: "insideBottom", offset: -10, fill: "#9ca3af" }}
              domain={[0, 'dataMax + 2']}
            />
            <YAxis
              type="number"
              dataKey="cpw"
              name="Cost/Wear"
              stroke="#9ca3af"
              label={{ value: "Cost Per Wear ($)", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Items" data={filteredItems}>
              {filteredItems.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="text-sm text-slate-400 mt-4 text-center">
          💡 Lower and to the right = better value. Items worn more with lower cost per wear are your best investments.
        </p>
      </div>

      {/* Value Distribution Bar Chart */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Value Rating Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={valueDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis
              dataKey="rating"
              stroke="#9ca3af"
              label={{ value: "Value Rating", position: "insideBottom", offset: -5, fill: "#9ca3af" }}
            />
            <YAxis
              stroke="#9ca3af"
              label={{ value: "Number of Items", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {valueDistribution.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best and Worst Value Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Value */}
        <div className="bg-gradient-to-br from-green-900/20 to-slate-900/50 rounded-xl p-6 border border-green-700/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Best Value Items</h3>
          </div>
          <div className="space-y-3">
            {bestValue.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-green-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-white text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.wearCount} wears • ${item.price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">${item.cpw}</p>
                  <p className="text-xs text-slate-400">per wear</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Value */}
        <div className="bg-gradient-to-br from-red-900/20 to-slate-900/50 rounded-xl p-6 border border-red-700/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Needs More Wear</h3>
          </div>
          <div className="space-y-3">
            {worstValue.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-white text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.wearCount} wears • ${item.price}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-400">${item.cpw}</p>
                  <p className="text-xs text-slate-400">per wear</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 rounded-xl p-6 border border-blue-700/30">
        <h3 className="text-lg font-semibold text-white mb-4">💡 Value Insights</h3>
        <div className="space-y-3 text-slate-300">
          {unwornCount > 0 && (
            <p>
              • You have <span className="font-semibold text-orange-400">{unwornCount} unworn items</span> worth ${unwornValue.toFixed(2)}. 
              Consider wearing or donating them to maximize your wardrobe value.
            </p>
          )}
          {avgCPW < 3 && (
            <p>
              • Your average cost-per-wear of <span className="font-semibold text-green-400">${avgCPW.toFixed(2)}</span> is excellent! 
              You're getting great value from your wardrobe.
            </p>
          )}
          {avgCPW >= 5 && (
            <p>
              • Your average cost-per-wear of <span className="font-semibold text-orange-400">${avgCPW.toFixed(2)}</span> could be improved. 
              Try wearing your existing items more before buying new ones.
            </p>
          )}
          {worstValue.length > 0 && (
            <p>
              • Focus on wearing your high cost-per-wear items more often to improve their value. 
              Items like "{worstValue[0].name}" need more rotation.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
