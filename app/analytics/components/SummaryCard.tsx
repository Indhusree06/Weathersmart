"use client"

import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  image?: string
}

export function SummaryCard({ title, value, subtitle, icon: Icon, image }: SummaryCardProps) {
  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="ml-4 p-3 bg-muted rounded-lg">
            <Icon className="w-6 h-6 text-foreground/80" />
          </div>
        )}
        {image && (
          <div className="ml-4">
            <img 
              src={image} 
              alt={title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
        )}
      </div>
    </Card>
  )
}

