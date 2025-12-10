"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { X, RotateCcw } from "lucide-react"
import Image from "next/image"
import type { WardrobeItem, MannequinSlots, MannequinType, WardrobeItemCategory } from "@/lib/supabase"
import { getItemCategory } from "@/lib/supabase"
import { 
  AdultFemaleSilhouette, 
  AdultMaleSilhouette, 
  ChildBoySilhouette, 
  ChildGirlSilhouette 
} from "./mannequins/MannequinSilhouettes"
import { Button } from "@/components/ui/button"

// Type for clothing textures
export type ClothingTextures = {
  top?: string
  bottom?: string
  shoes?: string
  outerwear?: string
}

// Dynamically import the 3D scene with SSR disabled
// This prevents Three.js from trying to load on the server where WebGL doesn't exist
const MannequinScene3DClient = dynamic(
  () => import('./MannequinScene3DClient').then((mod) => mod.MannequinScene3DClient),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl">
        <div className="text-slate-400 text-sm animate-pulse">Loading 3D Mannequin...</div>
      </div>
    )
  }
)

interface MannequinCanvasProps {
  mannequinType: MannequinType
  slots: MannequinSlots
  onSlotsChange: (slots: MannequinSlots) => void
  isAnimating: boolean
  skinTone: number
  bodyType: string
  aiPreviewUrl?: string | null
  onClearAIPreview?: () => void
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
  bodyType,
  aiPreviewUrl,
  onClearAIPreview
}: MannequinCanvasProps) {
  const [view3D, setView3D] = useState(true) // Toggle between 3D and 2D silhouette view
  const [canvasKey, setCanvasKey] = useState(0) // For resetting the 3D view

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

  const handleResetView = () => {
    // Reset the 3D canvas by changing the key
    setCanvasKey(prev => prev + 1)
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

  // Convert mannequin slots to clothing textures for the 3D scene
  // Maps the current outfit items to image URLs that the 3D mannequin can use as textures
  const clothingTextures: ClothingTextures = {
    top: slots.top?.image_url,
    bottom: slots.bottom?.image_url,
    shoes: slots.shoes?.image_url,
    outerwear: slots.outerwear?.image_url,
  }

  return (
    <div className="flex-1 bg-slate-900 relative flex items-center justify-center">
      {/* Canvas Area */}
      <div className="relative w-full h-full max-w-3xl mx-auto p-8">
        {/* Mannequin Label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 z-10">
          <p className="text-sm font-medium text-white">{getMannequinLabel()}</p>
        </div>

        {/* View Toggle & Reset Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView3D(!view3D)}
            className="bg-slate-800/90 hover:bg-slate-700 text-white border-slate-600"
          >
            {view3D ? '2D View' : '3D View'}
          </Button>
          {view3D && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="bg-slate-800/90 hover:bg-slate-700 text-white border-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Mannequin Container with Animation */}
        <div 
          className={`absolute inset-8 flex items-center justify-center transition-all duration-200 ${
            isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          }`}
        >
          {aiPreviewUrl ? (
            /* Composed Outfit Preview */
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-[600px] h-[700px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700">
                {/* Mannequin Base for Preview */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-full h-full scale-110">
                    {getMannequinSilhouette()}
                  </div>
                </div>
                
                {/* Outfit Items Composed */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Top */}
                  {slots.top && (
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-64 h-48 z-20">
                      <Image
                        src={slots.top.image_url || ''}
                        alt={slots.top.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}
                  
                  {/* Outerwear */}
                  {slots.outerwear && (
                    <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-72 h-52 z-10">
                      <Image
                        src={slots.outerwear.image_url || ''}
                        alt={slots.outerwear.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}
                  
                  {/* Bottom */}
                  {slots.bottom && (
                    <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-60 h-48 z-20">
                      <Image
                        src={slots.bottom.image_url || ''}
                        alt={slots.bottom.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}
                  
                  {/* Shoes */}
                  {slots.shoes && (
                    <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-48 h-32 z-20">
                      <Image
                        src={slots.shoes.image_url || ''}
                        alt={slots.shoes.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}
                </div>
                
                {/* Back button */}
                {onClearAIPreview && (
                  <button
                    onClick={onClearAIPreview}
                    className="absolute top-4 right-4 px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg flex items-center space-x-2 shadow-lg z-30"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Back to Mannequin</span>
                  </button>
                )}
                
                {/* Label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
                  <p className="text-sm font-medium text-white">✨ Composed Outfit Preview</p>
                </div>
              </div>
            </div>
          ) : view3D ? (
            /* 3D Mannequin View */
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950">
              <MannequinScene3DClient key={canvasKey} clothing={clothingTextures} />
            </div>
          ) : (
            /* 2D Silhouette View with Drag & Drop */
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
          )}
        </div>

        {/* Helper Text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-10">
          <p className="text-sm text-slate-400">
            {aiPreviewUrl 
              ? "AI-generated realistic preview of your outfit" 
              : view3D
              ? "🖱️ Drag to rotate • Scroll to zoom • Clothing updates automatically"
              : "Drag clothing items from the right panel onto the mannequin"
            }
          </p>
        </div>
      </div>
    </div>
  )
}

