# 3D Mannequin Implementation Guide

## Overview

The Try On page has been upgraded with a **3D dress-form mannequin** using React Three Fiber (`@react-three/fiber`), Three.js, and `@react-three/drei`. The center panel now displays a 3D rotatable mannequin instead of flat stacked images.

## Key Features

✅ **3D Dress-Form Mannequin** - A neutral, tailor-style mannequin with fabric torso on a wooden stand
✅ **Automatic Clothing Updates** - Clothing items from the right panel automatically appear on the mannequin
✅ **Interactive Controls** - Drag to rotate, scroll to zoom
✅ **Idle Animation** - Gentle swaying motion when not being interacted with
✅ **Transparent PNG Support** - Only garment shapes are visible (no backgrounds)
✅ **2D/3D Toggle** - Switch between 3D view and classic 2D drag-and-drop silhouette
✅ **Reset View Button** - Quick return to default camera position
✅ **Dark Theme** - Matches the Weather Smart visual style

## Files Created

### 1. `app/try-on/components/Mannequin3D.tsx`
Contains the core 3D components:
- `SimpleMannequin` - The dress-form geometry (cylinders arranged as torso + wooden stand)
- `ClothingLayer` - Renders clothing images as textured 2D planes

### 2. `app/try-on/components/MannequinScene3D.tsx`
The main 3D scene wrapper:
- `MannequinScene3D` - Sets up the Canvas, lighting, camera, and controls
- `ClothingTextures` type - Defines the interface for passing clothing image URLs

### 3. `app/try-on/components/MannequinCanvas.tsx` (Modified)
Updated to integrate the 3D mannequin:
- Added `view3D` state for toggling between 3D and 2D views
- Maps `MannequinSlots` to `ClothingTextures` for the 3D scene
- Preserves existing drag-and-drop and AI preview functionality

## How It Works

### Data Flow

```
Try On Page (page.tsx)
  └─> MannequinCanvas
      ├─> mannequinSlots (state from page)
      │   └─> Converted to clothingTextures
      └─> MannequinScene3D
          ├─> SimpleMannequin (dress form geometry)
          └─> ClothingLayer × 4
              ├─> Top (textured plane)
              ├─> Outerwear (textured plane)
              ├─> Bottom (textured plane)
              └─> Shoes (textured plane)
```

### Clothing Texture Mapping

In `MannequinCanvas.tsx` (around line 130), the outfit items are mapped to clothing textures:

```typescript
// Convert mannequin slots to clothing textures for the 3D scene
// Maps the current outfit items to image URLs that the 3D mannequin can use as textures
const clothingTextures: ClothingTextures = {
  top: slots.top?.image_url,
  bottom: slots.bottom?.image_url,
  shoes: slots.shoes?.image_url,
  outerwear: slots.outerwear?.image_url,
}
```

When a user drags or applies an item from the right panel:
1. The `slots` state is updated in the parent component (`page.tsx`)
2. `clothingTextures` is automatically recalculated
3. React Three Fiber re-renders the 3D scene with the new textures

## Adjusting Clothing Positions

To tweak the alignment of clothing items on the mannequin, edit the `position` and `size` props in **`app/try-on/components/MannequinScene3D.tsx`** (around lines 65-90):

```typescript
{/* Top layer */}
{clothing.top && (
  <ClothingLayer
    textureUrl={clothing.top}
    position={[0, 0.85, 0.52]}  // [x, y, z]
    size={[1.15, 1.2]}           // [width, height]
  />
)}
```

### Position Array `[x, y, z]`
- **x**: Left (-) / Right (+) - Default: `0` (centered)
- **y**: Down (-) / Up (+) - Adjust vertical placement
- **z**: Back (-) / Front (+) - Distance from mannequin (layering)

### Size Array `[width, height]`
- **width**: Horizontal scale of the clothing plane
- **height**: Vertical scale of the clothing plane

### Current Default Positions

| Clothing Item | Position | Size | Z-Layer |
|--------------|----------|------|---------|
| **Outerwear** | `[0, 0.8, 0.48]` | `[1.3, 1.5]` | Behind (0.48) |
| **Top** | `[0, 0.85, 0.52]` | `[1.15, 1.2]` | Middle (0.52) |
| **Bottom** | `[0, -0.3, 0.53]` | `[1.1, 1.3]` | Front (0.53) |
| **Shoes** | `[0, -1.3, 0.55]` | `[0.95, 0.55]` | Frontmost (0.55) |

