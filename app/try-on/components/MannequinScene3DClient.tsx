"use client"

import { useEffect, useState, Suspense } from 'react'
import { CropModal } from './CropModal'
import { Button } from '@/components/ui/button'
import { Crop, Save, RotateCcw } from 'lucide-react'

export type ClothingTextures = {
  top?: string
  bottom?: string
  shoes?: string
  outerwear?: string
}

export type ClothingPosition = {
  position: [number, number, number]
  size: [number, number]
  crop: { x: number; y: number; width: number; height: number }
}

export type ClothingPositions = {
  top?: ClothingPosition
  bottom?: ClothingPosition
  shoes?: ClothingPosition
  outerwear?: ClothingPosition
}

interface Props {
  clothing: ClothingTextures
  onSavePositions?: (positions: ClothingPositions) => void
}

// This component ensures Three.js only loads in the browser
export function MannequinScene3DClient({ clothing, onSavePositions }: Props) {
  const [mounted, setMounted] = useState(false)
  const [ThreeComponents, setThreeComponents] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<'top' | 'bottom' | 'shoes' | 'outerwear' | null>(null)
  const [cropModalItem, setCropModalItem] = useState<{type: 'top' | 'bottom' | 'shoes' | 'outerwear', url: string, name: string} | null>(null)
  
  // Track positions and crops for each clothing item
  const [positions, setPositions] = useState<ClothingPositions>({
    top: { position: [0, 0.85, 0.52], size: [1.15, 1.2], crop: { x: 0, y: 0, width: 1, height: 1 } },
    bottom: { position: [0, -0.3, 0.53], size: [1.1, 1.3], crop: { x: 0, y: 0, width: 1, height: 1 } },
    shoes: { position: [0, -1.3, 0.55], size: [0.95, 0.55], crop: { x: 0, y: 0, width: 1, height: 1 } },
    outerwear: { position: [0, 0.8, 0.48], size: [1.3, 1.5], crop: { x: 0, y: 0, width: 1, height: 1 } },
  })

  useEffect(() => {
    setMounted(true)
    
    // Only import Three.js modules in the browser after mount
    if (typeof window !== 'undefined') {
      Promise.all([
        import('@react-three/fiber'),
        import('@react-three/drei'),
        import('./Mannequin3D'),
        import('./InteractiveClothingLayer')
      ]).then(([fiber, drei, mannequin, interactive]) => {
        setThreeComponents({
          Canvas: fiber.Canvas,
          OrbitControls: drei.OrbitControls,
          TransformControls: drei.TransformControls,
          SimpleMannequin: mannequin.SimpleMannequin,
          ClothingLayer: mannequin.ClothingLayer,
          InteractiveClothingLayer: interactive.InteractiveClothingLayer
        })
      }).catch((error) => {
        console.error('Failed to load 3D scene:', error)
      })
    }
  }, [])

  const handlePositionChange = (type: 'top' | 'bottom' | 'shoes' | 'outerwear', newPosition: [number, number, number]) => {
    setPositions(prev => ({
      ...prev,
      [type]: { ...prev[type]!, position: newPosition }
    }))
  }

  const handleCropSave = (crop: { x: number; y: number; width: number; height: number }) => {
    if (!cropModalItem) return
    
    console.log('Applying crop to', cropModalItem.type, ':', crop)
    
    setPositions(prev => {
      const newPositions = {
        ...prev,
        [cropModalItem.type]: { ...prev[cropModalItem.type]!, crop }
      }
      console.log('New positions:', newPositions)
      return newPositions
    })
    
    setCropModalItem(null)
  }

  const handleReset = () => {
    // Deselect any selected item first
    setSelectedItem(null)
    
    // Reset positions with a small delay to ensure deselection happens first
    setTimeout(() => {
      setPositions({
        top: { position: [0, 0.85, 0.52], size: [1.15, 1.2], crop: { x: 0, y: 0, width: 1, height: 1 } },
        bottom: { position: [0, -0.3, 0.53], size: [1.1, 1.3], crop: { x: 0, y: 0, width: 1, height: 1 } },
        shoes: { position: [0, -1.3, 0.55], size: [0.95, 0.55], crop: { x: 0, y: 0, width: 1, height: 1 } },
        outerwear: { position: [0, 0.8, 0.48], size: [1.3, 1.5], crop: { x: 0, y: 0, width: 1, height: 1 } },
      })
    }, 100)
  }

  const handleSavePositions = () => {
    if (onSavePositions) {
      onSavePositions(positions)
    }
    alert('Positions saved! Your custom positioning will be preserved.')
  }

  if (!mounted || !ThreeComponents) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="text-muted-foreground text-sm animate-pulse">Loading 3D View...</div>
      </div>
    )
  }

  const { Canvas, OrbitControls, TransformControls, SimpleMannequin, InteractiveClothingLayer } = ThreeComponents

  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        {selectedItem && (
          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs text-foreground/80 font-medium uppercase">{selectedItem} Selected</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const itemUrl = clothing[selectedItem]
                if (itemUrl) {
                  setCropModalItem({ type: selectedItem, url: itemUrl, name: selectedItem })
                }
              }}
              className="w-full border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-foreground"
            >
              <Crop className="w-3 h-3 mr-2" />
              Crop Image
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedItem(null)}
              className="w-full border-border text-foreground/80 hover:bg-muted"
            >
              Deselect
            </Button>
          </div>
        )}
        
        <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-2 space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="w-full border-border text-foreground/80 hover:bg-muted"
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset All
          </Button>
          <Button
            size="sm"
            onClick={handleSavePositions}
            className="w-full bg-green-600 hover:bg-green-700 text-foreground"
          >
            <Save className="w-3 h-3 mr-2" />
            Save Layout
          </Button>
        </div>
      </div>

      {/* Instructions */}
      {!selectedItem && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-card/90 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
          <p className="text-xs text-foreground/80">
            Click a clothing item to move or crop it
          </p>
        </div>
      )}
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 4], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true, antialias: true }}
        onPointerMissed={() => setSelectedItem(null)}
      >
        {/* Background color matching the dark theme */}
        <color attach="background" args={['#020617']} />
        
        {/* Ambient light for general illumination */}
        <ambientLight intensity={0.7} />
        
        {/* Main directional light with shadows */}
        <directionalLight
          intensity={1.0}
          position={[3, 5, 4]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        
        {/* Fill light from the left */}
        <directionalLight
          intensity={0.4}
          position={[-3, 3, 2]}
        />

        {/* Rim light from behind */}
        <directionalLight
          intensity={0.3}
          position={[0, 3, -3]}
        />

        <Suspense fallback={
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#64748b" wireframe />
          </mesh>
        }>
          <group>
            {/* Mannequin base */}
            <SimpleMannequin />

            {/* Interactive clothing layers with repositioning and cropping */}
            
            {/* Outerwear layer */}
            {clothing.outerwear && positions.outerwear && (
              <Suspense fallback={null}>
                <InteractiveClothingLayer
                  textureUrl={clothing.outerwear}
                  position={positions.outerwear.position}
                  size={positions.outerwear.size}
                  cropArea={positions.outerwear.crop}
                  isSelected={selectedItem === 'outerwear'}
                  onSelect={() => setSelectedItem('outerwear')}
                  onPositionChange={(pos) => handlePositionChange('outerwear', pos)}
                  TransformControls={TransformControls}
                  label="Outerwear"
                />
              </Suspense>
            )}

            {/* Top layer */}
            {clothing.top && positions.top && (
              <Suspense fallback={null}>
                <InteractiveClothingLayer
                  textureUrl={clothing.top}
                  position={positions.top.position}
                  size={positions.top.size}
                  cropArea={positions.top.crop}
                  isSelected={selectedItem === 'top'}
                  onSelect={() => setSelectedItem('top')}
                  onPositionChange={(pos) => handlePositionChange('top', pos)}
                  TransformControls={TransformControls}
                  label="Top"
                />
              </Suspense>
            )}

            {/* Bottom layer */}
            {clothing.bottom && positions.bottom && (
              <Suspense fallback={null}>
                <InteractiveClothingLayer
                  textureUrl={clothing.bottom}
                  position={positions.bottom.position}
                  size={positions.bottom.size}
                  cropArea={positions.bottom.crop}
                  isSelected={selectedItem === 'bottom'}
                  onSelect={() => setSelectedItem('bottom')}
                  onPositionChange={(pos) => handlePositionChange('bottom', pos)}
                  TransformControls={TransformControls}
                  label="Bottom"
                />
              </Suspense>
            )}

            {/* Shoes layer */}
            {clothing.shoes && positions.shoes && (
              <Suspense fallback={null}>
                <InteractiveClothingLayer
                  textureUrl={clothing.shoes}
                  position={positions.shoes.position}
                  size={positions.shoes.size}
                  cropArea={positions.shoes.crop}
                  isSelected={selectedItem === 'shoes'}
                  onSelect={() => setSelectedItem('shoes')}
                  onPositionChange={(pos) => handlePositionChange('shoes', pos)}
                  TransformControls={TransformControls}
                  label="Shoes"
                />
              </Suspense>
            )}
          </group>
        </Suspense>

        {/* Orbit controls for user interaction */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={6}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 3.5}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          enabled={!selectedItem} // Disable orbit controls when item is selected
        />
      </Canvas>

      {/* Crop Modal */}
      {cropModalItem && (
        <CropModal
          imageUrl={cropModalItem.url}
          itemName={cropModalItem.name}
          currentCrop={positions[cropModalItem.type]?.crop}
          onSave={handleCropSave}
          onClose={() => setCropModalItem(null)}
        />
      )}
    </div>
  )
}

