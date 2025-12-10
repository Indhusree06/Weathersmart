"use client"

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Sparkles } from "lucide-react";

interface SimplifiedCostPerWearProps {
  items: any[];
}

export default function SimplifiedCostPerWear({ items }: SimplifiedCostPerWearProps) {
  // Calculate metrics
  const itemsWithPrice = items.filter(item => item.price && item.price > 0);
  
  const totalSpent = itemsWithPrice.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalWears = itemsWithPrice.reduce((sum, item) => sum + (item.wear_count || 0), 0);
  const unwornItems = itemsWithPrice.filter(item => (item.wear_count || 0) === 0);
  const unwornValue = unwornItems.reduce((sum, item) => sum + (item.price || 0), 0);
  
  const avgCPW = totalWears > 0 ? totalSpent / totalWears : 0;

  // Get best and worst value items
  const wornItems = itemsWithPrice
    .filter(item => (item.wear_count || 0) > 0)
    .map(item => ({
      ...item,
      cpw: item.price / (item.wear_count || 1)
    }));

  const bestValue = wornItems
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 3);

  const needsWear = itemsWithPrice
    .filter(item => (item.wear_count || 0) <= 1)
    .sort((a, b) => (b.price || 0) - (a.price || 0))
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Wardrobe Value</h2>
          <p className="text-muted-foreground">Simple insights about your spending and usage</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total Items</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">{itemsWithPrice.length}</p>
          <p className="text-xs text-slate-500 mt-1">In your wardrobe</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total Spent</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">${totalSpent.toFixed(0)}</p>
          <p className="text-xs text-slate-500 mt-1">On all items</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Unworn Items</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">{unwornItems.length}</p>
          <p className="text-xs text-slate-500 mt-1">${unwornValue.toFixed(0)} value</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Avg Cost/Wear</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">${avgCPW.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Per wear</p>
        </motion.div>
      </div>

      {/* Best and Needs Wear Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Value */}
        <div className="bg-gradient-to-br from-green-900/20 to-slate-900/50 rounded-xl p-6 border border-green-700/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-foreground">Best Value Items</h3>
          </div>
          {bestValue.length > 0 ? (
            <div className="space-y-3">
              {bestValue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-card/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.wear_count} wears • ${item.price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">${item.cpw.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">per wear</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Start wearing items to see your best values!</p>
          )}
        </div>

        {/* Needs More Wear */}
        <div className="bg-gradient-to-br from-orange-900/20 to-slate-900/50 rounded-xl p-6 border border-orange-700/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-foreground">Wear These Next</h3>
          </div>
          {needsWear.length > 0 ? (
            <div className="space-y-3">
              {needsWear.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-card/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-orange-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.wear_count || 0} wears • ${item.price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-400">
                      {item.wear_count === 0 ? "Never worn" : "Wear more"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Great job! You're wearing all your items.</p>
          )}
        </div>
      </div>

      {/* Simple Insights */}
      <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 rounded-xl p-6 border border-blue-700/30">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          Quick Tips
        </h3>
        <div className="space-y-3 text-foreground/80">
          {unwornItems.length > 0 && (
            <p className="text-sm">
              💡 You have <span className="font-semibold text-orange-400">{unwornItems.length} unworn items</span> worth ${unwornValue.toFixed(0)}. 
              Try wearing them or consider donating!
            </p>
          )}
          {avgCPW > 0 && avgCPW < 5 && (
            <p className="text-sm">
              ✨ Your average cost-per-wear of <span className="font-semibold text-green-400">${avgCPW.toFixed(2)}</span> is excellent! 
              You're getting great value from your wardrobe.
            </p>
          )}
          {avgCPW >= 10 && (
            <p className="text-sm">
              📈 Your average cost-per-wear is <span className="font-semibold text-orange-400">${avgCPW.toFixed(2)}</span>. 
              Wear your existing items more to improve this!
            </p>
          )}
          {totalWears === 0 && (
            <p className="text-sm">
              🎯 Start tracking your outfits to see valuable insights about your wardrobe usage!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
