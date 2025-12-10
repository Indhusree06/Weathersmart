"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RotateCcw, X } from 'lucide-react'

export type ClothingTextures = {
  top?: string
  bottom?: string
  shoes?: string
  outerwear?: string
}

interface MannequinCSS3DProps {
  clothing: ClothingTextures
  onRemoveItem?: (type: 'top' | 'bottom' | 'shoes' | 'outerwear') => void
}

export function MannequinCSS3D({ clothing, onRemoveItem }: MannequinCSS3DProps) {
  const [rotationY, setRotationY] = useState(0)
  const [rotationX, setRotationX] = useState(0)

  const handleReset = () => {
    setRotationY(0)
    setRotationX(0)
  }

  const handleRotateLeft = () => {
    setRotationY(prev => prev - 45)
  }

  const handleRotateRight = () => {
    setRotationY(prev => prev + 45)
  }

  const handleRotateUp = () => {
    setRotationX(prev => Math.max(prev - 15, -30))
  }

  const handleRotateDown = () => {
    setRotationX(prev => Math.min(prev + 15, 30))
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 overflow-hidden">
      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3 space-y-2">
          <p className="text-xs text-foreground/80 font-medium">Rotation Controls</p>
          
          {/* Horizontal rotation */}
          <div className="flex items-center justify-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRotateLeft}
              className="border-border text-foreground/80 hover:bg-muted"
            >
              ←
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRotateRight}
              className="border-border text-foreground/80 hover:bg-muted"
            >
              →
            </Button>
          </div>
          
          {/* Vertical rotation */}
          <div className="flex flex-col items-center space-y-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRotateUp}
              className="border-border text-foreground/80 hover:bg-muted w-12"
            >
              ↑
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRotateDown}
              className="border-border text-foreground/80 hover:bg-muted w-12"
            >
              ↓
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="w-full border-border text-foreground/80 hover:bg-muted"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset View
          </Button>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative transition-transform duration-500 ease-out"
          style={{
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
            transformStyle: 'preserve-3d',
            width: '400px',
            height: '600px'
          }}
        >
          {/* Mannequin Base - Simple 3D cylinder shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Torso */}
            <div 
              className="absolute bg-gradient-to-b from-amber-100 to-amber-200 rounded-3xl shadow-2xl"
              style={{
                width: '180px',
                height: '350px',
                top: '80px',
                transform: 'translateZ(0px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.3)'
              }}
            >
              {/* Torso shading for depth */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-amber-50/20 to-transparent" />
            </div>

            {/* Neck */}
            <div 
              className="absolute bg-amber-100 rounded-full shadow-lg"
              style={{
                width: '60px',
                height: '50px',
                top: '50px',
                transform: 'translateZ(0px)'
              }}
            />

            {/* Shoulders - Left */}
            <div 
              className="absolute bg-amber-100 rounded-2xl shadow-lg"
              style={{
                width: '80px',
                height: '40px',
                top: '90px',
                left: '60px',
                transform: 'translateZ(-10px) rotateY(-15deg)',
                transformStyle: 'preserve-3d'
              }}
            />

            {/* Shoulders - Right */}
            <div 
              className="absolute bg-amber-100 rounded-2xl shadow-lg"
              style={{
                width: '80px',
                height: '40px',
                top: '90px',
                right: '60px',
                transform: 'translateZ(-10px) rotateY(15deg)',
                transformStyle: 'preserve-3d'
              }}
            />

            {/* Hip area */}
            <div 
              className="absolute bg-gradient-to-b from-amber-200 to-amber-300 rounded-3xl shadow-lg"
              style={{
                width: '190px',
                height: '100px',
                top: '380px',
                transform: 'translateZ(0px)'
              }}
            />

            {/* Stand pole */}
            <div 
              className="absolute bg-gray-600 shadow-lg"
              style={{
                width: '20px',
                height: '120px',
                top: '480px',
                borderRadius: '10px',
                transform: 'translateZ(0px)'
              }}
            />

            {/* Stand base */}
            <div 
              className="absolute bg-gradient-to-br from-gray-700 to-gray-800 rounded-full shadow-2xl"
              style={{
                width: '200px',
                height: '40px',
                top: '580px',
                transform: 'translateZ(-20px) rotateX(60deg)',
                transformStyle: 'preserve-3d'
              }}
            />
          </div>

          {/* Clothing Layers */}
          
          {/* Outerwear - Outermost layer */}
          {clothing.outerwear && (
            <div
              className="absolute group"
              style={{
                top: '100px',
                left: '50%',
                transform: 'translateX(-50%) translateZ(60px)',
                transformStyle: 'preserve-3d',
                width: '280px',
                height: '320px'
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={clothing.outerwear}
                  alt="Outerwear"
                  fill
                  className="object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                  }}
                />
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem('outerwear')}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Top - Middle layer */}
          {clothing.top && (
            <div
              className="absolute group"
              style={{
                top: '110px',
                left: '50%',
                transform: 'translateX(-50%) translateZ(50px)',
                transformStyle: 'preserve-3d',
                width: '240px',
                height: '280px'
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={clothing.top}
                  alt="Top"
                  fill
                  className="object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                  }}
                />
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem('top')}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bottom - Lower body */}
          {clothing.bottom && (
            <div
              className="absolute group"
              style={{
                top: '340px',
                left: '50%',
                transform: 'translateX(-50%) translateZ(45px)',
                transformStyle: 'preserve-3d',
                width: '220px',
                height: '240px'
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={clothing.bottom}
                  alt="Bottom"
                  fill
                  className="object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                  }}
                />
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem('bottom')}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Shoes - Bottom */}
          {clothing.shoes && (
            <div
              className="absolute group"
              style={{
                top: '520px',
                left: '50%',
                transform: 'translateX(-50%) translateZ(40px)',
                transformStyle: 'preserve-3d',
                width: '180px',
                height: '120px'
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={clothing.shoes}
                  alt="Shoes"
                  fill
                  className="object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                  }}
                />
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem('shoes')}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-card/90 backdrop-blur-sm rounded-full px-6 py-2 border border-border">
        <p className="text-sm text-foreground/80">
          ↔️ Use arrow buttons to rotate • Hover over items to remove
        </p>
      </div>
    </div>
  )
}