### Example: Move the Top Higher

Change:
```typescript
position={[0, 0.85, 0.52]}
```
To:
```typescript
position={[0, 1.0, 0.52]}  // Moved up by 0.15 units
```

### Example: Make Bottom Wider

Change:
```typescript
size={[1.1, 1.3]}
```
To:
```typescript
size={[1.3, 1.3]}  // Increased width from 1.1 to 1.3
```

## Camera & Lighting Adjustments

### Camera Settings
In `MannequinScene3D.tsx` (line 26):

```typescript
<Canvas
  camera={{ position: [0, 1.2, 4], fov: 45 }}
  // ...
>
```

- `position`: Camera location `[x, y, z]`
- `fov`: Field of view (lower = more zoomed in)

### Lighting
Three lights are used for realistic illumination (lines 33-50):

1. **Ambient Light** - General illumination (intensity: 0.7)
2. **Main Directional Light** - Strong light from top-right with shadows (intensity: 1.0)
3. **Fill Light** - Softer light from left (intensity: 0.4)
4. **Rim Light** - Backlight for depth (intensity: 0.3)

To adjust brightness:
```typescript
<ambientLight intensity={0.9} /> // Increase from 0.7 to 0.9
```

## Controls

### OrbitControls Settings
In `MannequinScene3D.tsx` (lines 90-98):

```typescript
<OrbitControls
  enablePan={false}           // Disable panning
  enableZoom={true}            // Enable zoom
  minDistance={3}              // Closest zoom
  maxDistance={6}              // Furthest zoom
  maxPolarAngle={Math.PI / 2.2}  // Limit vertical rotation (down)
  minPolarAngle={Math.PI / 3.5}  // Limit vertical rotation (up)
  dampingFactor={0.05}         // Smooth rotation
  rotateSpeed={0.5}            // Rotation sensitivity
/>
```

Adjust these to change user interaction behavior.

## Performance Notes

- **Simple Geometry**: Uses basic cylinders for the mannequin (~100 polygons)
- **4 Clothing Planes**: 2 triangles each (8 triangles total)
- **Three Lights**: No expensive ray tracing or global illumination
- **Texture Loading**: Images loaded on-demand with Three.js TextureLoader

This should run smoothly on most devices. If you experience performance issues:
1. Reduce shadow quality: `shadow-mapSize-width={512}` (from 1024)
2. Lower cylinder segments: `<cylinderGeometry args={[0.4, 0.5, 1.4, 12]} />` (from 16)
3. Disable shadows: Remove `castShadow` props

## Future Enhancements

- [ ] Load GLTF mannequin models for more realistic appearance
- [ ] Add different mannequin types (male, female, child) with unique geometries
- [ ] Implement physics-based cloth simulation
- [ ] Add animation when clothing items are applied
- [ ] Support accessories (hats, bags, jewelry) with custom attachment points
- [ ] Export the 3D view as an image
- [ ] VR/AR integration for virtual try-on

## Troubleshooting

### Clothing appears too large/small
Adjust the `size` prop in `MannequinScene3D.tsx`

### Clothing is offset from mannequin
Adjust the `position` Y-coordinate (vertical alignment)

### Clothing layers overlap incorrectly
Adjust the Z-coordinate (front/back positioning). Higher Z = more forward.

### Mannequin is too dark
Increase `ambientLight` or `directionalLight` intensity

### Rotation feels sluggish
Increase `rotateSpeed` in `OrbitControls`

### Canvas doesn't load / shows blank screen
Check browser console for Three.js errors. Ensure image URLs are accessible.

### Images don't have transparency
Make sure the image files are PNG with an alpha channel. JPEGs will show full rectangles.

## Dependencies

The following packages were added:
- `three` - Core 3D library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Helper components (OrbitControls, etc.)
- `@types/three` (dev) - TypeScript definitions

All are installed and configured in `package.json`.

---

**Questions or issues?** Check the code comments in the component files or consult the [React Three Fiber docs](https://docs.pmnd.rs/react-three-fiber/).

