# 🎨 Interactive 3D Mannequin - New Features!

## ✨ What's New

I've added two powerful features to the 3D mannequin:

### 1. **Drag & Position Clothing** 
Click and drag any clothing item to reposition it on the mannequin!

### 2. **Crop Clothing Images**
Crop images to show only the parts you want (perfect for removing pants from top images!)

---

## 🎯 How to Use

### Positioning Clothing Items:

1. **Select an item**: Click on any clothing piece (top, bottom, shoes, outerwear) on the mannequin
2. **Move it**: Drag the transform controls (arrows) to reposition
3. **Fine-tune**: Adjust X, Y, Z coordinates independently
4. **Save**: Click "Save Layout" to preserve your custom positioning

### Cropping Images:

1. **Select an item**: Click on a clothing piece
2. **Open crop tool**: Click the "Crop Image" button in the control panel
3. **Define crop area**: Click and drag on the canvas to select the area you want to show
4. **Apply**: Click "Apply Crop" to save

**Perfect for:**
- Removing unwanted parts of images
- Showing only the top part of a full-outfit photo
- Adjusting shirt images that include pants
- Fine-tuning what's visible

---

## 🎮 Controls

### 3D View Controls:
- **Drag (no item selected)**: Rotate mannequin
- **Scroll**: Zoom in/out
- **Click clothing**: Select item for editing
- **Click background**: Deselect item

### When Item Selected:
- **Drag arrows**: Move item in X, Y, Z directions
- **"Crop Image"**: Open crop tool
- **"Deselect"**: Return to normal view

### Control Panel Buttons:
- **Crop Image**: Open image cropping tool for selected item
- **Reset All**: Return all items to default positions and crops
- **Save Layout**: Save custom positioning (preserves your setup)

---

## 🔧 Technical Details

### New Components Created:

#### 1. `InteractiveClothingLayer.tsx`
- Extends the basic clothing layer with interactivity
- Uses Three.js Transform Controls for repositioning
- Supports texture cropping via UV mapping
- Highlights selected items with cyan glow
- Individual click handlers for each clothing piece

#### 2. `CropModal.tsx`
- Full-screen modal for image cropping
- Interactive canvas for selecting crop area
- Real-time preview with overlay
- Handles CORS for Supabase images
- Saves crop as normalized coordinates (0-1 range)

#### 3. Updated `MannequinScene3DClient.tsx`
- State management for positions and crops
- Selection system for clothing items
- Control panel UI
- Save/reset functionality
- Passes crop data to texture renderer

### How Cropping Works:

1. **Crop coordinates** are stored as percentages (0-1 range):
   ```typescript
   { x: 0.1, y: 0.2, width: 0.8, height: 0.6 }
   // Means: Start at 10% from left, 20% from top
   // Show 80% of width, 60% of height
   ```

2. **Applied to texture** via Three.js UV mapping:
   ```typescript
   texture.repeat.set(crop.width, crop.height)
   texture.offset.set(crop.x, crop.y)
   ```

3. **Visual result**: Only the cropped area is visible on the mannequin

---

## 📐 Default Positions

| Item | Position [X, Y, Z] | Size [W, H] | Crop Area |
|------|-------------------|-------------|-----------|
| **Outerwear** | `[0, 0.8, 0.48]` | `[1.3, 1.5]` | Full (0,0,1,1) |
| **Top** | `[0, 0.85, 0.52]` | `[1.15, 1.2]` | Full (0,0,1,1) |
| **Bottom** | `[0, -0.3, 0.53]` | `[1.1, 1.3]` | Full (0,0,1,1) |
| **Shoes** | `[0, -1.3, 0.55]` | `[0.95, 0.55]` | Full (0,0,1,1) |

---

## 🎨 Use Cases

### Example 1: Crop Top from Full-Body Image
**Problem**: Your top image includes pants

**Solution**:
1. Click the top on the mannequin
2. Click "Crop Image"
3. Drag to select only the upper portion (shirt area)
4. Click "Apply Crop"
5. Now only the shirt is visible!

### Example 2: Reposition Shoes Higher
**Problem**: Shoes appear too low on the mannequin

**Solution**:
1. Click the shoes
2. Drag the Y-axis arrow upward
3. Fine-tune position
4. Click "Save Layout"

### Example 3: Adjust Jacket Position
**Problem**: Jacket doesn't align with the mannequin properly

**Solution**:
1. Click the outerwear/jacket
2. Use transform controls to move it
3. Adjust X (left/right), Y (up/down), Z (forward/back)
4. Click "Save Layout"

---

## 💾 Saving & Persistence

### Current Session:
- Positions and crops are maintained while on the page
- Changes persist when toggling 2D/3D view
- Reset button restores defaults

### Save Layout:
- Click "Save Layout" to trigger save callback
- Currently shows confirmation alert
- Can be extended to save to:
  - localStorage
  - User profile in database
  - Outfit configuration

### To Add Persistence:
Pass a callback to `MannequinCanvas`:

```typescript
<MannequinScene3DClient
  clothing={clothingTextures}
  onSavePositions={(positions) => {
    // Save to localStorage
    localStorage.setItem('mannequinPositions', JSON.stringify(positions))
    
    // Or save to database
    // await saveUserMannequinPreferences(positions)
  }}
/>
```

---

## 🎯 Visual Indicators

### Selection State:
- **Selected item**: Cyan glow + transform control arrows
- **Unselected items**: Normal appearance
- **Control panel**: Shows selected item name and crop button

### Transform Controls:
- **Red arrow**: X-axis (left/right)
- **Green arrow**: Y-axis (up/down)
- **Blue arrow**: Z-axis (forward/back)

### Instructions:
- **No selection**: "Click a clothing item to move or crop it"
- **Item selected**: Control panel shows item-specific options

---

## 🐛 Troubleshooting

### Drag not working:
- Make sure you click directly on the clothing item
- Check that the item is loaded (wait for textures)
- Try clicking again if first click doesn't select

### Crop modal doesn't open:
- Ensure item is selected first (click the clothing)
- Check that image URL is accessible
- Look for CORS errors in console

### Transform controls invisible:
- Item may not be selected - click it again
- Controls only appear when item is selected
- Check that Three.js TransformControls loaded

### Positions reset after changing outfits:
- Use "Save Layout" before changing outfits
- Positions are tied to current outfit items
- Consider implementing persistent storage

---

## 🚀 Future Enhancements

Possible additions:

- **Rotation controls**: Rotate clothing items on the mannequin
- **Scale controls**: Resize individual items
- **Snap to grid**: Align items to specific positions
- **Preset layouts**: Save and load multiple configurations
- **Copy positions**: Apply one item's position to another
- **Undo/redo**: History of position changes
- **Animation**: Smooth transitions when repositioning
- **Multi-select**: Move multiple items together

---

## 📚 Files Changed

### New Files:
1. ✅ `app/try-on/components/InteractiveClothingLayer.tsx`
2. ✅ `app/try-on/components/CropModal.tsx`

### Modified Files:
3. ✅ `app/try-on/components/MannequinScene3DClient.tsx`

---

## ✨ Summary

**You can now:**
- ✅ Click and drag clothing items to reposition them
- ✅ Crop images to show only desired portions
- ✅ Save custom layouts
- ✅ Reset to defaults anytime
- ✅ Perfect alignment for any clothing image

**Perfect for handling:**
- Images that include unwanted elements
- Top images with pants visible
- Shoes that need adjustment
- Any positioning tweaks needed

---

**Test it out!** Click on any clothing item on the mannequin to start customizing! 🎉

