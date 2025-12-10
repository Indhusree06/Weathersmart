/**
 * Intelligent Outfit Recommendation Engine
 * Uses color theory, style matching, and context awareness
 */

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
      if (name.includes('tank') || name.includes('short') || name.includes('sandal')) return true;
      if (name.includes('light') || name.includes('breathable')) return true;
      // Exclude winter items
      if (category === 'outerwear' && name.includes('coat')) return false;
      if (name.includes('heavy') || name.includes('wool')) return false;
    }

    // Condition-based filtering
    if (condition.toLowerCase().includes('rain')) {
      if (name.includes('waterproof') || name.includes('rain')) return true;
      if (name.includes('boot')) return true;
      // Avoid delicate items
      if (name.includes('suede') || name.includes('silk')) return false;
    }

    return true; // Default: include item
  });
}

/**
 * Filter items by occasion
 */
function filterByOccasion(items: WardrobeItem[], occasion?: string): WardrobeItem[] {
  if (!occasion) return items;

  const occasionLower = occasion.toLowerCase();

  return items.filter(item => {
    const name = item.name.toLowerCase();
    const description = (item.description || '').toLowerCase();
    const tags = (item.tags || []).map(t => t.toLowerCase());
    const allText = `${name} ${description} ${tags.join(' ')}`;

    switch (occasionLower) {
      case 'work':
      case 'formal':
      case 'business':
      case 'professional':
        return (
          allText.includes('formal') ||
          allText.includes('business') ||
          allText.includes('professional') ||
          allText.includes('blazer') ||
          allText.includes('dress shirt') ||
          allText.includes('trousers') ||
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

  return outfits;
}

/**
 * Find best matching item based on color and style
 */
function findBestMatch(
  baseItem: WardrobeItem,
  candidates: WardrobeItem[],
  context: RecommendationContext
): WardrobeItem | null {
  if (candidates.length === 0) return null;

  // Prioritize unworn items
  const unwornItems = candidates.filter(item => (item.wear_count || 0) === 0);
  const pool = unwornItems.length > 0 ? unwornItems : candidates;

  // Find color-compatible items
  const compatible = pool.filter(item => 
    areColorsCompatible(baseItem.color, item.color)
  );

  if (compatible.length === 0) return pool[0];

  // Return least worn compatible item
  return compatible.sort((a, b) => (a.wear_count || 0) - (b.wear_count || 0))[0];
}

/**
 * Check if two colors are compatible
 */
function areColorsCompatible(color1?: string, color2?: string): boolean {
  if (!color1 || !color2) return true; // No color info, assume compatible

  const c1 = normalizeColor(color1);
  const c2 = normalizeColor(color2);

  // Neutral colors go with everything
  const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'cream', 'navy', 'brown'];
  if (neutrals.includes(c1) || neutrals.includes(c2)) return true;

  // Same color family
  if (c1 === c2) return true;

  // Complementary colors
  const complementary: Record<string, string[]> = {
    'blue': ['orange', 'yellow', 'white'],
    'red': ['green', 'white', 'black'],
    'green': ['red', 'brown', 'beige'],
    'yellow': ['blue', 'purple', 'gray'],
    'purple': ['yellow', 'green', 'white'],
    'orange': ['blue', 'green', 'brown']
  };

  if (complementary[c1]?.includes(c2)) return true;
  if (complementary[c2]?.includes(c1)) return true;

  // Avoid clashing
  const clashing = [
    ['red', 'pink'],
    ['orange', 'red'],
    ['purple', 'pink']
  ];

  for (const [a, b] of clashing) {
    if ((c1 === a && c2 === b) || (c1 === b && c2 === a)) return false;
  }

  return true; // Default: compatible
}

/**
 * Normalize color names
 */
function normalizeColor(color: string): string {
  const normalized = color.toLowerCase().trim();
  const colorMap: Record<string, string> = {
    'navy': 'blue',
    'cobalt': 'blue',
    'teal': 'blue',
    'sky': 'blue',
    'burgundy': 'red',
    'maroon': 'red',
    'crimson': 'red',
    'coral': 'orange',
    'tan': 'beige',
    'khaki': 'beige',
    'ivory': 'cream'
  };

  return colorMap[normalized] || normalized;
}

/**
 * Create outfit recommendation with scoring
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
 * Analyze color harmony
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

  // Monochromatic (same color)
  if (uniqueColors.length === 1) {
    return { score: 0.9, type: 'monochromatic', description: 'Monochromatic color scheme creates a cohesive look' };
  }

  // Neutral palette
  if (neutralCount === colors.length) {
    return { score: 1.0, type: 'neutral', description: 'Classic neutral palette - always elegant' };
  }

  // Mixed with neutrals
  if (neutralCount > 0) {
    return { score: 0.95, type: 'balanced', description: 'Well-balanced colors with neutral accents' };
  }

  // Complementary colors
  const hasComplementary = uniqueColors.some((c1, i) => 
    uniqueColors.slice(i + 1).some(c2 => areColorsCompatible(c1, c2))
  );

  if (hasComplementary) {
    return { score: 0.85, type: 'complementary', description: 'Complementary colors create visual interest' };
  }

  return { score: 0.7, type: 'mixed', description: 'Colorful combination' };
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

  for (const outfit of outfits) {
    if (diverse.length >= count) break;

    // Check if this outfit shares too many items with already selected outfits
    const itemIds = outfit.items.map(item => item.id);
    const overlap = itemIds.filter(id => usedItems.has(id)).length;

    // Allow if less than 50% overlap
    if (overlap < itemIds.length * 0.5) {
      diverse.push(outfit);
      itemIds.forEach(id => usedItems.add(id));
    }
  }

  return diverse;
}
