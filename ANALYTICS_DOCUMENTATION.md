# Analytics Dashboard Documentation

## Overview

The Analytics Dashboard provides comprehensive insights into your wardrobe usage, style preferences, and outfit patterns. It helps you make data-driven decisions about your wardrobe and style choices.

## Features

### 1. Summary Cards
- **Total Items**: Count of all items in your wardrobe
- **Most Worn**: The item you wear most frequently
- **Least Worn**: Items that need more attention
- **Wardrobe Health**: A score (0-100) based on:
  - Category balance
  - Wear distribution
  - Item condition

### 2. Wardrobe Composition
- **Category Breakdown**: Interactive pie chart showing distribution of tops, bottoms, shoes, etc.
- **Weather Readiness**: Star ratings for:
  - Rain gear
  - Winter gear
  - Summer gear

### 3. Usage Analytics
- **Most Worn Items**: Top 5 items with thumbnails and wear counts
- **Least Worn Items**: Bottom 5 items with suggestions for re-styling or donating

### 4. Saved Outfits
- Visual grid of your saved outfit combinations
- Shows favorites, occasions, and last worn dates

### 5. AI Outfit Ratings ⭐
- Rate AI-recommended outfits on a scale of 1-10
- Track average ratings and insights
- See which style preferences the AI has learned
- **Note**: Ratings are currently stored locally. Backend integration is pending.

### 6. Style Profile
- **Color Preference**: Your most-worn color families
- **Top Categories**: Most frequent item types
- **Average Condition**: Overall quality of your wardrobe

### 7. Closet Insights
Smart recommendations based on your wardrobe:
- Category imbalances (too many tops vs. bottoms)
- Weather readiness warnings
- Unworn items suggestions
- Positive reinforcement for good habits

## Technical Details

### Data Sources
- `wardrobe_items` table: Item details, wear counts, conditions
- `outfits` table: Saved outfit combinations
- `outfit_recommendations` table: AI-generated outfit suggestions

### Components

#### Hooks
- `useAnalyticsData(userId)`: Main data hook that fetches and computes all analytics

#### UI Components
- `SummaryCard`: Displays key metrics with icons/images
- `WardrobeCategoryChart`: Recharts pie chart for category distribution
- `WeatherReadinessCard`: Weather gear ratings with star displays
- `MostLeastList`: Lists of most/least worn items
- `AiOutfitRatingsList`: Interactive slider-based outfit rating system
- `StyleProfilePanel`: Personal style insights
- `ClosetInsightsPanel`: Smart recommendations
- `SavedOutfitsList`: Grid view of saved outfits

### Algorithms

#### Wardrobe Health Score (0-100)
```
Base score: 50

Category Balance (+20):
- Has tops: +5
- Has bottoms: +5
- Has shoes: +5
- Has outerwear: +5

Wear Distribution (+20):
- Percentage of worn items × 20

Condition (+10):
- Percentage of good condition items × 10
```

#### Color Family Classification
Items are categorized into:
- Neutral (black, white, gray, beige)
- Warm (red, orange, yellow, pink)
- Cool (blue, green, purple, teal)
- Bright (neon, vibrant)
- Dark (navy, charcoal)

#### Weather Tag Detection
Uses keyword matching on item name, description, and tags:
- **Rain**: "rain", "waterproof", "umbrella"
- **Winter**: "winter", "warm", "coat", "sweater", "jacket"
- **Summer**: "summer", "light", "shorts", "tank", "sandal"

## Navigation

The Analytics page is accessible from:
- AI Outfit Picker
- Wardrobes
- Weather Essentials
- Lifecycle Alerts
- Home page

## TODO: Backend Integration

### AI Outfit Ratings
Currently, outfit ratings are stored in component state and lost on page refresh. To implement persistence:

1. **Add rating column to database**:
```sql
ALTER TABLE outfit_recommendations 
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 10);
```

2. **Create API endpoint** (`/api/rate-outfit`):
```typescript
// app/api/rate-outfit/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const { outfitId, rating } = await request.json()
  
  const { data, error } = await supabase
    .from("outfit_recommendations")
    .update({ rating })
    .eq("id", outfitId)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

3. **Update component** to call API:
```typescript
const handleRateOutfit = async (outfitId: string, rating: number) => {
  await fetch('/api/rate-outfit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outfitId, rating })
  })
}
```

### Enhanced Analytics

Future enhancements could include:
- Cost-per-wear calculations (requires item prices)
- Seasonal usage patterns over time
- Outfit frequency tracking
- Color harmony scores
- Style trend detection
- Wardrobe ROI analysis

## Styling

The Analytics dashboard follows the app's dark theme:
- Background: Gradient from slate-950 to slate-900
- Cards: slate-800 with slate-700 borders
- Text: White headings, slate-300/400 for secondary text
- Accents: Colorful gradients (purple/pink) for headers
- Charts: Using Recharts with custom dark theme colors

## Performance

- **Chart Library**: Recharts (38 packages, ~107 KB page size)
- **Optimizations**:
  - Memoized analytics computations
  - Lazy loading of chart data
  - Efficient data transformations
  - Responsive design with mobile-first approach

## Testing Considerations

When testing the Analytics page:
1. Create wardrobe items with various categories
2. Set different wear counts on items
3. Create saved outfits
4. Generate AI outfit recommendations
5. Verify all calculations (health score, percentages)
6. Test responsive layout on mobile/tablet
7. Check chart interactivity and tooltips

