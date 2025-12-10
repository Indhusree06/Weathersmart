"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { X, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
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

// Import CSS-based 3D view (no SSR issues)
import { MannequinCSS3D } from './MannequinCSS3D'

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

interface ClothingOverlayProps {
  item: WardrobeItem
  position: 'outerwear' | 'top' | 'bottom' | 'shoes'
  onRemove: () => void
}

// Improved clothing overlay component with proper positioning and scaling
function ClothingOverlay({ item, position, onRemove }: ClothingOverlayProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'outerwear':
        return {
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75%',
          height: '45%',
          zIndex: 15
        }
      case 'top':
        return {
          top: '23%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '65%',
          height: '38%',
          zIndex: 20
        }
      case 'bottom':
        return {
          top: '56%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '35%',
          zIndex: 20
        }
      case 'shoes':
        return {
          bottom: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '45%',
          height: '15%',
          zIndex: 20
        }
    }
  }

  const styles = getPositionStyles()

  return (
    <div
      className="absolute group cursor-pointer transition-all duration-200 hover:scale-105"
      style={styles}
    >
      <div className="relative w-full h-full">
        <Image
          src={item.image_url || '/placeholder-clothing.png'}
          alt={item.name}
          fill
          className="object-contain drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
          }}
        />
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
          title="Remove item"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>
        {/* Item label on hover */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-card/90 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <span className="text-xs text-foreground">{item.name}</span>
        </div>
      </div>
    </div>
  )
}

interface DropZoneProps {
  label: string
  category: WardrobeItemCategory
  item?: WardrobeItem
  onDrop: (item: WardrobeItem) => void
  onClear: () => void
  position: 'top' | 'bottom' | 'outerwear' | 'shoes'
  isVisible: boolean
}

