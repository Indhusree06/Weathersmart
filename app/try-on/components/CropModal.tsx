"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Crop, RotateCcw } from 'lucide-react'
import Image from 'next/image'

interface CropModalProps {
  imageUrl: string
  itemName: string
  currentCrop?: { x: number; y: number; width: number; height: number }
  onSave: (crop: { x: number; y: number; width: number; height: number }) => void
  onClose: () => void
}

export function CropModal({ imageUrl, itemName, currentCrop, onSave, onClose }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [crop, setCrop] = useState(currentCrop || { x: 0, y: 0, width: 1, height: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      
      // Calculate canvas size
      const maxWidth = 600
      const maxHeight = 600
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      setCanvasSize({ width, height })
      drawCanvas()
    }
    img.onerror = () => {
      console.error('Failed to load image for cropping:', imageUrl)
      alert('Failed to load image. Please check if the image URL is accessible.')
    }
  }, [imageUrl])

  useEffect(() => {
    if (imageLoaded && canvasSize.width > 0) {
      drawCanvas()
    }
  }, [crop, imageLoaded, canvasSize])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || canvasSize.width === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvasSize

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Draw image
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    // Draw semi-transparent overlay over non-cropped areas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    
    // Top overlay
    ctx.fillRect(0, 0, width, crop.y * height)
    // Bottom overlay
    ctx.fillRect(0, (crop.y + crop.height) * height, width, height - (crop.y + crop.height) * height)
    // Left overlay
    ctx.fillRect(0, crop.y * height, crop.x * width, crop.height * height)
    // Right overlay
    ctx.fillRect((crop.x + crop.width) * width, crop.y * height, width - (crop.x + crop.width) * width, crop.height * height)

    // Draw crop rectangle border
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 3
    ctx.strokeRect(crop.x * width, crop.y * height, crop.width * width, crop.height * height)

    // Draw corner handles
    const handleSize = 12
    ctx.fillStyle = '#00ffff'
    // Top-left
    ctx.fillRect(crop.x * width - handleSize / 2, crop.y * height - handleSize / 2, handleSize, handleSize)
    // Top-right
    ctx.fillRect((crop.x + crop.width) * width - handleSize / 2, crop.y * height - handleSize / 2, handleSize, handleSize)
    // Bottom-left
    ctx.fillRect(crop.x * width - handleSize / 2, (crop.y + crop.height) * height - handleSize / 2, handleSize, handleSize)
    // Bottom-right
    ctx.fillRect((crop.x + crop.width) * width - handleSize / 2, (crop.y + crop.height) * height - handleSize / 2, handleSize, handleSize)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvas.width
    const y = (e.clientY - rect.top) / canvas.height

    setIsDragging(true)
    setDragStart({ x, y })
    
    // Start with a small initial crop
    setCrop({ x, y, width: 0.01, height: 0.01 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvasRef.current.width
    const y = (e.clientY - rect.top) / canvasRef.current.height

    // Calculate crop rectangle
    const newX = Math.max(0, Math.min(dragStart.x, x))
    const newY = Math.max(0, Math.min(dragStart.y, y))
    const newWidth = Math.min(1 - newX, Math.abs(x - dragStart.x))
    const newHeight = Math.min(1 - newY, Math.abs(y - dragStart.y))

    setCrop({
      x: newX,
      y: newY,
      width: Math.max(0.01, newWidth),
      height: Math.max(0.01, newHeight)
    })
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      console.log('Crop set:', crop)
    }
  }

  const handleReset = () => {
    setCrop({ x: 0, y: 0, width: 1, height: 1 })
  }

  const handleSave = () => {
    console.log('Saving crop:', crop)
    onSave(crop)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <Crop className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-foreground">Crop {itemName}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-6 flex justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border-2 border-border rounded-lg cursor-crosshair max-w-full"
          />
        </div>

        {/* Instructions */}
        <div className="px-6 pb-4">
          <p className="text-sm text-muted-foreground text-center">
            Click and drag to select the area you want to display on the mannequin
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-border text-foreground/80 hover:bg-card"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground/80 hover:bg-card"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-700 text-foreground"
          >
            <Crop className="w-4 h-4 mr-2" />
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  )
}

