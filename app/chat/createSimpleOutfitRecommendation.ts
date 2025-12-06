// Types for wardrobe items and outfits
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

interface Outfit {
  id?: string;
  name: string;
  items: WardrobeItem[];
  description: string;
  reasoning: string;
  colorHarmony?: any;
  occasion?: string;
  weather_suitability?: string;
  style_notes?: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

// Function to create a simple outfit recommendation based on available wardrobe items
export const createSimpleOutfitRecommendation = (
  currentWardrobeItems: WardrobeItem[],
  setCurrentOutfit: (outfit: Outfit | null) => void,
  addMessage: (message: ChatMessage) => void,
  userInput: string = ''
): boolean => {
  if (!currentWardrobeItems || currentWardrobeItems.length === 0) {
    return false;
  }
  
  // Detect occasion from user input
  const occasion = detectOccasion(userInput);
  let filteredItems = currentWardrobeItems;
  
  // Filter by occasion if detected
  if (occasion) {
    filteredItems = filterByOccasion(currentWardrobeItems, occasion);
    
    // If no items match the occasion, fall back to all items
    if (filteredItems.length === 0) {
      filteredItems = currentWardrobeItems;
    }
  }
  
  // Check if there are any dresses in the wardrobe
  const dresses = filteredItems.filter(item => 
    item.category?.toLowerCase().includes('dress') || 
    item.name?.toLowerCase().includes('dress')
  );
  
  // Check if there are tops and bottoms
  const tops = filteredItems.filter(item => 
    item.category?.toLowerCase().includes('top') || 
    item.category?.toLowerCase().includes('shirt') || 
    item.name?.toLowerCase().includes('top') || 
    item.name?.toLowerCase().includes('shirt') || 
    item.name?.toLowerCase().includes('blouse')
  );
  
  const bottoms = filteredItems.filter(item => 
    item.category?.toLowerCase().includes('bottom') || 
    item.category?.toLowerCase().includes('pants') || 
    item.category?.toLowerCase().includes('skirt') || 
    item.name?.toLowerCase().includes('pants') || 
    item.name?.toLowerCase().includes('skirt') || 
    item.name?.toLowerCase().includes('jeans')
  );
  
  // Create an outfit based on available items
  let outfitItems: WardrobeItem[] = [];
  let outfitDescription = "";
  let occasionText = occasion ? ` for ${occasion}` : "";
  
  if (dresses.length > 0 && (occasion === "formal" || occasion === "party" || occasion === "date" || !occasion || userInput.toLowerCase().includes("dress"))) {
    // If we have dresses, use one as the main outfit piece
    const selectedDress = dresses[Math.floor(Math.random() * dresses.length)];
    outfitItems.push(selectedDress);
    outfitDescription = `I found this ${selectedDress.name} in your wardrobe that would make a great outfit${occasionText}!`;
    
    // Add accessories if available
    const accessories = filteredItems.filter(item => 
      item.category?.toLowerCase().includes('accessory') || 
      item.category?.toLowerCase().includes('jewelry')
    );
    
    if (accessories.length > 0) {
      const selectedAccessory = accessories[Math.floor(Math.random() * accessories.length)];
      outfitItems.push(selectedAccessory);
      outfitDescription += ` Pair it with ${selectedAccessory.name} to complete the look.`;
    }
  } else if (tops.length > 0 && bottoms.length > 0) {
    // If we have tops and bottoms, create an outfit with them
    const selectedTop = tops[Math.floor(Math.random() * tops.length)];
    const selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    outfitItems.push(selectedTop, selectedBottom);
    outfitDescription = `I found a great outfit combination in your wardrobe${occasionText}: ${selectedTop.name} with ${selectedBottom.name}.`;
    
    // Add accessories for certain occasions
    if (occasion && (occasion !== "casual" && occasion !== "workout")) {
      const accessories = filteredItems.filter(item => 
        item.category?.toLowerCase().includes('accessory') || 
        item.category?.toLowerCase().includes('jewelry')
      );
      
      if (accessories.length > 0) {
        const selectedAccessory = accessories[Math.floor(Math.random() * accessories.length)];
        outfitItems.push(selectedAccessory);
        outfitDescription += ` Complete the look with ${selectedAccessory.name}.`;
      }
    }
  } else {
    // If we don't have enough items to create a proper outfit, use whatever we have
    const randomItems = filteredItems.slice(0, Math.min(3, filteredItems.length));
    outfitItems = randomItems;
    outfitDescription = `Here are some items from your wardrobe that you might like${occasionText}: ${randomItems.map(item => item.name).join(', ')}.`;
  }
  
  if (outfitItems.length === 0) {
    return false;
  }
  
  // Create the outfit object
  // Analyze color harmony
  const colorHarmony = analyzeColorHarmony(outfitItems);
  
  const outfit: Outfit = {
    items: outfitItems,
    name: occasion ? `${capitalize(occasion)} Outfit` : "Personalized Outfit",
    description: outfitDescription,
    reasoning: occasion ? `Based on ${occasion} occasion and available wardrobe items` : "Based on the items available in your wardrobe",
    colorHarmony: colorHarmony
  };
  
  // Set the current outfit
  setCurrentOutfit(outfit);
  
  // Add a message about the outfit
  addMessage({
    id: `bot-outfit-${Date.now()}`,
    role: "bot",
    content: `I've put together an outfit${occasionText} based on what's in your wardrobe: ${outfitDescription}`,
    timestamp: new Date().toISOString(),
  });
  
  return true;
}

// Helper function to detect occasion from user input
function detectOccasion(input: string): string | null {
  const inputLower = input.toLowerCase();
  
  // Map of keywords to occasions
  const occasionMap: Record<string, string[]> = {
    'casual': ['casual', 'everyday', 'daily', 'relaxed', 'comfortable', 'weekend', 'chill'],
    'formal': ['formal', 'business', 'professional', 'office', 'work', 'meeting', 'interview'],
    'party': ['party', 'celebration', 'event', 'night out', 'club', 'festive'],
    'date': ['date', 'dinner', 'romantic', 'evening out'],
    'workout': ['workout', 'exercise', 'gym', 'fitness', 'sport', 'athletic', 'running'],
    'beach': ['beach', 'pool', 'swimming', 'vacation', 'resort', 'summer'],
    'winter': ['winter', 'cold', 'snow', 'freezing']
  };
  
  // Check for each occasion
  for (const [occasion, keywords] of Object.entries(occasionMap)) {
    if (keywords.some(keyword => inputLower.includes(keyword))) {
      return occasion;
    }
  }
  
  return null;
}

// Helper function to filter items by occasion
function filterByOccasion(items: WardrobeItem[], occasion: string): WardrobeItem[] {
  return items.filter(item => {
    const itemName = item.name?.toLowerCase() || '';
    const itemCategory = item.category?.toLowerCase() || '';
    const itemTags = item.tags || [];
    const itemDescription = item.description?.toLowerCase() || '';
    
    // Check if the item has tags that match the occasion
    if (Array.isArray(itemTags)) {
      const tagStrings = itemTags.map(tag => typeof tag === 'string' ? tag.toLowerCase() : '');
      if (tagStrings.includes(occasion) || tagStrings.some(tag => tag.includes(occasion))) {
        return true;
      }
    }
    
    // Check based on occasion
    switch (occasion) {
      case 'casual':
        return itemName.includes('casual') || 
               itemCategory.includes('casual') || 
               itemDescription.includes('casual') ||
               itemName.includes('jeans') || 
               itemName.includes('t-shirt') || 
               itemName.includes('sneaker');
      case 'formal':
        return itemName.includes('formal') || 
               itemCategory.includes('formal') || 
               itemDescription.includes('formal') ||
               itemName.includes('suit') || 
               itemName.includes('blazer') || 
               itemName.includes('dress shirt');
      case 'party':
        return itemName.includes('party') || 
               itemCategory.includes('party') || 
               itemDescription.includes('party') ||
               itemName.includes('sequin') || 
               itemName.includes('cocktail');
      case 'date':
        return itemName.includes('date') || 
               itemCategory.includes('date') || 
               itemDescription.includes('date') ||
               itemName.includes('elegant') || 
               itemName.includes('dress');
      case 'workout':
        return itemName.includes('workout') || 
               itemCategory.includes('workout') || 
               itemDescription.includes('workout') ||
               itemName.includes('athletic') || 
               itemName.includes('sport') ||
               itemName.includes('gym');
      case 'beach':
        return itemName.includes('beach') || 
               itemCategory.includes('beach') || 
               itemDescription.includes('beach') ||
               itemName.includes('swimsuit') || 
               itemName.includes('sandal') ||
               itemName.includes('summer');
      case 'winter':
        return itemName.includes('winter') || 
               itemCategory.includes('winter') || 
               itemDescription.includes('winter') ||
               itemName.includes('coat') || 
               itemName.includes('sweater') ||
               itemName.includes('boots');
      default:
        return true;
    }
  });
}

// Helper function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to analyze color harmony with detailed descriptions
export function analyzeColorHarmony(items: WardrobeItem[]): any {
  // Get all colors from items
  const colors = items
    .map(item => item.color?.toLowerCase().trim())
    .filter((color): color is string => !!color);

  const uniqueColors = Array.from(new Set(colors));
  
  // Normalize color names for matching
  const normalizeColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      'navy': 'blue', 'cobalt': 'blue', 'teal': 'blue', 'turquoise': 'blue', 'sky blue': 'blue', 'light blue': 'blue',
      'burgundy': 'red', 'maroon': 'red', 'crimson': 'red', 'coral': 'red', 'pink': 'red', 'rose': 'red',
      'olive': 'green', 'sage': 'green', 'mint': 'green', 'lime': 'green', 'forest': 'green', 'emerald': 'green',
      'mustard': 'yellow', 'gold': 'yellow', 'cream': 'yellow', 'ivory': 'yellow',
      'violet': 'purple', 'lavender': 'purple', 'plum': 'purple', 'magenta': 'purple',
      'tan': 'brown', 'camel': 'brown', 'chocolate': 'brown', 'khaki': 'brown', 'taupe': 'brown',
      'charcoal': 'gray', 'grey': 'gray', 'silver': 'gray',
      'off-white': 'white', 'offwhite': 'white', 'cream': 'white', 'ivory': 'white'
    };
    return colorMap[color] || color;
  };
  
  const normalizedColors = uniqueColors.map(normalizeColor);
  
  // Neutrals definition
  const neutrals = ['black', 'white', 'gray', 'grey', 'beige', 'brown', 'tan', 'cream', 'ivory', 'navy', 'khaki', 'taupe', 'charcoal'];
  const isNeutralColor = (color: string) => neutrals.some(n => color.includes(n));
  
  // Count neutral vs accent colors
  const neutralCount = uniqueColors.filter(isNeutralColor).length;
  const accentColors = uniqueColors.filter(c => !isNeutralColor(c));
  
  if (colors.length < 2 || uniqueColors.length === 1) {
    const color = uniqueColors[0] || 'unknown';
    return {
      colors: uniqueColors,
      harmonyType: "Monochromatic",
      explanation: `A single-color outfit in ${color} creates a sleek, streamlined look.`,
      styleNotes: `Monochromatic outfits are effortlessly chic. The ${color} creates visual continuity from head to toe, making you appear taller and more put-together.`,
      howItWorks: `When you wear one color throughout, there's nothing to break up your silhouette. This creates an elongating effect and looks very intentional.`
    };
  }

  // Check for complementary colors (opposite on color wheel)
  const complementaryPairs: [string, string, string][] = [
    ['blue', 'orange', 'Blue and orange are direct opposites on the color wheel - blue\'s cool calmness balances orange\'s warm energy, creating exciting visual tension.'],
    ['red', 'green', 'Red and green sit across from each other on the color wheel. While bold, this pairing feels fresh and balanced when done in muted tones.'],
    ['yellow', 'purple', 'Yellow and purple are complementary opposites - the sunny warmth of yellow plays beautifully against purple\'s rich depth.'],
    ['pink', 'green', 'Pink and green is a fresh, spring-inspired pairing. The soft femininity of pink balances the natural freshness of green.'],
    ['navy', 'orange', 'Navy and orange is a classic complementary combo - the deep, serious navy grounds the playful pop of orange.'],
    ['teal', 'coral', 'Teal and coral create a beach-inspired palette - cool ocean tones meet warm sunset hues for a balanced, tropical feel.']
  ];
  
  for (const [color1, color2, description] of complementaryPairs) {
    if ((normalizedColors.includes(color1) || uniqueColors.some(c => c.includes(color1))) && 
        (normalizedColors.includes(color2) || uniqueColors.some(c => c.includes(color2)))) {
      return {
        colors: uniqueColors,
        harmonyType: "Complementary",
        explanation: description,
        styleNotes: `Complementary colors create maximum contrast and visual interest. This bold pairing draws attention and shows confidence in your style choices.`,
        howItWorks: `These colors sit opposite each other on the color wheel. When placed together, each color makes the other appear more vibrant and intense.`
      };
    }
  }

  // Check for analogous colors (neighbors on color wheel)
  const analogousGroups: [string[], string][] = [
    [['red', 'orange', 'yellow'], 'These warm colors flow naturally together like a sunset - from fiery red through orange to sunny yellow, creating a cohesive, energetic palette.'],
    [['yellow', 'green', 'blue'], 'This cool-to-warm transition moves smoothly through nature\'s colors - sunshine yellow, leafy green, and sky blue blend seamlessly.'],
    [['blue', 'purple', 'pink'], 'These cool tones create a dreamy, sophisticated gradient - from calm blue through regal purple to soft pink.'],
    [['green', 'blue', 'teal'], 'Ocean-inspired colors that flow together naturally - the cool freshness of green, blue, and teal creates a serene, harmonious look.'],
    [['red', 'pink', 'purple'], 'A romantic color story moving from passionate red through soft pink to luxurious purple - feminine and bold.'],
    [['orange', 'yellow', 'gold'], 'Warm, sunny tones that radiate energy - like capturing golden hour in an outfit.']
  ];
  
  for (const [colorGroup, description] of analogousGroups) {
    const matchCount = colorGroup.filter(c => 
      normalizedColors.includes(c) || uniqueColors.some(uc => uc.includes(c))
    ).length;
    if (matchCount >= 2) {
      return {
        colors: uniqueColors,
        harmonyType: "Analogous",
        explanation: description,
        styleNotes: `Analogous colors are neighbors on the color wheel, so they naturally look good together. This creates a harmonious, pleasing-to-the-eye outfit.`,
        howItWorks: `Because these colors share undertones, they blend smoothly without competing. The result is cohesive and easy on the eyes.`
      };
    }
  }

  // Neutral + Pop of Color
  if (neutralCount >= 1 && accentColors.length === 1) {
    const accent = accentColors[0];
    const neutralsUsed = uniqueColors.filter(isNeutralColor).join(' and ');
    return {
      colors: uniqueColors,
      harmonyType: "Neutral + Accent",
      explanation: `A classic combination of ${neutralsUsed} with a pop of ${accent}. The neutrals provide a sophisticated base while ${accent} adds personality and visual interest.`,
      styleNotes: `This is the easiest way to incorporate color into your wardrobe. The neutral foundation keeps things grounded while the accent color becomes the star.`,
      howItWorks: `Neutrals don't compete for attention, so your ${accent} piece becomes the focal point. This makes getting dressed easy - just add one colorful item to your basics!`
    };
  }

  // All neutrals
  if (neutralCount === uniqueColors.length) {
    const neutralList = uniqueColors.join(', ');
    
    // Check for specific neutral combinations
    if (uniqueColors.some(c => c.includes('black')) && uniqueColors.some(c => c.includes('white'))) {
      return {
        colors: uniqueColors,
        harmonyType: "Classic Contrast",
        explanation: `Black and white is the most timeless color combination in fashion. The stark contrast is bold yet always appropriate.`,
        styleNotes: `This high-contrast pairing is graphic, modern, and endlessly chic. It works for any occasion from casual to formal.`,
        howItWorks: `Black and white create maximum contrast without any color competition. It's clean, sharp, and makes a statement through simplicity.`
      };
    }
    
    if (uniqueColors.some(c => c.includes('navy')) && uniqueColors.some(c => c.includes('white') || c.includes('cream'))) {
      return {
        colors: uniqueColors,
        harmonyType: "Nautical Classic",
        explanation: `Navy and white is a crisp, preppy combination inspired by maritime style. It's fresh, clean, and eternally stylish.`,
        styleNotes: `This combination reads as polished and put-together. It's perfect for both casual and semi-formal occasions.`,
        howItWorks: `The deep richness of navy pairs beautifully with bright white, creating a clean contrast that's softer than black and white.`
      };
    }
    
    if (uniqueColors.some(c => c.includes('brown') || c.includes('tan') || c.includes('camel')) && 
        uniqueColors.some(c => c.includes('black') || c.includes('navy'))) {
      return {
        colors: uniqueColors,
        harmonyType: "Earth Tones",
        explanation: `Mixing ${neutralList} creates a rich, sophisticated palette. These earth-inspired tones are inherently harmonious.`,
        styleNotes: `Earth tones feel grounded and luxurious. This combination works beautifully in fall/winter and adds warmth to any look.`,
        howItWorks: `These colors all exist in nature together, so they naturally complement each other. The warm browns soften the cool darks.`
      };
    }
    
    return {
      colors: uniqueColors,
      harmonyType: "Neutral Palette",
      explanation: `A sophisticated neutral combination of ${neutralList}. These versatile colors create an elegant, understated look.`,
      styleNotes: `An all-neutral outfit is the epitome of quiet luxury. It looks expensive, intentional, and effortlessly chic.`,
      howItWorks: `Neutrals work together because none compete for attention. The interest comes from textures, silhouettes, and subtle tonal variations.`
    };
  }

  // Triadic (three colors equally spaced on wheel)
  const triadicGroups: [string[], string][] = [
    [['red', 'yellow', 'blue'], 'The primary color trio - bold, playful, and energetic. Each color is equally strong, creating a vibrant, balanced look.'],
    [['orange', 'green', 'purple'], 'The secondary color trio - rich, artistic, and unexpected. This combination feels creative and fashion-forward.'],
    [['pink', 'yellow', 'blue'], 'A softer take on the primary trio - cheerful, fresh, and youthful.']
  ];
  
  for (const [colorGroup, description] of triadicGroups) {
    const matchCount = colorGroup.filter(c => 
      normalizedColors.includes(c) || uniqueColors.some(uc => uc.includes(c))
    ).length;
    if (matchCount >= 3) {
      return {
        colors: uniqueColors,
        harmonyType: "Triadic",
        explanation: description,
        styleNotes: `Triadic color schemes are vibrant and bold. This takes confidence to pull off, but the payoff is a head-turning, memorable outfit.`,
        howItWorks: `These three colors are equally spaced around the color wheel, creating perfect balance. Each color gets equal visual weight.`
      };
    }
  }

  // Warm colors combination
  const warmColors = ['red', 'orange', 'yellow', 'coral', 'pink', 'gold', 'burgundy', 'rust'];
  const hasWarm = uniqueColors.some(c => warmColors.some(w => c.includes(w) || normalizeColor(c) === w));
  const coolColors = ['blue', 'green', 'purple', 'teal', 'navy', 'mint'];
  const hasCool = uniqueColors.some(c => coolColors.some(w => c.includes(w) || normalizeColor(c) === w));
  
  if (hasWarm && !hasCool && accentColors.length >= 2) {
    return {
      colors: uniqueColors,
      harmonyType: "Warm Harmony",
      explanation: `A warm color palette that radiates energy and confidence. These sun-inspired tones naturally complement each other.`,
      styleNotes: `Warm colors advance toward the eye, making this combination attention-grabbing and energetic. Perfect for making a statement.`,
      howItWorks: `All warm colors share yellow or red undertones, so they blend harmoniously. The effect is cohesive and inviting.`
    };
  }
  
  if (hasCool && !hasWarm && accentColors.length >= 2) {
    return {
      colors: uniqueColors,
      harmonyType: "Cool Harmony",
      explanation: `A cool color palette that feels calm and sophisticated. These ocean and sky-inspired tones create a serene look.`,
      styleNotes: `Cool colors recede, creating a calming effect. This combination feels polished, professional, and refreshing.`,
      howItWorks: `Cool colors share blue undertones, making them natural partners. The result is soothing and elegant.`
    };
  }

  // Default - mixed/eclectic
  const colorList = uniqueColors.join(', ');
  return {
    colors: uniqueColors,
    harmonyType: "Eclectic Mix",
    explanation: `An adventurous combination of ${colorList}. This unexpected pairing shows creative confidence and personal style.`,
    styleNotes: `Sometimes the best outfits break the rules! This mix might not follow traditional color theory, but fashion is about self-expression.`,
    howItWorks: `While these colors aren't traditional partners, wearing them with confidence makes it work. The key is owning your unique style!`
  };
}