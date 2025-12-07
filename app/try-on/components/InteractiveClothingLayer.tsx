"use client"

import { useRef, useState, useMemo, useEffect } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

interface InteractiveClothingLayerProps {
  textureUrl?: string
  position: [number, number, number]
  size: [number, number]
  rotation?: [number, number, number]
  onPositionChange?: (position: [number, number, number]) => void
  onSizeChange?: (size: [number, number]) => void
  cropArea?: { x: number; y: number; width: number; height: number } // 0-1 range
  isSelected?: boolean
  onSelect?: () => void
  label?: string
  TransformControls?: any // Passed in dynamically
}

export function InteractiveClothingLayer({
  textureUrl,
  position,
  size,
  rotation = [0, 0, 0],
  onPositionChange,
  onSizeChange,
  cropArea = { x: 0, y: 0, width: 1, height: 1 },
  isSelected,
  onSelect,
  label,
  TransformControls
}: InteractiveClothingLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Don't render if no texture URL provided
  if (!textureUrl) return null

  // Load texture with error handling
  const texture = useLoader(
    TextureLoader,
    textureUrl,
    undefined,
    (error) => {
      console.warn('Error loading texture:', textureUrl, error)
    }
  )

  // Configure texture with crop area
  useMemo(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      
      // Apply crop area by adjusting texture repeat and offset
      texture.repeat.set(cropArea.width, cropArea.height)
      texture.offset.set(cropArea.x, cropArea.y)
      texture.needsUpdate = true
    }
  }, [texture, cropArea])

  // Update mesh position when position prop changes (for reset functionality)
  useEffect(() => {
    if (meshRef.current && position) {
      // Force update the position
      meshRef.current.position.set(position[0], position[1], position[2])
      // Update matrix to ensure transforms are applied
      meshRef.current.updateMatrix()
    }
  }, [position[0], position[1], position[2]]) // Watch individual coordinates

  if (!texture) return null

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    setIsDragging(true)
    if (onSelect) onSelect()
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={size} />
        <meshStandardMaterial
          map={texture}
          transparent={true}
          alphaTest={0.01}
          side={THREE.DoubleSide}
          depthWrite={true}
          emissive={isSelected ? '#00ffff' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Transform controls for selected item - only if TransformControls is provided */}
      {isSelected && meshRef.current && TransformControls && (
        <TransformControls
          object={meshRef.current}
          mode="translate"
          size={0.5}
          onObjectChange={(e: any) => {
            if (meshRef.current && onPositionChange) {
              const pos = meshRef.current.position
              onPositionChange([pos.x, pos.y, pos.z])
            }
          }}
        />
      )}

      {/* Label for the clothing item */}
      {label && (
        <mesh position={[position[0], position[1] - size[1] / 2 - 0.1, position[2] + 0.01]}>
          <planeGeometry args={[0.5, 0.1]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

