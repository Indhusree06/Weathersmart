"use client"

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

// Improved dress-form mannequin with better proportions and detail
export function SimpleMannequin() {
  const mannequinRef = useRef<THREE.Group>(null)
  
  // Subtle idle animation - gentle rotation
  useFrame((state) => {
    if (mannequinRef.current) {
      mannequinRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  // Material for fabric torso (realistic mannequin color)
  const fabricMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#E8DCC8',
      roughness: 0.7,
      metalness: 0.05,
      emissive: '#2a2520',
      emissiveIntensity: 0.05
    }), 
  [])

  // Material for wooden base/stand
  const woodMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#5C4A3A',
      roughness: 0.85,
      metalness: 0.0
    }), 
  [])

  // Material for metal pole
  const metalMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({ 
      color: '#888888',
      roughness: 0.4,
      metalness: 0.8
    }), 
  [])

  return (
    <group ref={mannequinRef} position={[0, -0.3, 0]}>
      {/* Neck area */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.25, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Shoulders/Upper chest */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.35, 0.35, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>
      
      {/* Upper torso/chest area - slightly curved */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.5, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Mid torso - waist area (narrower) */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.38, 0.5, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>
      
      {/* Lower torso - hip area (wider) */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.32, 0.5, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Hip/Bottom area */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.42, 0.3, 16]} />
        <primitive object={fabricMaterial} attach="material" />
      </mesh>

      {/* Metal stand pole */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 16]} />
        <primitive object={metalMaterial} attach="material" />
      </mesh>

      {/* Wooden base - circular */}
      <mesh position={[0, -1.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.12, 32]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>

      {/* Base ring detail */}
      <mesh position={[0, -1.54, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.58, 0.03, 8, 32]} />
        <primitive object={woodMaterial} attach="material" />
      </mesh>
    </group>
  )
}

// Improved clothing layer component with curved wrapping effect
interface ClothingLayerProps {
  textureUrl?: string
  position: [number, number, number]
  size: [number, number]
  rotation?: [number, number, number]
  curvature?: number // Amount of curve to wrap around body
}

export function ClothingLayer({ 
  textureUrl, 
  position, 
  size, 
  rotation = [0, 0, 0],
  curvature = 0.3 
}: ClothingLayerProps) {
  if (!textureUrl) return null

  const texture = useLoader(
    TextureLoader,
    textureUrl,
    undefined,
    (error) => {
      console.warn('Error loading texture:', textureUrl, error)
    }
  )

  // Configure texture
  useMemo(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
    }
  }, [texture])

  if (!texture) return null

  // Create a slightly curved geometry for more realistic draping
  const curvedGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size[0], size[1], 20, 20)
    const positions = geometry.attributes.position

    // Apply curvature to wrap around the mannequin body
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      
      // Calculate z offset based on x position to create curve
      const zOffset = Math.pow(Math.abs(x / (size[0] / 2)), 2) * curvature
      positions.setZ(i, -zOffset)
    }

    geometry.computeVertexNormals()
    return geometry
  }, [size, curvature])

  return (
    <mesh position={position} rotation={rotation} geometry={curvedGeometry}>
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.05}
        side={THREE.DoubleSide}
        depthWrite={true}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}
