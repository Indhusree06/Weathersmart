/**
 * Auto-categorization utility for wardrobe items
 * Intelligently assigns categories based on item name, description, and tags
 */

export type ItemCategory = 'top' | 'bottom' | 'outerwear' | 'dress' | 'shoes' | 'accessory' | 'other';

interface WardrobeItem {
  name: string;
  description?: string;
  tags?: string[];
  category?: string;
}

/**
 * Automatically categorize a wardrobe item based on its properties
 */
export function autoCategorizeItem(item: WardrobeItem): ItemCategory {
  const name = (item.name || '').toLowerCase();
  const description = (item.description || '').toLowerCase();
  const tags = (item.tags || []).map(tag => tag.toLowerCase());
  const allText = `${name} ${description} ${tags.join(' ')}`;

  // Shoes category
  if (
    allText.includes('shoe') ||
    allText.includes('boot') ||
    allText.includes('sneaker') ||
    allText.includes('sandal') ||
    allText.includes('heel') ||
    allText.includes('pump') ||
    allText.includes('loafer') ||
    allText.includes('oxford') ||
    allText.includes('ankle boot') ||
    allText.includes('footwear')
  ) {
    return 'shoes';
  }

  // Dress category
  if (
    allText.includes('dress') ||
    allText.includes('gown') ||
    allText.includes('maxi') ||
    allText.includes('midi dress') ||
    allText.includes('mini dress')
  ) {
    return 'dress';
  }

  // Outerwear category
  if (
    allText.includes('jacket') ||
    allText.includes('coat') ||
    allText.includes('blazer') ||
    allText.includes('cardigan') ||
    allText.includes('sweater') ||
    allText.includes('hoodie') ||
    allText.includes('parka') ||
    allText.includes('trench') ||
    allText.includes('bomber') ||
    allText.includes('denim jacket') ||
    allText.includes('leather jacket') ||
    allText.includes('outerwear')
  ) {
    return 'outerwear';
  }

  // Bottom category
  if (
    allText.includes('pant') ||
    allText.includes('jean') ||
    allText.includes('trouser') ||
    allText.includes('short') ||
    allText.includes('skirt') ||
    allText.includes('legging') ||
    allText.includes('bottom') ||
    allText.includes('cargo') ||
    allText.includes('chino')
  ) {
    return 'bottom';
  }

  // Accessory category
  if (
    allText.includes('bag') ||
    allText.includes('purse') ||
    allText.includes('belt') ||
    allText.includes('scarf') ||
    allText.includes('hat') ||
    allText.includes('jewelry') ||
    allText.includes('necklace') ||
    allText.includes('bracelet') ||
    allText.includes('earring') ||
    allText.includes('watch') ||
    allText.includes('sunglasses') ||
    allText.includes('accessory')
  ) {
    return 'accessory';
  }

  // Top category (default for shirts, blouses, etc.)
  if (
    allText.includes('shirt') ||
    allText.includes('blouse') ||
    allText.includes('top') ||
    allText.includes('tee') ||
    allText.includes('t-shirt') ||
    allText.includes('tank') ||
    allText.includes('cami') ||
    allText.includes('polo') ||
    allText.includes('tunic') ||
    allText.includes('crop')
  ) {
    return 'top';
  }

  // If we can't determine, return 'other'
  return 'other';
}

/**
 * Get a human-readable category name
 */
export function getCategoryDisplayName(category: ItemCategory): string {
  const displayNames: Record<ItemCategory, string> = {
    top: 'Top',
    bottom: 'Bottom',
    outerwear: 'Outerwear',
    dress: 'Dress',
    shoes: 'Shoes',
    accessory: 'Accessory',
    other: 'Other'
  };
  return displayNames[category];
}

/**
 * Batch categorize multiple items
 */
export function batchCategorizeItems(items: WardrobeItem[]): Map<string, ItemCategory> {
  const categorizedItems = new Map<string, ItemCategory>();
  
  items.forEach((item, index) => {
    const category = autoCategorizeItem(item);
    categorizedItems.set(item.name || `item-${index}`, category);
  });
  
  return categorizedItems;
}
