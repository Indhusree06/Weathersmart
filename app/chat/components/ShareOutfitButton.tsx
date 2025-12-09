"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareOutfitButtonProps {
  outfit: any
  weather?: string
  location?: string
}

export function ShareOutfitButton({ outfit, weather, location }: ShareOutfitButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `Check out my outfit for today! ${outfit.items.map((i: any) => i.name).join(", ")}${weather ? ` for ${weather}` : ""}${location ? ` in ${location}` : ""}`

  const handleCopyLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(`${shareText}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Outfit",
          text: shareText,
          url: window.location.href,
        })
      } catch (err) {
        console.error("Share failed:", err)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleExportImage = () => {
    // Create a simple text-based image export
    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext("2d")
    
    if (ctx) {
      // Background
      ctx.fillStyle = "#1e293b"
      ctx.fillRect(0, 0, 800, 600)
      
      // Title
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 32px Arial"
      ctx.fillText("My Outfit", 40, 60)
      
      // Weather/Location
      if (weather || location) {
        ctx.fillStyle = "#94a3b8"
        ctx.font = "20px Arial"
        ctx.fillText(`${location || ""} ${weather || ""}`, 40, 100)
      }
      
      // Items
      ctx.fillStyle = "#ffffff"
      ctx.font = "24px Arial"
      let y = 160
      outfit.items.forEach((item: any, index: number) => {
        ctx.fillText(`${index + 1}. ${item.name}`, 40, y)
        y += 50
      })
      
      // Watermark
      ctx.fillStyle = "#64748b"
      ctx.font = "18px Arial"
      ctx.fillText("Weather Smart - AI Outfit Assistant", 40, 560)
      
      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `outfit-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white w-full"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Outfit
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
        <DropdownMenuItem
          onClick={handleShareNative}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share...
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportImage}
          className="text-slate-200 hover:bg-slate-700 cursor-pointer"
        >
          <Download className="w-4 h-4 mr-2" />
          Export as Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
