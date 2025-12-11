import { autoCategorizeItem, type ItemCategory } from './autoCategorize';

interface WardrobeItem {
  id: string;
  name: string;
  category?: string;
  color?: string;
  brand?: string;
  description?: string;
  image?: string;
  tags?: string[];
  wear_count?: number;
}

interface RecommendationContext {
  occasion?: string;
  weather?: {
    temperature: number;
    condition: string;
    humidity?: number;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  userPreferences?: {
    favoriteColors?: string[];
    avoidColors?: string[];
    stylePreference?: 'casual' | 'formal' | 'trendy' | 'classic';
  };
}

interface OutfitRecommendation {
  items: WardrobeItem[];
  score: number;
  reasoning: string[];
  colorHarmony: {
    score: number;
    type: string;
    description: string;
  };
}

/**
 * Main recommendation function with intelligent matching
 */
export function generateSmartOutfit(
  wardrobeItems: WardrobeItem[],
  context: RecommendationContext
): OutfitRecommendation | null {
  if (!wardrobeItems || wardrobeItems.length === 0) {
    return null;
  }

  // Categorize all items
  const categorizedItems = categorizeWardrobe(wardrobeItems);

  // Filter items by weather appropriateness
  const weatherAppropriateItems = filterByWeather(wardrobeItems, context.weather);

  // Filter by occasion
  const occasionAppropriateItems = filterByOccasion(weatherAppropriateItems, context.occasion);

  // Generate multiple outfit combinations
  const outfitCandidates = generateOutfitCombinations(
    occasionAppropriateItems,
    categorizedItems,
    context
  );

  // Score and rank outfits
  const rankedOutfits = rankOutfits(outfitCandidates, context);

  // Return the best outfit
  return rankedOutfits[0] || null;
}

/**
 * Generate multiple outfit options
 */
export function generateMultipleOutfits(
  wardrobeItems: WardrobeItem[],
  context: RecommendationContext,
  count: number = 3
): OutfitRecommendation[] {
  if (!wardrobeItems || wardrobeItems.length === 0) {
    return [];
  }

  const categorizedItems = categorizeWardrobe(wardrobeItems);
  const weatherAppropriateItems = filterByWeather(wardrobeItems, context.weather);
  const occasionAppropriateItems = filterByOccasion(weatherAppropriateItems, context.occasion);

  const outfitCandidates = generateOutfitCombinations(
    occasionAppropriateItems,
    categorizedItems,
    context,
    count * 3 // Generate more candidates to ensure variety
  );

  const rankedOutfits = rankOutfits(outfitCandidates, context);

  // Return top N diverse outfits
  return ensureDiversity(rankedOutfits, count);
}

/**
 * Categorize wardrobe items
 */
function categorizeWardrobe(items: WardrobeItem[]): Map<ItemCategory, WardrobeItem[]> {
  const categorized = new Map<ItemCategory, WardrobeItem[]>();

  items.forEach(item => {
    const category = autoCategorizeItem(item);
    if (!categorized.has(category)) {
      categorized.set(category, []);
    }
    categorized.get(category)!.push(item);
  });

  return categorized;
}

/**
 * Filter items by weather appropriateness
 */
function filterByWeather(
  items: WardrobeItem[],
  weather?: { temperature: number; condition: string }
): WardrobeItem[] {
  if (!weather) return items;

  const { temperature, condition } = weather;

  return items.filter(item => {
    const name = item.name.toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = autoCategorizeItem(item);

    // Temperature-based filtering
    if (temperature < 50) {
      // Cold weather - prefer warm items
      if (category === 'outerwear') return true;
      if (name.includes('sweater') || name.includes('long sleeve')) return true;
      if (name.includes('boot') || name.includes('closed')) return true;
      // Exclude summer items
      if (name.includes('tank') || name.includes('shorts') || name.includes('sandal')) return false;
    } else if (temperature > 75) {
      // Hot weather - prefer light items
      if (name.includes('shorts') || name.includes('tank') || name.includes('sandal')) return true;
      if (name.includes('sweater') || name.includes('heavy') || name.includes('winter')) return false;
    }

    // Condition-based filtering
    if (condition.toLowerCase().includes('rain')) {
      if (name.includes('rain') || name.includes('waterproof') || category === 'outerwear') return true;
      if (name.includes('suede') || name.includes('canvas')) return false;
    }

    return true;
  });
}

/**
 * Filter items by occasion appropriateness
 */
function filterByOccasion(
  items: WardrobeItem[],
  occasion?: string
): WardrobeItem[] {
  if (!occasion) return items;

  return items.filter(item => {
    const allText = `${item.name} ${item.description || ''}`.toLowerCase();

    switch (occasion.toLowerCase()) {
      case 'work':
      case 'professional':
      case 'business':
        return (
          allText.includes('work') ||
          allText.includes('professional') ||
          allText.includes('business') ||
          allText.includes('formal') ||
          allText.includes('blazer') ||
          allText.includes('dress pants') ||
          !allText.includes('casual') && !allText.includes('athletic')
        );

      case 'casual':
      case 'weekend':
      case 'relaxed':
        return (
          allText.includes('casual') ||
          allText.includes('jeans') ||
          allText.includes('t-shirt') ||
          allText.includes('sneaker') ||
          !allText.includes('formal')
        );

      case 'date':
      case 'dinner':
      case 'evening':
        return (
          allText.includes('elegant') ||
          allText.includes('dress') ||
          allText.includes('nice') ||
          !allText.includes('casual') && !allText.includes('athletic')
        );

      case 'workout':
      case 'gym':
      case 'athletic':
        return (
          allText.includes('athletic') ||
          allText.includes('sport') ||
          allText.includes('workout') ||
          allText.includes('gym') ||
          allText.includes('running')
        );

      default:
        return true;
    }
  });
}

/**
 * Generate outfit combinations
 */
function generateOutfitCombinations(
  items: WardrobeItem[],
  categorized: Map<ItemCategory, WardrobeItem[]>,
  context: RecommendationContext,
  maxCombinations: number = 10
): OutfitRecommendation[] {
  const outfits: OutfitRecommendation[] = [];

  const tops = categorized.get('top') || [];
  const bottoms = categorized.get('bottom') || [];
  const dresses = categorized.get('dress') || [];
  const outerwear = categorized.get('outerwear') || [];
  const shoes = categorized.get('shoes') || [];

  // Strategy 1: Dress-based outfits
  if (dresses.length > 0 && shoes.length > 0) {
    for (let i = 0; i < Math.min(dresses.length, maxCombinations / 2); i++) {
      const dress = dresses[i];
      const shoe = findBestMatch(dress, shoes, context);
      if (shoe) {
        const outfitItems = [dress, shoe];
        // Add outerwear if cold
        if (context.weather && context.weather.temperature < 60 && outerwear.length > 0) {
          const layer = findBestMatch(dress, outerwear, context);
          if (layer) outfitItems.push(layer);
        }
        outfits.push(createOutfitRecommendation(outfitItems, context));
      }
    }
  }

  // Strategy 2: Top + Bottom combinations
  if (tops.length > 0 && bottoms.length > 0) {
    const combinations = Math.min(tops.length * bottoms.length, maxCombinations);
    let added = 0;

    for (const top of tops) {
      if (added >= combinations) break;
      for (const bottom of bottoms) {
        if (added >= combinations) break;

        // Check color compatibility
        if (!areColorsCompatible(top.color, bottom.color)) continue;

        const outfitItems = [top, bottom];

        // Add shoes
        if (shoes.length > 0) {
          const shoe = findBestMatch(top, shoes, context);
          if (shoe) outfitItems.push(shoe);
        }

        // Add outerwear if needed
        if (context.weather && context.weather.temperature < 65 && outerwear.length > 0) {
          const layer = findBestMatch(top, outerwear, context);
          if (layer) outfitItems.push(layer);
        }

        outfits.push(createOutfitRecommendation(outfitItems, context));
        added++;
      }
    }
  }

  // Strategy 3: Fallback - any valid combination
  if (outfits.length < maxCombinations && items.length >= 2) {
    for (let i = 0; i < Math.min(items.length, maxCombinations - outfits.length); i++) {
      const randomItems = [items[i]];
      for (let j = 0; j < 2 && randomItems.length < 3; j++) {
        const randomIdx = Math.floor(Math.random() * items.length);
        if (!randomItems.some(item => item.id === items[randomIdx].id)) {
          randomItems.push(items[randomIdx]);
        }
      }
      if (randomItems.length >= 2) {
        outfits.push(createOutfitRecommendation(randomItems, context));
      }
    }
  }

  return outfits;
}

/**
 * Find best matching item
 */
function findBestMatch(
  referenceItem: WardrobeItem,
  candidates: WardrobeItem[],
  context: RecommendationContext
): WardrobeItem | null {
  if (candidates.length === 0) return null;

  return candidates.reduce((best, candidate) => {
    const score = calculateMatchScore(referenceItem, candidate, context);
    const bestScore = calculateMatchScore(referenceItem, best, context);
    return score > bestScore ? candidate : best;
  });
}

/**
 * Calculate match score between two items
 */
function calculateMatchScore(
  item1: WardrobeItem,
  item2: WardrobeItem,
  context: RecommendationContext
): number {
  let score = 0;

  // Color compatibility
  if (areColorsCompatible(item1.color, item2.color)) {
    score += 50;
  }

  // Occasion match
  if (context.occasion) {
    const occasion = context.occasion.toLowerCase();
    const text = `${item1.name} ${item2.name}`.toLowerCase();
    if (text.includes(occasion)) {
      score += 30;
    }
  }

  // Prefer unworn items
  if ((item2.wear_count || 0) === 0) {
    score += 20;
  }

  // Brand consistency (bonus for matching brands)
  if (item1.brand && item1.brand === item2.brand) {
    score += 10;
  }

  return score;
}

/**
 * Check if colors are compatible
 */
function areColorsCompatible(color1?: string, color2?: string): boolean {
  if (!color1 || !color2) return true;

  const c1 = normalizeColor(color1);
  const c2 = normalizeColor(color2);

  if (c1 === c2) return true;

  const neutrals = ['black', 'white', 'gray', 'beige', 'navy', 'brown', 'cream'];
  if (neutrals.includes(c1) || neutrals.includes(c2)) return true;

  const complementary: Record<string, string[]> = {
    red: ['green', 'white', 'black'],
    blue: ['orange', 'yellow', 'white'],
    yellow: ['blue', 'purple', 'black'],
    green: ['red', 'pink', 'white'],
    pink: ['green', 'white', 'black'],
    purple: ['yellow', 'white', 'black'],
    orange: ['blue', 'white', 'black'],
  };

  return (complementary[c1]?.includes(c2) || complementary[c2]?.includes(c1)) ?? false;
}

/**
 * Normalize color name
 */
function normalizeColor(color: string): string {
  const normalized = color.toLowerCase().trim();
  const colorMap: Record<string, string> = {
    'dark blue': 'navy',
    'light blue': 'blue',
    'light gray': 'gray',
    'dark gray': 'gray',
    'light green': 'green',
    'dark green': 'green',
    'light red': 'red',
    'dark red': 'red',
  };
  return colorMap[normalized] || normalized;
}

/**
 * Create outfit recommendation
 */
function createOutfitRecommendation(
  items: WardrobeItem[],
  context: RecommendationContext
): OutfitRecommendation {
  const reasoning: string[] = [];
  let score = 0;

  // Color harmony analysis
  const colorHarmony = analyzeColorHarmony(items);
  score += colorHarmony.score * 30;
  reasoning.push(colorHarmony.description);

  // Occasion appropriateness
  if (context.occasion) {
    score += 20;
    reasoning.push(`Perfect for ${context.occasion}`);
  }

  // Weather appropriateness
  if (context.weather) {
    score += 20;
    reasoning.push(`Suitable for ${context.weather.temperature}°F weather`);
  }

  // Prioritize unworn items
  const unwornCount = items.filter(item => (item.wear_count || 0) === 0).length;
  if (unwornCount > 0) {
    score += unwornCount * 10;
    reasoning.push(`Includes ${unwornCount} unworn item(s)`);
  }

  // Completeness bonus
  const categories = new Set(items.map(item => autoCategorizeItem(item)));
  if (categories.has('top') && categories.has('bottom') && categories.has('shoes')) {
    score += 20;
  }

  return {
    items,
    score,
    reasoning,
    colorHarmony
  };
}

/**
 * Analyze color harmony with dynamic descriptions
 */
function analyzeColorHarmony(items: WardrobeItem[]): {
  score: number;
  type: string;
  description: string;
} {
  const colors = items.map(item => normalizeColor(item.color || '')).filter(c => c);

  if (colors.length === 0) {
    return { score: 0.5, type: 'unknown', description: 'Color information not available' };
  }

  const uniqueColors = Array.from(new Set(colors));
  const neutralCount = colors.filter(c => ['black', 'white', 'gray', 'beige', 'navy', 'brown'].includes(c)).length;

  // Generate random index for variety
  const randomIdx = Math.floor(Math.random() * 5);

  // Monochromatic (same color)
  if (uniqueColors.length === 1) {
    const color = uniqueColors[0];
    const descriptions = [
      `Elegant ${color} monochromatic look`,
      `Sophisticated single-color palette in ${color}`,
      `Cohesive ${color} ensemble`,
      `Minimalist ${color} styling`,
      `Refined ${color} monochrome`
    ];
    return { score: 0.9, type: 'monochromatic', description: descriptions[randomIdx] };
  }

  // Neutral palette
  if (neutralCount === colors.length) {
    const descriptions = [
      'Timeless neutral combination',
      'Classic and versatile neutral palette',
      'Sophisticated monochrome styling',
      'Elegant neutral ensemble',
      'Professional neutral look'
    ];
    return { score: 1.0, type: 'neutral', description: descriptions[randomIdx] };
  }

  // Mixed with neutrals
  if (neutralCount > 0) {
    const accentColor = uniqueColors.find(c => !['black', 'white', 'gray', 'beige', 'navy', 'brown'].includes(c));
    const descriptions = [
      `${accentColor} accent with neutral base`,
      `Balanced ${accentColor} and neutral tones`,
      `Neutral foundation with ${accentColor} pop`,
      `Sophisticated ${accentColor} and neutral mix`,
      `Versatile ${accentColor} with neutral palette`
    ];
    return { score: 0.95, type: 'balanced', description: descriptions[randomIdx] };
  }

  // Complementary colors
  const hasComplementary = uniqueColors.some((c1, i) => 
    uniqueColors.slice(i + 1).some(c2 => areColorsCompatible(c1, c2))
  );

  if (hasComplementary) {
    const descriptions = [
      `Vibrant color combination`,
      `Bold and striking palette`,
      `Eye-catching color ensemble`,
      `Dynamic color coordination`,
      `Striking color harmony`
    ];
    return { score: 0.85, type: 'complementary', description: descriptions[randomIdx] };
  }

  const descriptions = [
    `Unique color combination`,
    `Creative color palette`,
    `Colorful and expressive look`,
    `Distinctive color styling`,
    `Artistic color arrangement`
  ];
  return { score: 0.7, type: 'mixed', description: descriptions[randomIdx] };
}

/**
 * Rank outfits by score
 */
function rankOutfits(
  outfits: OutfitRecommendation[],
  context: RecommendationContext
): OutfitRecommendation[] {
  return outfits.sort((a, b) => b.score - a.score);
}

/**
 * Ensure diversity in outfit recommendations
 */
function ensureDiversity(
  outfits: OutfitRecommendation[],
  count: number
): OutfitRecommendation[] {
  const diverse: OutfitRecommendation[] = [];
  const usedItems = new Set<string>();

  // First pass: strict diversity (less than 50% overlap)
  for (const outfit of outfits) {
    if (diverse.length >= count) break;

    const itemIds = outfit.items.map(item => item.id);
    const overlap = itemIds.filter(id => usedItems.has(id)).length;

    // Allow if less than 50% overlap
    if (overlap < itemIds.length * 0.5) {
      diverse.push(outfit);
      itemIds.forEach(id => usedItems.add(id));
    }
  }

  // Second pass: if we don't have enough options, relax the constraint
  if (diverse.length < count) {
    for (const outfit of outfits) {
      if (diverse.length >= count) break;
      
      // Check if this outfit is already in diverse
      if (diverse.some(d => d.score === outfit.score && d.items.length === outfit.items.length)) {
        continue;
      }
      
      diverse.push(outfit);
    }
  }

  // Third pass: if still not enough, return what we have (at least the top ones)
  return diverse.slice(0, Math.max(count, diverse.length));
}

/**
 * Auto-categorize item (placeholder - should import from autoCategorize)
 */
export function autoCategorizeItemFallback(item: WardrobeItem): ItemCategory {
  const name = item.name.toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const text = `${name} ${desc}`;

  if (text.includes('shoe') || text.includes('boot') || text.includes('sneaker') || text.includes('sandal')) return 'shoes';
  if (text.includes('dress')) return 'dress';
  if (text.includes('jacket') || text.includes('coat') || text.includes('hoodie') || text.includes('blazer')) return 'outerwear';
  if (text.includes('pant') || text.includes('jean') || text.includes('short') || text.includes('skirt')) return 'bottom';
  if (text.includes('shirt') || text.includes('blouse') || text.includes('tee') || text.includes('top') || text.includes('sweater')) return 'top';
  
  return 'accessory';
}
