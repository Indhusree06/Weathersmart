"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Cloud } from "lucide-react"
import type { WardrobeItem, WardrobeProfile, MannequinType } from "@/lib/supabase"

interface BodyOptionsPanelProps {
  location: string
  weather: string
  outfitItems: WardrobeItem[]
  mannequinType: MannequinType
  onMannequinTypeChange: (type: MannequinType) => void
  skinTone: number
  onSkinToneChange: (tone: number) => void
  bodyType: string
  onBodyTypeChange: (type: string) => void
  profile: WardrobeProfile | null
}

const SKIN_TONES = [
  { value: 0, bg: '#FBD4C4', label: 'Light' },
  { value: 1, bg: '#F1C5A8', label: 'Fair' },
  { value: 2, bg: '#D4A574', label: 'Medium' },
  { value: 3, bg: '#A67C52', label: 'Tan' },
  { value: 4, bg: '#6B4423', label: 'Deep' }
]

export function BodyOptionsPanel({
  location,
  weather,
  outfitItems,
  mannequinType,
  onMannequinTypeChange,
  skinTone,
  onSkinToneChange,
  bodyType,
  onBodyTypeChange,
  profile
}: BodyOptionsPanelProps) {
  const isAdult = mannequinType.includes('adult') || mannequinType.includes('teen')
  const isChild = mannequinType.includes('boy') || mannequinType.includes('girl') || mannequinType.includes('baby')
  const isMale = mannequinType.includes('male') || mannequinType.includes('boy')

  const getMannequinLabel = () => {
    switch (mannequinType) {
      case 'adult_male': return 'Male'
      case 'adult_female': return 'Female'
      case 'teen_male': return 'Teen Male'
      case 'teen_female': return 'Teen Female'
      case 'boy': return 'Boy'
      case 'girl': return 'Girl'
      case 'baby_boy': return 'Baby Boy'
      case 'baby_girl': return 'Baby Girl'
      default: return 'Neutral'
    }
  }

  const handleGenderToggle = (gender: 'male' | 'female') => {
    if (isAdult && !mannequinType.includes('baby')) {
      if (mannequinType.includes('teen')) {
        onMannequinTypeChange(gender === 'male' ? 'teen_male' : 'teen_female')
      } else {
        onMannequinTypeChange(gender === 'male' ? 'adult_male' : 'adult_female')
      }
    } else if (isChild) {
      onMannequinTypeChange(gender === 'male' ? 'boy' : 'girl')
    }
  }

  return (
    <div className="w-[260px] bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto">
      {/* Weather Section */}
      <Card className="bg-slate-700 border-slate-600 p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Location</h3>
        </div>
        <p className="text-sm text-slate-300">{location}</p>
        
        <div className="flex items-center space-x-2 mt-3 mb-2">
          <Cloud className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Weather</h3>
        </div>
        <p className="text-sm text-slate-300">{weather}</p>
      </Card>

      {/* Selected Items Section */}
      <Card className="bg-slate-700 border-slate-600 p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Selected Items</h3>
        {outfitItems.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No items selected</p>
        ) : (
          <ul className="space-y-2">
            {outfitItems.map((item) => (
              <li key={item.id} className="text-sm text-slate-300 flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span className="flex-1">{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Body Options Section */}
      <Card className="bg-slate-700 border-slate-600 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Body Options</h3>
        
        {/* Mannequin Type */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-2 block">
            Mannequin: <span className="text-white font-medium">{getMannequinLabel()}</span>
            <span className="text-slate-500 ml-1">(from profile)</span>
          </label>
          
          {/* Gender Toggle */}
          <div className="flex space-x-2 mt-2">
            {isAdult && !mannequinType.includes('baby') && (
              <>
                <Button
                  size="sm"
                  variant={isMale ? "default" : "outline"}
                  onClick={() => handleGenderToggle('male')}
                  className={isMale 
                    ? "bg-blue-600 hover:bg-blue-700 text-white flex-1" 
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1"
                  }
                >
                  Male
                </Button>
                <Button
                  size="sm"
                  variant={!isMale ? "default" : "outline"}
                  onClick={() => handleGenderToggle('female')}
                  className={!isMale 
                    ? "bg-pink-600 hover:bg-pink-700 text-white flex-1" 
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1"
                  }
                >
                  Female
                </Button>
              </>
            )}
            {isChild && (
              <>
                <Button
                  size="sm"
                  variant={isMale ? "default" : "outline"}
                  onClick={() => handleGenderToggle('male')}
                  className={isMale 
                    ? "bg-blue-600 hover:bg-blue-700 text-white flex-1" 
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1"
                  }
                >
                  Boy
                </Button>
                <Button
                  size="sm"
                  variant={!isMale ? "default" : "outline"}
                  onClick={() => handleGenderToggle('female')}
                  className={!isMale 
                    ? "bg-pink-600 hover:bg-pink-700 text-white flex-1" 
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1"
                  }
                >
                  Girl
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Skin Tone */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 mb-2 block">Skin Tone</label>
          <div className="flex justify-between space-x-2">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => onSkinToneChange(tone.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  skinTone === tone.value
                    ? 'border-cyan-400 scale-110 shadow-lg'
                    : 'border-slate-500 hover:border-slate-400'
                }`}
                style={{ backgroundColor: tone.bg }}
                title={tone.label}
              />
            ))}
          </div>
        </div>

        {/* Body Type */}
        <div>
          <label className="text-xs text-slate-400 mb-2 block">Silhouette</label>
          <div className="flex space-x-2">
            {isMale ? (
              <>
                <Button
                  size="sm"
                  variant={bodyType === 'slim' ? "default" : "outline"}
                  onClick={() => onBodyTypeChange('slim')}
                  className={bodyType === 'slim'
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white flex-1 text-xs"
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1 text-xs"
                  }
                >
                  Slim
                </Button>
                <Button
                  size="sm"
                  variant={bodyType === 'avg' ? "default" : "outline"}
                  onClick={() => onBodyTypeChange('avg')}
                  className={bodyType === 'avg'
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white flex-1 text-xs"
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1 text-xs"
                  }
                >
                  Avg
                </Button>
                <Button
                  size="sm"
                  variant={bodyType === 'muscular' ? "default" : "outline"}
                  onClick={() => onBodyTypeChange('muscular')}
                  className={bodyType === 'muscular'
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white flex-1 text-xs"
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1 text-xs"
                  }
                >
                  Muscular
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={bodyType === 'slim' ? "default" : "outline"}
                  onClick={() => onBodyTypeChange('slim')}
                  className={bodyType === 'slim'
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white flex-1 text-xs"
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1 text-xs"
                  }
                >
                  Slim
                </Button>
                <Button
                  size="sm"
                  variant={bodyType === 'avg' ? "default" : "outline"}
                  onClick={() => onBodyTypeChange('avg')}
                  className={bodyType === 'avg'
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white flex-1 text-xs"
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1 text-xs"
                  }
                >
                  Avg
                </Button>
                <Button
                  size="sm"
                  variant={bodyType === 'curvy' ? "default" : "outline"}
                  onClick={() => onBodyTypeChange('curvy')}
                  className={bodyType === 'curvy'
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white flex-1 text-xs"
                    : "border-slate-500 text-slate-300 hover:bg-slate-600 flex-1 text-xs"
                  }
                >
                  Curvy
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

