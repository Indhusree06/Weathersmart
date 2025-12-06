"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"
import Image from "next/image"
import type { WardrobeItem, MannequinSlots, MannequinType, WardrobeItemCategory } from "@/lib/supabase"
import { getItemCategory } from "@/lib/supabase"
import { 
  AdultFemaleSilhouette, 
  AdultMaleSilhouette, 
  ChildBoySilhouette, 
  ChildGirlSilhouette 
} from "./mannequins/MannequinSilhouettes"

interface MannequinCanvasProps {
  mannequinType: MannequinType
  slots: MannequinSlots
  onSlotsChange: (slots: MannequinSlots) => void
  isAnimating: boolean
  skinTone: number
  bodyType: string
}

interface DropZoneProps {
  label: string
  category: WardrobeItemCategory
  item?: WardrobeItem
  onDrop: (item: WardrobeItem) => void
  onClear: () => void
  position: 'top' | 'bottom' | 'outerwear' | 'shoes'
}

function DropZone({ label, category, item, onDrop, onClear, position }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    try {
      const data = e.dataTransfer.getData('wardrobeItem')
      const droppedItem = JSON.parse(data) as WardrobeItem
      const itemCategory = getItemCategory(droppedItem)
      
      // Check if item matches the expected category
      if (category === 'outerwear') {
        // Outerwear zone accepts both top and outerwear
        if (itemCategory === 'outerwear' || itemCategory === 'top') {
          onDrop(droppedItem)
        }
      } else if (itemCategory === category) {
        onDrop(droppedItem)
      }
    } catch (error) {
      console.error('Error dropping item:', error)
    }
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'top-[28%] left-1/2 -translate-x-1/2 w-56 h-36 z-20'
      case 'outerwear':
        return 'top-[25%] left-1/2 -translate-x-1/2 w-64 h-44 z-10'
      case 'bottom':
        return 'top-[58%] left-1/2 -translate-x-1/2 w-52 h-40 z-20'
      case 'shoes':
        return 'bottom-[8%] left-1/2 -translate-x-1/2 w-40 h-24 z-20'
    }
  }

  return (
    <div
      className={`absolute ${getPositionStyles()} border-2 rounded-lg transition-all ${
        isDragOver
          ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/50'
          : item
          ? 'border-transparent bg-transparent'
          : 'border-dashed border-slate-500 bg-slate-800/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {item ? (
        <div className="relative w-full h-full group">
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <Image
              src={item.image_url || '/placeholder-clothing.png'}
              alt={item.name}
              fill
              className="object-cover"
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}
            />
          </div>
          {/* Clear button */}
          <button
            onClick={onClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm px-2 text-center">
          <span className="font-medium">{label}</span>
          <span className="text-xs mt-1 opacity-70">Drag here</span>
        </div>
      )}
    </div>
  )
}

export function MannequinCanvas({
  mannequinType,
  slots,
  onSlotsChange,
  isAnimating,
  skinTone,
  bodyType
}: MannequinCanvasProps) {
  const handleDrop = (category: WardrobeItemCategory, item: WardrobeItem) => {
    const newSlots = { ...slots }
    
    switch (category) {
      case 'top':
        newSlots.top = item
        break
      case 'bottom':
        newSlots.bottom = item
        break
      case 'outerwear':
        newSlots.outerwear = item
        break
      case 'shoes':
        newSlots.shoes = item
        break
      case 'accessory':
        if (!newSlots.accessories) newSlots.accessories = []
        newSlots.accessories.push(item)
        break
    }
    
    onSlotsChange(newSlots)
  }

  const handleClear = (category: WardrobeItemCategory) => {
    const newSlots = { ...slots }
    
    switch (category) {
      case 'top':
        delete newSlots.top
        break
      case 'bottom':
        delete newSlots.bottom
        break
      case 'outerwear':
        delete newSlots.outerwear
        break
      case 'shoes':
        delete newSlots.shoes
        break
    }
    
    onSlotsChange(newSlots)
  }

  const getMannequinLabel = () => {
    switch (mannequinType) {
      case 'adult_male': return 'Adult Male'
      case 'adult_female': return 'Adult Female'
      case 'teen_male': return 'Teen Male'
      case 'teen_female': return 'Teen Female'
      case 'boy': return 'Boy'
      case 'girl': return 'Girl'
      case 'baby_boy': return 'Baby Boy'
      case 'baby_girl': return 'Baby Girl'
      default: return 'Neutral'
    }
  }

  const getSkinToneColor = () => {
    const tones = ['#FBD4C4', '#F1C5A8', '#D4A574', '#A67C52', '#6B4423']
    return tones[skinTone] || tones[2]
  }

  const getMannequinSilhouette = () => {
    switch (mannequinType) {
      case 'adult_male':
      case 'teen_male':
        return <AdultMaleSilhouette />
      case 'adult_female':
      case 'teen_female':
        return <AdultFemaleSilhouette />
      case 'boy':
      case 'baby_boy':
        return <ChildBoySilhouette />
      case 'girl':
      case 'baby_girl':
        return <ChildGirlSilhouette />
      default:
        return <AdultFemaleSilhouette />
    }
  }

  const getPositionStyles = (position: string) => {
    switch (position) {
      case 'top':
        return 'top-[28%] left-1/2 -translate-x-1/2 w-56 h-36 z-20'
      case 'outerwear':
        return 'top-[25%] left-1/2 -translate-x-1/2 w-64 h-44 z-10'
      case 'bottom':
        return 'top-[58%] left-1/2 -translate-x-1/2 w-52 h-40 z-20'
      case 'shoes':
        return 'bottom-[8%] left-1/2 -translate-x-1/2 w-40 h-24 z-20'
      default:
        return ''
    }
  }

  return (
    <div className="flex-1 bg-slate-900 relative flex items-center justify-center">
      {/* Canvas Area */}
      <div className="relative w-full h-full max-w-3xl mx-auto p-8">
        {/* Mannequin Label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 z-10">
          <p className="text-sm font-medium text-white">{getMannequinLabel()}</p>
        </div>

        {/* Mannequin Container with Animation */}
        <div 
          className={`absolute inset-8 flex items-center justify-center transition-all duration-200 ${
            isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          }`}
        >
          {/* Mannequin Silhouette */}
          <div className="relative w-80 h-[600px] flex items-center justify-center">
            {/* Silhouette Base */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-full h-full opacity-90">
                {getMannequinSilhouette()}
              </div>
            </div>

            {/* Drop Zones - Now with z-index for layering */}
            <DropZone
              label="Top"
              category="top"
              item={slots.top}
              onDrop={(item) => handleDrop('top', item)}
              onClear={() => handleClear('top')}
              position="top"
            />
            
            <DropZone
              label="Outerwear"
              category="outerwear"
              item={slots.outerwear}
              onDrop={(item) => handleDrop('outerwear', item)}
              onClear={() => handleClear('outerwear')}
              position="outerwear"
            />
            
            <DropZone
              label="Bottom"
              category="bottom"
              item={slots.bottom}
              onDrop={(item) => handleDrop('bottom', item)}
              onClear={() => handleClear('bottom')}
              position="bottom"
            />
            
            <DropZone
              label="Shoes"
              category="shoes"
              item={slots.shoes}
              onDrop={(item) => handleDrop('shoes', item)}
              onClear={() => handleClear('shoes')}
              position="shoes"
            />
          </div>
        </div>

        {/* Helper Text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm text-slate-500">
            Drag clothing items from the right panel onto the mannequin
          </p>
        </div>
      </div>
    </div>
  )
}