function DropZone({ label, category, item, onDrop, onClear, position, isVisible }: DropZoneProps) {
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
      case 'outerwear':
        return 'top-[20%] left-1/2 -translate-x-1/2 w-[75%] h-[45%] z-10'
      case 'top':
        return 'top-[23%] left-1/2 -translate-x-1/2 w-[65%] h-[38%] z-20'
      case 'bottom':
        return 'top-[56%] left-1/2 -translate-x-1/2 w-[60%] h-[35%] z-20'
      case 'shoes':
        return 'bottom-[25%] left-1/2 -translate-x-1/2 w-[45%] h-[15%] z-20'
    }
  }

  // Only show drop zones when no item is present
  if (item || !isVisible) return null

  return (
    <div
      className={`absolute ${getPositionStyles()} border-2 rounded-lg transition-all ${
        isDragOver
          ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-500/50 scale-105'
          : 'border-dashed border-border/50 bg-card/20 hover:border-slate-400 hover:bg-card/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm px-2 text-center">
        <span className="font-medium">{label}</span>
        <span className="text-xs mt-1 opacity-70">Drag here</span>
      </div>
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
  const [view3D, setView3D] = useState(false) // Default to 2D view for better initial experience
  const [canvasKey, setCanvasKey] = useState(0)
  const [showDropZones, setShowDropZones] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)

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
    setCanvasKey(prev => prev + 1)
    setZoomLevel(1)
  }

  const handleResetAll = () => {
    const newSlots: MannequinSlots = {}
    onSlotsChange(newSlots)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.7))
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

  // Convert mannequin slots to clothing textures for the 3D scene
  const clothingTextures: ClothingTextures = {
    top: slots.top?.image_url,
    bottom: slots.bottom?.image_url,
    shoes: slots.shoes?.image_url,
    outerwear: slots.outerwear?.image_url,
  }

  // Check if any clothing items are present
  const hasClothing = slots.top || slots.bottom || slots.shoes || slots.outerwear

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 relative flex items-center justify-center">
      {/* Canvas Area */}
      <div className="relative w-full h-full max-w-3xl mx-auto p-8">
        {/* Mannequin Label */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border z-10 shadow-lg">
          <p className="text-sm font-medium text-foreground">{getMannequinLabel()}</p>
        </div>

        {/* View Toggle & Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          {!view3D && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="bg-card/90 hover:bg-muted text-foreground border-border"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="bg-card/90 hover:bg-muted text-foreground border-border"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView3D(!view3D)}
            className="bg-card/90 hover:bg-muted text-foreground border-border"
          >
            {view3D ? '2D View' : '3D View'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="bg-card/90 hover:bg-muted text-foreground border-border"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Mannequin Container with Animation */}
        <div 
          className={`absolute inset-8 flex items-center justify-center transition-all duration-200 ${
            isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          }`}
        >
          {aiPreviewUrl ? (
            /* Composed Outfit Preview - Enhanced */
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-[600px] h-[700px] bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-border">
                {/* Mannequin Base for Preview with better visibility */}
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                  <div className="w-full h-full scale-110" style={{ 
                    filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
                  }}>
                    {getMannequinSilhouette()}
                  </div>
                </div>
                
                {/* Outfit Items Composed with improved positioning */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Outerwear - Largest, behind */}
                  {slots.outerwear && (
                    <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-80 h-56 z-10">
                      <Image
                        src={slots.outerwear.image_url || ''}
                        alt={slots.outerwear.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}
                  
                  {/* Top */}
                  {slots.top && (
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-72 h-52 z-20">
                      <Image
                        src={slots.top.image_url || ''}
                        alt={slots.top.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  )}
                  
                  {/* Bottom */}
                  {slots.bottom && (
                    <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-68 h-52 z-20">
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
                    <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-56 h-36 z-20">
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
                    className="absolute top-4 right-4 px-4 py-2 bg-card/90 hover:bg-muted text-foreground rounded-lg flex items-center space-x-2 shadow-lg z-30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Back to Mannequin</span>
                  </button>
                )}
                
                {/* Label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
                  <p className="text-sm font-medium text-foreground">✨ Composed Outfit Preview</p>
                </div>
              </div>
            </div>
          ) : view3D ? (
            /* CSS 3D Mannequin View */
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <MannequinCSS3D 
                key={canvasKey} 
                clothing={clothingTextures}
                onRemoveItem={(type) => handleClear(type as WardrobeItemCategory)}
              />
            </div>
          ) : (
            /* 2D Silhouette View with IMPROVED Clothing Overlay */
            <div 
              className="relative w-96 h-[650px] flex items-center justify-center transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-slate-800/30 to-transparent rounded-2xl" />
              
              {/* Silhouette Base - Now properly visible */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-full h-full opacity-90 drop-shadow-xl">
                  {getMannequinSilhouette()}
                </div>
              </div>

              {/* Clothing Overlays - Rendered ABOVE silhouette */}
              {slots.outerwear && (
                <ClothingOverlay
                  item={slots.outerwear}
                  position="outerwear"
                  onRemove={() => handleClear('outerwear')}
                />
              )}
              
              {slots.top && (
                <ClothingOverlay
                  item={slots.top}
                  position="top"
                  onRemove={() => handleClear('top')}
                />
              )}
              
              {slots.bottom && (
                <ClothingOverlay
                  item={slots.bottom}
                  position="bottom"
                  onRemove={() => handleClear('bottom')}
                />
              )}
              
              {slots.shoes && (
                <ClothingOverlay
                  item={slots.shoes}
                  position="shoes"
                  onRemove={() => handleClear('shoes')}
                />
              )}

              {/* Drop Zones - Only shown when items not present */}
              <DropZone
                label="Outerwear"
                category="outerwear"
                item={slots.outerwear}
                onDrop={(item) => handleDrop('outerwear', item)}
                onClear={() => handleClear('outerwear')}
                position="outerwear"
                isVisible={showDropZones}
              />
              
              <DropZone
                label="Top"
                category="top"
                item={slots.top}
                onDrop={(item) => handleDrop('top', item)}
                onClear={() => handleClear('top')}
                position="top"
                isVisible={showDropZones}
              />
              
              <DropZone
                label="Bottom"
                category="bottom"
                item={slots.bottom}
                onDrop={(item) => handleDrop('bottom', item)}
                onClear={() => handleClear('bottom')}
                position="bottom"
                isVisible={showDropZones}
              />
              
              <DropZone
                label="Shoes"
                category="shoes"
                item={slots.shoes}
                onDrop={(item) => handleDrop('shoes', item)}
                onClear={() => handleClear('shoes')}
                position="shoes"
                isVisible={showDropZones}
              />

              {/* Toggle drop zones visibility */}
              {hasClothing && (
                <button
                  onClick={() => setShowDropZones(!showDropZones)}
                  className="absolute top-2 left-2 px-3 py-1 bg-card/80 hover:bg-muted text-foreground text-xs rounded-lg transition-colors z-30"
                >
                  {showDropZones ? 'Hide Zones' : 'Show Zones'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Helper Text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center z-10 max-w-2xl">
          <p className="text-sm text-muted-foreground bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {aiPreviewUrl 
              ? "✨ Realistic preview of your complete outfit" 
              : view3D
              ? "🖱️ Drag to rotate • Scroll to zoom • Clothing updates automatically"
              : hasClothing
              ? "👆 Click on clothing items to remove • Drag new items from the right panel"
              : "👉 Drag clothing items from the right panel onto the mannequin"
            }
          </p>
        </div>
      </div>
    </div>
  )
}
