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

// Function to analyze color harmony
export function analyzeColorHarmony(items: WardrobeItem[]): any {
  // Get all colors from items
  const colors = items
    .map(item => item.color?.toLowerCase().trim())
    .filter((color): color is string => !!color);

  if (colors.length < 2) {
    return {
      colors,
      harmonyType: "monochromatic",
      explanation: "Single color outfit"
    };
  }

  // Basic color harmony analysis
  const uniqueColors = Array.from(new Set(colors));
  
  if (uniqueColors.length === 1) {
    return {
      colors: uniqueColors,
      harmonyType: "monochromatic",
      explanation: "Single color outfit creating a sleek, unified look"
    };
  }

  // Simple complementary check
  const isComplementary = (
    (colors.includes("blue") && colors.includes("orange")) ||
    (colors.includes("red") && colors.includes("green")) ||
    (colors.includes("yellow") && colors.includes("purple"))
  );

  if (isComplementary) {
    return {
      colors: uniqueColors,
      harmonyType: "complementary",
      explanation: "High contrast complementary colors create a bold, dynamic look"
    };
  }

  // Analogous colors check (simplified)
  const colorWheel = ["red", "orange", "yellow", "green", "blue", "purple"];
  const isAnalogous = uniqueColors.every(color => {
    const index = colorWheel.indexOf(color);
    return index !== -1 && uniqueColors.every(c => 
      Math.abs(colorWheel.indexOf(c) - index) <= 1 ||
      Math.abs(colorWheel.indexOf(c) - index) === colorWheel.length - 1
    );
  });

  if (isAnalogous) {
    return {
      colors: uniqueColors,
      harmonyType: "analogous",
      explanation: "Similar colors create a harmonious, cohesive look"
    };
  }

  // Neutral combination
  const neutrals = ["black", "white", "gray", "beige", "brown", "navy"];
  const isNeutral = uniqueColors.every(color => neutrals.includes(color));

  if (isNeutral) {
    return {
      colors: uniqueColors,
      harmonyType: "neutral",
      explanation: "Classic neutral combination for a sophisticated look"
    };
  }

  // Default return for other combinations
  return {
    colors: uniqueColors,
    harmonyType: "mixed",
    explanation: "Mixed color palette creating an eclectic look"
  };
}