"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SimpleMannequin, ClothingLayer } from './Mannequin3D_improved'
import { Suspense } from 'react'

// Type for clothing textures
export type ClothingTextures = {
  top?: string
  bottom?: string
  shoes?: string
  outerwear?: string
}

interface MannequinScene3DProps {
  clothing: ClothingTextures
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#64748b" wireframe />
    </mesh>
  )
}

export function MannequinScene3D({ clothing }: MannequinScene3DProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.0, 3.5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* Background color matching the dark theme */}
      <color attach="background" args={['#020617']} />
      
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.6} />
      
      {/* Main key light from front-right */}
      <directionalLight
        intensity={1.2}
        position={[2, 4, 3]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      
      {/* Fill light from the left */}
      <directionalLight
        intensity={0.5}
        position={[-2, 2, 2]}
      />

      {/* Rim light from behind for depth */}
      <directionalLight
        intensity={0.4}
        position={[0, 2, -2]}
      />

      {/* Subtle bottom light to reduce harsh shadows */}
      <hemisphereLight
        intensity={0.3}
        groundColor="#1a1a2e"
        color="#4a5568"
      />

      <Suspense fallback={<LoadingFallback />}>
        <group>
          {/* Mannequin base */}
          <SimpleMannequin />

          {/* Clothing layers - positioned ON the mannequin with proper layering */}
          
          {/* Outerwear layer (outermost, slightly larger) */}
          {clothing.outerwear && (
            <ClothingLayer
              textureUrl={clothing.outerwear}
              position={[0, 0.95, 0.46]}
              size={[1.4, 1.6]}
              curvature={0.35}
            />
          )}

          {/* Top layer (on torso) */}
          {clothing.top && (
            <ClothingLayer
              textureUrl={clothing.top}
              position={[0, 0.95, 0.48]}
              size={[1.2, 1.3]}
              curvature={0.32}
            />
          )}

          {/* Bottom layer (lower body) */}
          {clothing.bottom && (
            <ClothingLayer
              textureUrl={clothing.bottom}
              position={[0, -0.1, 0.49]}
              size={[1.15, 1.4]}
              curvature={0.28}
            />
          )}

          {/* Shoes layer (at bottom) */}
          {clothing.shoes && (
            <ClothingLayer
              textureUrl={clothing.shoes}
              position={[0, -0.95, 0.5]}
              size={[1.0, 0.6]}
              curvature={0.25}
            />
          )}
        </group>
      </Suspense>

      {/* Orbit controls for user interaction - improved settings */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2.5}
        maxDistance={5}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 4}
        dampingFactor={0.05}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        enableDamping={true}
        autoRotate={false}
      />


    </Canvas>
  )
}
