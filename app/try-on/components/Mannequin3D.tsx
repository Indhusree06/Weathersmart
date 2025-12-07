"use client"

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

// Simple dress-form mannequin made with basic geometry
export function SimpleMannequin() {
  const mannequinRef = useRef<THREE.Group>(null)
  
  // Idle animation - gentle rotation
  useFrame((state) => {
    if (mannequinRef.current) {
      // Gentle sway animation
      mannequinRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    }
  })

  // Material for fabric torso (light beige/tan color)
  const fabricMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#D4C4B0',
      roughness: 0.8,
      metalness: 0.1
    }), 
  [])

  // Material for wooden base/stand
  const woodMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#8B6F47',
      roughness: 0.9,
      metalness: 0.0
    }), 
  [])

  return (
    <group ref={mannequinRef} position={[0, -0.2, 0]}>
      {/* Torso - main dress form body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 1.4, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>
      
      {/* Upper torso/chest - slightly wider */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.4, 0.5, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>
      
      {/* Shoulders - narrow cylinder */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 0.2, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>
      
      {/* Hip area - wider base */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.48, 0.4, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Wooden stand pole */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>

      {/* Wooden base - tripod style */}
      <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.65, 0.15, 6]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>
    </group>
  )
}

// Clothing layer component - renders a 2D plane with texture
interface ClothingLayerProps {
  textureUrl?: string
  position: [number, number, number]
  size: [number, number]
  rotation?: [number, number, number]
}

export function ClothingLayer({ textureUrl, position, size, rotation = [0, 0, 0] }: ClothingLayerProps) {
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

  // Configure texture for transparency
  useMemo(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
    }
  }, [texture])

  if (!texture) return null

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.01}
        side={THREE.DoubleSide}
        depthWrite={true}
      />
    </mesh>
  )
}

