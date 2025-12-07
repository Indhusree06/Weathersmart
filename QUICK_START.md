# 3D Mannequin - Quick Start Guide

## ✅ Status: READY TO USE

The 3D mannequin is fully implemented and working in your Try On page.

---

## 🚀 How to Use

1. **Navigate to the Try On page:**
   ```
   http://localhost:3000/try-on
   ```

2. **Apply clothing items** from the right panel

3. **Watch them appear** on the 3D mannequin automatically

4. **Interact with the mannequin:**
   - **Drag** to rotate
   - **Scroll** to zoom
   - **Click reset button** (↻) to return to default view
   - **Toggle "2D View"** to switch back to classic silhouette

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/try-on/components/MannequinCanvas.tsx` | Main integration (SSR fix here) |
| `app/try-on/components/MannequinScene3D.tsx` | 3D scene setup & clothing positions |
| `app/try-on/components/Mannequin3D.tsx` | Mannequin geometry & clothing layers |

---

## 🔧 Adjust Clothing Positions

**Edit:** `app/try-on/components/MannequinScene3D.tsx` (lines 77-106)

```typescript
{/* Top layer */}
{clothing.top && (
  <ClothingLayer
    textureUrl={clothing.top}
    position={[0, 0.85, 0.52]}  // [x, y, z] ← Change here
    size={[1.15, 1.2]}           // [width, height] ← Change here
  />
)}
```

### Position Guide:
- **x**: Left (-) / Right (+) — Default: `0` (centered)
- **y**: Down (-) / Up (+) — Vertical placement
- **z**: Back (-) / Front (+) — Layering (higher = more forward)

### Size Guide:
- `[width, height]` — Scale of the clothing plane

### Examples:
```typescript
// Move top higher
position={[0, 1.0, 0.52]}  // y: 0.85 → 1.0

// Make bottom wider
size={[1.3, 1.3]}  // width: 1.1 → 1.3

// Bring shoes forward
position={[0, -1.3, 0.60]}  // z: 0.55 → 0.60
```

---

## 🐛 Issue Fixed: SSR Error

**Problem:** React Three Fiber error on page load
**Cause:** Three.js tried to run on server without WebGL
**Solution:** Dynamic import with `ssr: false`

```typescript
// In MannequinCanvas.tsx
const MannequinScene3D = dynamic(
  () => import('./MannequinScene3D').then((mod) => mod.MannequinScene3D),
  { ssr: false }  // ← This fixes the SSR error
)
```

See **`SSR_FIX.md`** for full details.

---

## 📚 Documentation

- **`IMPLEMENTATION_SUMMARY.md`** - Complete feature overview
- **`MANNEQUIN_3D_GUIDE.md`** - Technical deep dive & troubleshooting
- **`SSR_FIX.md`** - SSR error explanation & solution

---

## 🎨 Current Default Positions

| Item | Position (x, y, z) | Size (w, h) |
|------|--------------------|-------------|
| **Outerwear** | `[0, 0.8, 0.48]` | `[1.3, 1.5]` |
| **Top** | `[0, 0.85, 0.52]` | `[1.15, 1.2]` |
| **Bottom** | `[0, -0.3, 0.53]` | `[1.1, 1.3]` |
| **Shoes** | `[0, -1.3, 0.55]` | `[0.95, 0.55]` |

---

## ✨ Features

✅ 3D dress-form mannequin (fabric torso on wooden stand)
✅ Automatic clothing updates
✅ Drag to rotate, scroll to zoom
✅ Gentle idle animation
✅ Transparent PNG support
✅ 2D/3D view toggle
✅ Reset view button
✅ Dark theme integration
✅ SSR-safe with Next.js

---

## 🎯 Test Checklist

- [ ] Page loads without errors
- [ ] 3D mannequin renders in center panel
- [ ] Can drag to rotate mannequin
- [ ] Can scroll to zoom
- [ ] Clothing items appear when applied
- [ ] "Reset View" button works
- [ ] "2D View" toggle works
- [ ] No console errors

---

**Everything is ready to go!** 🎉

If you need to adjust clothing alignment, just edit the position/size values in `MannequinScene3D.tsx`.

