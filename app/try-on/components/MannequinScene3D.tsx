"use client"

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SimpleMannequin, ClothingLayer } from './Mannequin3D'
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
      camera={{ position: [0, 1.2, 4], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true }}
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

      <Suspense fallback={<LoadingFallback />}>
        <group>
          {/* Mannequin base */}
          <SimpleMannequin />

          {/* Clothing layers - rendered as textured planes */}
          {/* Outerwear layer (behind other clothes, rendered first) */}
          {clothing.outerwear && (
            <ClothingLayer
              textureUrl={clothing.outerwear}
              position={[0, 0.8, 0.48]}
              size={[1.3, 1.5]}
            />
          )}

          {/* Top layer */}
          {clothing.top && (
            <ClothingLayer
              textureUrl={clothing.top}
              position={[0, 0.85, 0.52]}
              size={[1.15, 1.2]}
            />
          )}

          {/* Bottom layer */}
          {clothing.bottom && (
            <ClothingLayer
              textureUrl={clothing.bottom}
              position={[0, -0.3, 0.53]}
              size={[1.1, 1.3]}
            />
          )}

          {/* Shoes layer */}
          {clothing.shoes && (
            <ClothingLayer
              textureUrl={clothing.shoes}
              position={[0, -1.3, 0.55]}
              size={[0.95, 0.55]}
            />
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
      />
    </Canvas>
  )
}

