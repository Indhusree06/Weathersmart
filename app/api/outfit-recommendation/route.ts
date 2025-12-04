import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { occasion, weather, userId, profileId, profileAge, profileRelationship, profileName, randomSeed, timestamp } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }
    
    // Detect if this is a child profile
    const childRelationships = ['child', 'son', 'daughter', 'grandchild', 'kid', 'kids'];
    const isChildProfile = (profileAge && profileAge < 13) || 
                           (profileRelationship && childRelationships.includes(profileRelationship.toLowerCase()));
    const isTeenProfile = profileAge && profileAge >= 13 && profileAge < 18;
    
    console.log(`[Outfit API] Profile: ${profileName || 'Unknown'}, Age: ${profileAge || 'N/A'}, Relationship: ${profileRelationship || 'N/A'}, isChild: ${isChildProfile}, isTeen: ${isTeenProfile}`)

    // Fetch wardrobe items for the selected profile
    let wardrobeItems = []
    if (userId) {
      // First try to get items with profile filter if profileId is provided
      if (profileId) {
        try {
          console.log(`Trying to fetch wardrobe items for user ${userId} and profile ${profileId}`)
          const { data: profileItems, error: profileError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', userId)
            .eq('wardrobe_profile_id', profileId)
          
          if (profileError) {
            console.error("Error fetching profile-specific wardrobe items:", profileError)
          } else if (profileItems && profileItems.length > 0) {
            wardrobeItems = profileItems
            console.log(`Fetched ${wardrobeItems.length} wardrobe items for user ${userId} and profile ${profileId}`)
          } else {
            console.log(`No items found for profile ${profileId}, falling back to all user items`)
          }
        } catch (error) {
          console.error("Error with profile filtering:", error)
        }
      }
      
      // If no items found with profile filter or no profileId provided, get all user items
      if (wardrobeItems.length === 0) {
        const { data: allUserItems, error } = await supabase
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', userId)
        
        if (error) {
          console.error("Error fetching all user wardrobe items:", error)
          return NextResponse.json({ error: "Failed to fetch wardrobe items" }, { status: 500 })
        }

        wardrobeItems = allUserItems || []
        console.log(`Fetched ${wardrobeItems.length} total wardrobe items for user ${userId}`)
      }
    }

    if (wardrobeItems.length === 0) {
      return NextResponse.json(
        {
          error: "No wardrobe items found",
          message: "Please add some clothes to your wardrobe first!",
        },
        { status: 404 },
      )
    }

    console.log(`[Outfit API] Selecting outfit for occasion: ${occasion}, weather: ${weather}`)
    console.log(`[Outfit API] Available wardrobe items: ${wardrobeItems.length}`)
    
    // Parse weather information
    const tempMatch = weather?.match(/(\d+)/);
    const temperature = tempMatch ? parseInt(tempMatch[1]) : 70;
    const weatherLower = (weather || '').toLowerCase();
    const isHot = temperature > 80 || weatherLower.includes('hot') || (weatherLower.includes('sunny') && temperature > 75);
    const isCold = temperature < 55 || weatherLower.includes('cold') || weatherLower.includes('winter') || weatherLower.includes('snow');
    const isRainy = weatherLower.includes('rain') || weatherLower.includes('storm') || weatherLower.includes('drizzle') || weatherLower.includes('shower');
    const isWindy = weatherLower.includes('wind') || weatherLower.includes('breezy');
    const isMild = !isHot && !isCold;
    
    console.log(`[Outfit API] Weather analysis: temp=${temperature}°F, hot=${isHot}, cold=${isCold}, rainy=${isRainy}, windy=${isWindy}`)
    
    // WEATHER-BASED EXCLUSION: Filter out inappropriate items for current weather
    const filterByWeather = (item: any): boolean => {
      const name = (item.name || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const allText = `${name} ${category}`;
      
      // Items to EXCLUDE in rainy weather
      if (isRainy) {
        if (allText.match(/sandal|open.?toe|suede|silk|canvas|espadrille|flip.?flop/)) {
          console.log(`[Outfit API] Excluding ${item.name} - not suitable for rain`);
          return false;
        }
      }
      
      // Items to EXCLUDE in cold weather
      if (isCold) {
        if (allText.match(/sandal|flip.?flop|tank|crop.?top|short[^s]|mini.?skirt|sleeveless/)) {
          console.log(`[Outfit API] Excluding ${item.name} - not suitable for cold`);
          return false;
        }
      }
      
      // Items to EXCLUDE in hot weather
      if (isHot) {
        if (allText.match(/wool|heavy|thick|puffer|down.?jacket|winter|fleece|thermal/)) {
          console.log(`[Outfit API] Excluding ${item.name} - not suitable for hot weather`);
          return false;
        }
      }
      
      return true;
    };
    
    // Apply weather filter to all items
    const weatherFilteredItems = wardrobeItems.filter(filterByWeather);
    console.log(`[Outfit API] Items after weather filtering: ${weatherFilteredItems.length} (filtered out ${wardrobeItems.length - weatherFilteredItems.length})`)
    
    // Helper to check if item is a "set" (blazer and trousers set, etc.)
    const isSetItem = (item: any): boolean => {
      const name = (item.name || '').toLowerCase();
      return name.includes(' and ') || name.includes(' set') || name.includes(' suit');
    };
    
    // Helper to check if item is work/formal attire
    const isWorkFormalItem = (item: any): boolean => {
      const name = (item.name || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      return name.match(/blazer|trouser|slack|suit|formal|business|dress.?shirt|office/) !== null ||
             category.match(/formal|business|work/) !== null;
    };
    
    // Helper function to score item relevance for an occasion
    const scoreItemForOccasion = (item: any, targetOccasion: string): number => {
      const name = (item.name || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags.map((t: string) => t.toLowerCase()) : [];
      const description = (item.description || '').toLowerCase();
      const allText = `${name} ${category} ${tags.join(' ')} ${description}`;
      
      let score = 0;
      
      // CATEGORY-BASED SCORING (default scores based on item category)
      // This ensures items get scores even without specific keywords
      const isDress = category.includes('dress') || name.includes('dress');
      const isTop = category.includes('top') || category.includes('shirt') || name.match(/top|shirt|blouse|tee|tank/);
      const isBottom = category.includes('bottom') || category.includes('pants') || name.match(/pants|jeans|skirt|shorts|trousers/);
      const isOuterwear = category.includes('outerwear') || category.includes('jacket') || name.match(/jacket|coat|blazer|cardigan/);
      const isShoes = category.includes('shoes') || category.includes('footwear') || name.match(/shoes|boots|sneakers|heels|sandals|loafers/);
      const isSneakers = name.match(/sneaker|trainer|running shoe/);
      const isHeels = name.match(/heel|pump|stiletto/);
      const isBoots = name.match(/boot/);
      const isSandals = name.match(/sandal|flip.?flop/);
      const isLoafers = name.match(/loafer|oxford|flat/);
      
      // Occasion-specific scoring with category defaults
      switch (targetOccasion) {
        case 'work':
          if (allText.match(/work|office|professional|business|blazer|dress.?shirt|slacks|trousers/)) score += 15;
          if (isDress && !allText.match(/casual|sundress|beach/)) score += 8;
          if (isOuterwear && allText.match(/blazer/)) score += 10;
          if (isLoafers || isHeels) score += 5;
          if (isSneakers && !allText.match(/clean|white|minimal/)) score -= 5;
          if (allText.match(/jeans|t-shirt|shorts|hoodie|athletic/)) score -= 8;
          break;
          
        case 'formal':
          if (allText.match(/formal|elegant|gala|evening|cocktail|suit|tie|clutch/)) score += 15;
          if (isDress) score += 12;
          if (isHeels) score += 8;
          if (allText.match(/casual|sporty|athletic|sneakers|jeans|hoodie/)) score -= 10;
          if (isSneakers || isSandals) score -= 8;
          break;
          
        case 'party':
          if (allText.match(/party|festive|sparkle|sequin|glitter|cocktail|night|club/)) score += 15;
          if (isDress) score += 10;
          if (isHeels) score += 5;
          if (allText.match(/work|office|athletic|gym|plain/)) score -= 5;
          break;
          
        case 'date':
          if (allText.match(/date|romantic|elegant|nice|pretty|cute/)) score += 12;
          if (isDress) score += 10;
          if (allText.match(/blouse|nice top/)) score += 8;
          if (isHeels || isLoafers) score += 5;
          if (allText.match(/athletic|gym|workout|sporty|sweat/)) score -= 10;
          break;
          
        case 'weekend':
          if (allText.match(/casual|weekend|relaxed|comfortable|everyday/)) score += 12;
          if (allText.match(/jeans|t-shirt|sneakers|hoodie|sweater/)) score += 10;
          if (isSneakers) score += 8;
          if (allText.match(/formal|business|suit|tie|gala/)) score -= 10;
          if (isHeels) score -= 5;
          break;
          
        case 'athletic':
          if (allText.match(/athletic|sport|gym|workout|running|yoga|legging|active/)) score += 15;
          if (isSneakers) score += 10;
          if (allText.match(/formal|elegant|heel|dress|suit|jeans/)) score -= 10;
          break;
          
        case 'beach':
          if (allText.match(/beach|swim|summer|resort|vacation/)) score += 15;
          if (isSandals) score += 10;
          if (allText.match(/sundress|tank|short|linen/)) score += 8;
          if (allText.match(/formal|winter|coat|boot|wool/)) score -= 10;
          break;
          
        case 'weather-based':
        case 'casual':
        default:
          if (allText.match(/casual|everyday|versatile|comfortable/)) score += 8;
          if (isSneakers) score += 3;
          break;
      }
      
      // Weather-based scoring adjustments (bonus points for weather-appropriate items)
      if (isHot) {
        if (allText.match(/light|breathable|cotton|linen|summer/)) score += 8;
        if (allText.match(/sleeveless|short.?sleeve|tank/)) score += 5;
        if (isSandals && !isRainy) score += 5;
      }
      if (isCold) {
        if (allText.match(/warm|sweater|wool|fleece|thermal|layer/)) score += 8;
        if (isOuterwear) score += 10;
        if (isBoots) score += 8;
      }
      if (isRainy) {
        if (allText.match(/waterproof|rain|water.?resistant/)) score += 10;
        if (isBoots) score += 8;
        if (allText.match(/leather/) && isShoes) score += 3; // Leather is more water-resistant
      }
      
      return score;
    };
    
    // Categorize items with scoring - USE WEATHER FILTERED ITEMS
    const categorizeAndScore = (items: any[], targetOccasion: string) => {
      const scored = items.map(item => ({
        ...item,
        _score: scoreItemForOccasion(item, targetOccasion)
      }));
      
      // Sort by score (highest first) - reduced randomization for consistency
      scored.sort((a, b) => {
        const scoreDiff = b._score - a._score;
        // Only randomize if scores are very close (within 1 point)
        if (Math.abs(scoreDiff) <= 1) {
          return Math.random() - 0.5;
        }
        return scoreDiff;
      });
      
      return scored;
    };
    
    // Use weather-filtered items for scoring
    const scoredItems = categorizeAndScore(weatherFilteredItems, occasion);
    console.log(`[Outfit API] Top scored items: ${scoredItems.slice(0, 5).map(i => `${i.name}(${i._score})`).join(', ')}`);
    
    // For casual/weekend occasions, filter out work items and sets from consideration
    const isCasualOccasion = ['casual', 'weekend', 'weather-based'].includes(occasion);
    const itemsForSelection = isCasualOccasion 
      ? scoredItems.filter(item => !isSetItem(item) && !isWorkFormalItem(item))
      : scoredItems;
    
    console.log(`[Outfit API] Items for ${occasion} selection: ${itemsForSelection.length} (excluded ${scoredItems.length - itemsForSelection.length} work/set items)`);
    
    // Categorize items (use filtered items for casual, all scored items for formal)
    const itemPool = isCasualOccasion ? itemsForSelection : scoredItems;
    
    const dresses = itemPool.filter(item => 
      (item.category?.toLowerCase().includes('dress') || 
      item.name?.toLowerCase().includes('dress')) &&
      !isSetItem(item)  // Exclude "dress and jacket set" type items
    );
    
    const tops = itemPool.filter(item => 
      (item.category?.toLowerCase().includes('top') || 
      item.category?.toLowerCase().includes('shirt') || 
      item.name?.toLowerCase().match(/top|shirt|blouse|sweater|tank|tee|hoodie|polo|knit/i)) &&
      !isSetItem(item)
    );
    
    const bottoms = itemPool.filter(item => 
      (item.category?.toLowerCase().includes('bottom') || 
      item.category?.toLowerCase().includes('pants') || 
      item.category?.toLowerCase().includes('skirt') || 
      item.name?.toLowerCase().match(/pants|skirt|jeans|trousers|shorts|legging/i)) &&
      !isSetItem(item)
    );
    
    const outerwear = itemPool.filter(item => 
      (item.category?.toLowerCase().includes('outerwear') || 
      item.category?.toLowerCase().includes('jacket') || 
      item.name?.toLowerCase().match(/jacket|coat|cardigan/i)) &&
      !item.name?.toLowerCase().match(/sweater|knit|hoodie/) && // Don't double-count sweaters as outerwear
      !isSetItem(item)
    );
    
    const shoes = itemPool.filter(item => 
      item.category?.toLowerCase().includes('footwear') || 
      item.category?.toLowerCase().includes('shoes') || 
      item.name?.toLowerCase().match(/shoes|boots|sneakers|heels|sandals|loafers|flats/i)
    );
    
    const accessories = itemPool.filter(item => 
      item.category?.toLowerCase().includes('accessory') || 
      item.category?.toLowerCase().includes('jewelry') ||
      item.name?.toLowerCase().match(/necklace|earring|bracelet|hat|scarf|bag|watch|belt/i)
    );
    
    console.log(`[Outfit API] Categorized items: dresses(${dresses.length}), tops(${tops.length}), bottoms(${bottoms.length}), outerwear(${outerwear.length}), shoes(${shoes.length}), accessories(${accessories.length})`)
    
    // Smart selection based on occasion
    const selected: any[] = [];
    const maxItems = 4;
    
    // Helper to pick best item (highest scored) - prioritize consistency over randomness
    const pickBest = (arr: any[]) => arr.length > 0 ? arr[0] : null;
    // Pick from top 2 items only for slight variety while maintaining quality
    const pickFromTop = (arr: any[]) => arr.length > 0 ? arr[Math.floor(Math.random() * Math.min(2, arr.length))] : null;
    
    // Weather-appropriate shoe selection helper
    const pickBestShoes = (shoeArr: any[]) => {
      if (shoeArr.length === 0) return null;
      
      // For rainy weather, strongly prefer boots or closed shoes
      if (isRainy) {
        const boots = shoeArr.filter(s => s.name?.toLowerCase().match(/boot/));
        if (boots.length > 0) return pickBest(boots);
        const closedShoes = shoeArr.filter(s => !s.name?.toLowerCase().match(/sandal|open|flip/));
        if (closedShoes.length > 0) return pickBest(closedShoes);
      }
      
      // For cold weather, prefer boots or closed shoes
      if (isCold) {
        const boots = shoeArr.filter(s => s.name?.toLowerCase().match(/boot/));
        if (boots.length > 0) return pickBest(boots);
        const closedShoes = shoeArr.filter(s => !s.name?.toLowerCase().match(/sandal|open|flip/));
        if (closedShoes.length > 0) return pickBest(closedShoes);
      }
      
      // For hot weather, sandals are fine
      if (isHot && !isRainy) {
        const sandals = shoeArr.filter(s => s.name?.toLowerCase().match(/sandal/));
        if (sandals.length > 0) return pickFromTop(sandals);
      }
      
      // Default: pick best scored shoe
      return pickBest(shoeArr);
    };
    
    switch (occasion) {
      case 'formal':
      case 'party':
      case 'date':
        // Prefer dresses for formal occasions
        if (dresses.length > 0) {
          selected.push(pickBest(dresses));
        } else if (tops.length > 0 && bottoms.length > 0) {
          // Fallback to top + bottom (prefer skirts for formal)
          selected.push(pickBest(tops));
          const skirts = bottoms.filter(b => b.name?.toLowerCase().includes('skirt'));
          selected.push(skirts.length > 0 ? pickBest(skirts) : pickBest(bottoms));
        }
        // Add weather-appropriate shoes (heels only if not rainy)
        if (shoes.length > 0) {
          if (!isRainy) {
            const formalShoes = shoes.filter(s => s.name?.toLowerCase().match(/heel|pump|dress shoe|loafer/));
            selected.push(formalShoes.length > 0 ? pickBest(formalShoes) : pickBestShoes(shoes));
          } else {
            // Rainy formal: prefer closed-toe, no heels
            selected.push(pickBestShoes(shoes));
          }
        }
        // Add accessories for formal look
        if (accessories.length > 0 && selected.length < maxItems) {
          selected.push(pickBest(accessories));
        }
        // Add outerwear if cold
        if (isCold && outerwear.length > 0 && selected.length < maxItems) {
          selected.push(pickBest(outerwear));
        }
        break;
        
      case 'work':
        // Professional look: top + bottoms (prefer trousers/slacks)
        if (tops.length > 0) {
          const workTops = tops.filter(t => t.name?.toLowerCase().match(/shirt|blouse/));
          selected.push(workTops.length > 0 ? pickBest(workTops) : pickBest(tops));
        }
        if (bottoms.length > 0) {
          const workBottoms = bottoms.filter(b => b.name?.toLowerCase().match(/trouser|slack|pant|skirt/));
          selected.push(workBottoms.length > 0 ? pickBest(workBottoms) : pickBest(bottoms));
        }
        // Add blazer if available (especially for cold)
        const blazers = outerwear.filter(o => o.name?.toLowerCase().includes('blazer'));
        if ((blazers.length > 0 && selected.length < maxItems) || isCold) {
          if (blazers.length > 0) selected.push(pickBest(blazers));
          else if (outerwear.length > 0 && isCold) selected.push(pickBest(outerwear));
        }
        // Add weather-appropriate professional shoes
        if (shoes.length > 0 && selected.length < maxItems) {
          const workShoes = shoes.filter(s => s.name?.toLowerCase().match(/loafer|oxford|pump|flat|dress/));
          if (!isRainy && workShoes.length > 0) {
            selected.push(pickBest(workShoes));
          } else {
            selected.push(pickBestShoes(shoes));
          }
        }
        break;
        
      case 'athletic':
        // Athletic wear
        const athleticTops = tops.filter(t => t.name?.toLowerCase().match(/tank|tee|sport|athletic/));
        const athleticBottoms = bottoms.filter(b => b.name?.toLowerCase().match(/legging|short|athletic|sport/));
        const athleticShoes = shoes.filter(s => s.name?.toLowerCase().match(/sneaker|trainer|running/));
        
        if (athleticTops.length > 0) selected.push(pickBest(athleticTops));
        else if (tops.length > 0) selected.push(pickFromTop(tops));
        
        if (athleticBottoms.length > 0) selected.push(pickBest(athleticBottoms));
        else if (bottoms.length > 0) selected.push(pickFromTop(bottoms));
        
        if (athleticShoes.length > 0) selected.push(pickBest(athleticShoes));
        else if (shoes.length > 0) selected.push(pickBestShoes(shoes));
        
        // Add jacket if cold
        if (isCold && outerwear.length > 0 && selected.length < maxItems) {
          selected.push(pickBest(outerwear));
        }
        break;
        
      case 'beach':
        // Beach/summer wear - but respect rain
        if (isRainy) {
          // Rainy beach day: casual but weather-appropriate
          if (tops.length > 0) selected.push(pickBest(tops));
          if (bottoms.length > 0) selected.push(pickBest(bottoms));
          selected.push(pickBestShoes(shoes));
          if (outerwear.length > 0) selected.push(pickBest(outerwear));
        } else {
          const beachDresses = dresses.filter(d => d.name?.toLowerCase().match(/sundress|summer|beach/));
          const beachTops = tops.filter(t => t.name?.toLowerCase().match(/tank|halter|crop/));
          const beachBottoms = bottoms.filter(b => b.name?.toLowerCase().match(/short|skirt/));
          const beachShoes = shoes.filter(s => s.name?.toLowerCase().match(/sandal|flip|espadrille/));
          
          if (beachDresses.length > 0) {
            selected.push(pickBest(beachDresses));
          } else {
            if (beachTops.length > 0) selected.push(pickBest(beachTops));
            else if (tops.length > 0) selected.push(pickFromTop(tops));
            
            if (beachBottoms.length > 0) selected.push(pickBest(beachBottoms));
            else if (bottoms.length > 0) selected.push(pickFromTop(bottoms));
          }
          
          if (beachShoes.length > 0) selected.push(pickBest(beachShoes));
          else if (shoes.length > 0) selected.push(pickBestShoes(shoes));
        }
        break;
        
      case 'weekend':
      case 'casual':
      case 'weather-based':
      default:
        // Casual/weekend - SIMPLE outfit: 1 top + 1 bottom + shoes (+ outerwear ONLY if very cold/rainy)
        console.log(`[Outfit API] Selecting casual/weekend outfit. Hot=${isHot}, Cold=${isCold}, Rainy=${isRainy}, Temp=${temperature}`);
        
        // Filter out work/formal items for casual occasions
        const casualTops = tops.filter(t => !t.name?.toLowerCase().match(/blazer|dress.?shirt|formal|business|suit/));
        const casualBottoms = bottoms.filter(b => !b.name?.toLowerCase().match(/trouser|slack|dress.?pant|formal|suit/));
        const casualOuterwear = outerwear.filter(o => !o.name?.toLowerCase().match(/blazer|formal|suit/));
        
        console.log(`[Outfit API] Casual items available: tops=${casualTops.length}, bottoms=${casualBottoms.length}, outerwear=${casualOuterwear.length}`);
        
        if (isHot && !isRainy) {
          // Hot & dry weather: light clothes - NO outerwear needed
          const lightDresses = dresses.filter(d => d._score >= 0);
          const lightTops = casualTops.filter(t => t.name?.toLowerCase().match(/tank|tee|t-shirt|short.?sleeve|light|cotton|linen/));
          const lightBottoms = casualBottoms.filter(b => b.name?.toLowerCase().match(/short|skirt|light|linen|jeans/));
          
          if (lightDresses.length > 0 && Math.random() > 0.6) {
            selected.push(pickFromTop(lightDresses));
          } else {
            // Pick ONE top
            if (lightTops.length > 0) selected.push(pickFromTop(lightTops));
            else if (casualTops.length > 0) selected.push(pickFromTop(casualTops));
            else if (tops.length > 0) selected.push(pickFromTop(tops));
            
            // Pick ONE bottom
            if (lightBottoms.length > 0) selected.push(pickFromTop(lightBottoms));
            else if (casualBottoms.length > 0) selected.push(pickFromTop(casualBottoms));
            else if (bottoms.length > 0) selected.push(pickFromTop(bottoms));
          }
          
          // Shoes
          const lightShoes = shoes.filter(s => s.name?.toLowerCase().match(/sandal|sneaker|loafer/));
          if (lightShoes.length > 0) selected.push(pickFromTop(lightShoes));
          else if (shoes.length > 0) selected.push(pickBestShoes(shoes));
          
          // NO outerwear for hot weather
          
        } else if (temperature < 45 || isRainy) {
          // VERY cold (below 45°F) OR rainy: need outerwear
          console.log(`[Outfit API] Very cold or rainy - adding outerwear`);
          
          // Pick ONE warm top (sweater preferred)
          const warmTops = casualTops.filter(t => t.name?.toLowerCase().match(/sweater|knit|hoodie|long.?sleeve|flannel/));
          if (warmTops.length > 0) selected.push(pickBest(warmTops));
          else if (casualTops.length > 0) selected.push(pickBest(casualTops));
          else if (tops.length > 0) selected.push(pickBest(tops));
          
          // Pick ONE bottom (jeans/pants preferred)
          const warmBottoms = casualBottoms.filter(b => b.name?.toLowerCase().match(/jeans|pant/));
          if (warmBottoms.length > 0) selected.push(pickBest(warmBottoms));
          else if (casualBottoms.length > 0) selected.push(pickBest(casualBottoms));
          else if (bottoms.length > 0) selected.push(pickBest(bottoms));
          
          // Weather-appropriate shoes
          if (shoes.length > 0) selected.push(pickBestShoes(shoes));
          
          // Add outerwear ONLY for very cold or rain
          if (casualOuterwear.length > 0) {
            if (isRainy) {
              const rainJackets = casualOuterwear.filter(o => o.name?.toLowerCase().match(/rain|waterproof|jacket/));
              selected.push(rainJackets.length > 0 ? pickBest(rainJackets) : pickBest(casualOuterwear));
            } else {
              // Pick a casual jacket/coat, NOT blazer
              const casualJackets = casualOuterwear.filter(o => o.name?.toLowerCase().match(/jacket|coat|cardigan|hoodie/));
              if (casualJackets.length > 0) selected.push(pickBest(casualJackets));
              else selected.push(pickBest(casualOuterwear));
            }
          } else if (outerwear.length > 0) {
            selected.push(pickBest(outerwear));
          }
          
        } else if (isCold) {
          // Moderately cold (45-55°F): warm top is enough, outerwear optional
          console.log(`[Outfit API] Moderately cold - warm top, maybe light layer`);
          
          // Pick ONE warm top (sweater/long sleeve)
          const warmTops = casualTops.filter(t => t.name?.toLowerCase().match(/sweater|knit|hoodie|long.?sleeve|flannel/));
          if (warmTops.length > 0) selected.push(pickBest(warmTops));
          else if (casualTops.length > 0) selected.push(pickBest(casualTops));
          else if (tops.length > 0) selected.push(pickBest(tops));
          
          // Pick ONE bottom
          const warmBottoms = casualBottoms.filter(b => b.name?.toLowerCase().match(/jeans|pant/));
          if (warmBottoms.length > 0) selected.push(pickBest(warmBottoms));
          else if (casualBottoms.length > 0) selected.push(pickBest(casualBottoms));
          else if (bottoms.length > 0) selected.push(pickBest(bottoms));
          
          // Shoes
          if (shoes.length > 0) selected.push(pickBestShoes(shoes));
          
          // NO outerwear for moderate cold - sweater is enough
          
        } else {
          // Mild weather: standard casual - NO outerwear
          console.log(`[Outfit API] Mild weather - simple outfit, no outerwear`);
          
          if (dresses.length > 0 && Math.random() > 0.7) {
            selected.push(pickFromTop(dresses));
          } else {
            // Pick ONE top
            if (casualTops.length > 0) selected.push(pickFromTop(casualTops));
            else if (tops.length > 0) selected.push(pickFromTop(tops));
            
            // Pick ONE bottom
            if (casualBottoms.length > 0) selected.push(pickFromTop(casualBottoms));
            else if (bottoms.length > 0) selected.push(pickFromTop(bottoms));
          }
          
          // Shoes
          if (shoes.length > 0) selected.push(pickBestShoes(shoes));
          
          // NO outerwear for mild weather
        }
        break;
    }
    
    // Add accessory if we have room
    if (accessories.length > 0 && selected.length < maxItems && Math.random() > 0.5) {
      selected.push(pickRandom(accessories));
    }
    
    console.log(`Selected ${selected.length} items for ${occasion} outfit`)
    const matchedItems = selected.filter(item => item !== null).slice(0, maxItems);

    // CRITICAL FIX: Transform items to ensure they have the correct image field
    // The chat page expects 'image' field, but database stores 'image_url'
    const transformedItems = matchedItems.map(item => ({
      ...item,
      image: item.image_url || item.image_path || item.image || '/images/placeholder.png'
    }));

    // Generate friendly, human-like reasoning based on occasion and weather
    const itemNames = transformedItems.map(item => item.name).join(' + ');
    const itemCount = transformedItems.length;
    const childName = profileName || 'your little one';
    
    // Different greetings for adults vs children
    let greeting = '';
    let weatherNote = '';
    let careTip = '';
    
    if (isChildProfile) {
      // CHILD-SPECIFIC greetings (fun, playful, age-appropriate)
      const childGreetings: Record<string, string[]> = {
        'work': ['Ready for school! 📚', 'Looking smart for class! ✏️', 'School-ready! 🎒'],
        'school': ['Ready for school! 📚', 'Looking smart for class! ✏️', 'All set for learning! 🎒'],
        'formal': ['Looking so adorable! 🌟', 'Picture perfect! 📸', 'So fancy! ✨'],
        'party': ['Party time! 🎈', 'Ready to have fun! 🎉', 'Let\'s celebrate! 🥳'],
        'birthday': ['Happy Birthday vibes! 🎂', 'Birthday party ready! 🎈', 'Time to celebrate! 🎁'],
        'playdate': ['Playdate ready! 🧸', 'Ready for fun with friends! 🎮', 'Let\'s play! 🎨'],
        'playground': ['Playground ready! 🛝', 'Ready to run and play! ⚽', 'Adventure time! 🌳'],
        'date': ['Looking adorable! 💕', 'So cute! 🌸', 'Looking great! ⭐'],
        'weekend': ['Weekend fun! 🎉', 'Ready to play! 🌈', 'Fun day ahead! 🎪'],
        'athletic': ['Sports time! ⚽', 'Ready to play! 🏃', 'Let\'s get active! 🎾'],
        'beach': ['Beach day! 🏖️', 'Splish splash! 🌊', 'Fun in the sun! ☀️'],
        'casual': ['Looking cute! 😊', 'Comfy and adorable! 🌟', 'Ready for anything! 🌈'],
        'weather-based': ['All dressed for today! 🌤️', 'Ready for the day! ☀️', 'Looking great! 🌈']
      };
      
      const childGreetingList = childGreetings[occasion] || childGreetings['casual'];
      greeting = childGreetingList[Math.floor(Math.random() * childGreetingList.length)];
      
      // Child-specific weather notes
      if (isRainy && temperature < 45) {
        weatherNote = `It's ${temperature}°F and rainy - ${childName} will stay warm and dry! 🌧️`;
        careTip = `💡 Tip for ${childName}: Don't forget the umbrella! And remember to keep the jacket zipped up!`;
      } else if (isRainy) {
        weatherNote = `Rain's coming, so ${childName} is all set to splash in puddles (or stay dry)! 🌧️`;
        careTip = `💡 Tip for ${childName}: Wear rain boots if you have them, and don't forget your umbrella!`;
      } else if (temperature < 45) {
        weatherNote = `It's chilly at ${temperature}°F - ${childName} will be nice and cozy! 🧥`;
        careTip = `💡 Tip for ${childName}: Keep your jacket on outside, and don't forget your hat and gloves!`;
      } else if (isCold) {
        weatherNote = `At ${temperature}°F, ${childName} will be comfy without too many layers.`;
        careTip = `💡 Tip for ${childName}: Zip up your jacket when you go outside!`;
      } else if (isHot && temperature > 85) {
        weatherNote = `It's a hot ${temperature}°F - ${childName} will stay cool in these! 😎`;
        careTip = `💡 Tip for ${childName}: Put on sunscreen, wear a hat, and drink lots of water! 🧴💧`;
      } else if (isHot) {
        weatherNote = `It's ${temperature}°F - perfect for playing outside! ☀️`;
        careTip = `💡 Tip for ${childName}: Don't forget sunscreen and drink water to stay hydrated! 💧`;
      } else if (isWindy) {
        weatherNote = `Nice weather at ${temperature}°F but it's breezy - hair might get messy! 💨`;
        careTip = `💡 Tip for ${childName}: Maybe tie your hair back if it's long, and keep your jacket handy!`;
      } else {
        weatherNote = `Perfect ${temperature}°F weather for ${childName} to have fun outside! 🌈`;
        const childMildTips = [
          `💡 Tip for ${childName}: Great day to play outside! Remember to drink water!`,
          `💡 Tip for ${childName}: Have fun today! Don't forget to tie your shoelaces! 👟`,
          `💡 Tip for ${childName}: Perfect weather for the playground! Stay safe and have fun! 🛝`
        ];
        careTip = childMildTips[Math.floor(Math.random() * childMildTips.length)];
      }
    } else if (isTeenProfile) {
      // TEEN-SPECIFIC greetings (cool but not childish)
      const teenGreetings: Record<string, string[]> = {
        'work': ['Ready for school! 📚', 'Looking good for class! ✨', 'School-ready and stylish! 🎒'],
        'school': ['Ready for school! 📚', 'Looking good! ✨', 'All set! 🎒'],
        'formal': ['Looking amazing! 🌟', 'Ready to impress! ✨', 'So stylish! 💫'],
        'party': ['Party time! 🎉', 'Ready to have a blast! 🎊', 'Let\'s go! 🥳'],
        'date': ['Looking great! 💕', 'Date ready! ✨', 'You\'ve got this! 💖'],
        'weekend': ['Weekend mode! 😎', 'Chill vibes! 🌴', 'Ready for fun! 🎉'],
        'athletic': ['Game time! 💪', 'Ready to go! 🏃', 'Let\'s do this! 🔥'],
        'beach': ['Beach ready! 🏖️', 'Summer vibes! ☀️', 'Let\'s go! 🌊'],
        'casual': ['Looking cool! 😎', 'Effortlessly stylish! ✨', 'Nice! 🌟'],
        'weather-based': ['All set for today! 🌤️', 'Ready to go! ☀️', 'Looking good! 🌈']
      };
      
      const teenGreetingList = teenGreetings[occasion] || teenGreetings['casual'];
      greeting = teenGreetingList[Math.floor(Math.random() * teenGreetingList.length)];
      
      // Teen weather notes (similar to adult but slightly more casual)
      if (isRainy && temperature < 45) {
        weatherNote = `It's ${temperature}°F and rainy - you'll stay warm and dry! 🌧️`;
        careTip = `💡 Tip: Grab an umbrella and maybe some lip balm - cold rain is harsh!`;
      } else if (isRainy) {
        weatherNote = `Rain's in the forecast - you're all set! 🌧️`;
        careTip = `💡 Tip: Don't forget your umbrella!`;
      } else if (temperature < 45) {
        weatherNote = `It's ${temperature}°F - bundle up and stay cozy! 🧥`;
        careTip = `💡 Tip: Lip balm and moisturizer are your friends in cold weather!`;
      } else if (isCold) {
        weatherNote = `At ${temperature}°F, you'll be comfortable without too many layers.`;
        careTip = `💡 Tip: A light layer should do the trick!`;
      } else if (isHot) {
        weatherNote = `It's ${temperature}°F - these breathable pieces will keep you cool! 😎`;
        careTip = `💡 Tip: Sunscreen and water - don't skip them! ☀️`;
      } else {
        weatherNote = `Perfect weather at ${temperature}°F! 🌈`;
        careTip = `💡 Tip: Great day to be outside! Stay hydrated!`;
      }
    } else {
      // ADULT greetings (original)
      const adultGreetings: Record<string, string[]> = {
        'work': ['Ready to crush it at work! 💼', 'Looking professional today! 👔', 'Work-ready and looking sharp! ✨'],
        'formal': ['Time to shine! ✨', 'Looking absolutely stunning! 💫', 'Ready to turn heads! 🌟'],
        'party': ['Party time! 🎉', 'Let\'s have some fun! 🎊', 'Ready to celebrate! 🥳'],
        'date': ['Looking amazing for your date! 💕', 'Date night ready! ✨', 'You\'re going to wow them! 💖'],
        'weekend': ['Weekend vibes! 🎉', 'Ready for a great weekend! 😎', 'Chill mode activated! 🌴'],
        'athletic': ['Let\'s get moving! 💪', 'Workout ready! 🏃', 'Time to crush that workout! 🔥'],
        'beach': ['Beach day! 🏖️', 'Sun, sand, and style! ☀️', 'Paradise ready! 🌊'],
        'casual': ['Looking effortlessly cool! 😎', 'Casual but stylish! ✨', 'Easy breezy! 🌿'],
        'weather-based': ['Got you covered for today\'s weather! 🌤️', 'Perfect pick for today! ☀️', 'Weather-ready and stylish! 🌈']
      };
      
      const adultGreetingList = adultGreetings[occasion] || adultGreetings['casual'];
      greeting = adultGreetingList[Math.floor(Math.random() * adultGreetingList.length)];
      
      // Adult weather notes (original)
      if (isRainy && temperature < 45) {
        weatherNote = `It's ${temperature}°F and rainy out there, so I made sure you'll stay warm AND dry! 🌧️`;
        careTip = `💡 Tip: Carry an umbrella and apply moisturizer - cold rain can be harsh on your skin!`;
      } else if (isRainy) {
        weatherNote = `Rain's in the forecast, so you're set with weather-appropriate pieces. Stay dry! 🌧️`;
        careTip = `💡 Tip: Don't forget your umbrella! A waterproof bag for your essentials is a good idea too.`;
      } else if (temperature < 45) {
        weatherNote = `It's a chilly ${temperature}°F, so I've got you bundled up nice and warm! 🧥`;
        careTip = `💡 Tip: Apply lip balm and moisturizer - cold weather can dry out your skin!`;
      } else if (isCold) {
        weatherNote = `At ${temperature}°F, this should keep you cozy without overdoing it on layers.`;
        careTip = `💡 Tip: Keep some hand cream handy - the cool air can be drying!`;
      } else if (isHot && temperature > 85) {
        weatherNote = `It's a hot ${temperature}°F out there - these light, breathable pieces will keep you cool! 😎`;
        careTip = `💡 Tip: Don't forget sunscreen (SPF 30+), sunglasses, and stay hydrated! 🧴💧`;
      } else if (isHot) {
        weatherNote = `It's ${temperature}°F out there - these light, breathable pieces will keep you cool! 😎`;
        careTip = `💡 Tip: Apply sunscreen before heading out and carry a water bottle! ☀️`;
      } else if (isWindy) {
        weatherNote = `Perfect weather at ${temperature}°F, though it's a bit breezy out there!`;
        careTip = `💡 Tip: The wind can dry out your skin - apply some moisturizer and lip balm!`;
      } else {
        weatherNote = `Perfect weather at ${temperature}°F - you'll be comfortable all day!`;
        const mildTips = [
          `💡 Tip: Great day for a walk! Don't forget to stay hydrated.`,
          `💡 Tip: Perfect weather to enjoy the outdoors!`,
          `💡 Tip: A light SPF is always a good idea, even on cloudy days! ☁️`
        ];
        careTip = mildTips[Math.floor(Math.random() * mildTips.length)];
      }
    }
    
    // Build the friendly message
    const outfitDescription = isChildProfile
      ? (itemCount <= 3 
          ? `${childName}'s outfit: ${itemNames} - super cute combo!`
          : `I picked out: ${itemNames} for ${childName}!`)
      : (itemCount <= 3 
          ? `Your ${itemNames} make a great combo.`
          : `I'm loving this combo: ${itemNames}.`);
    
    const reasoning = `${greeting} ${outfitDescription} ${weatherNote}\n\n${careTip}`;
    
    const stylingTips = [
      `Perfect for ${occasion === 'weather-based' ? 'today\'s conditions' : occasion + ' occasions'}`,
      `Weather-appropriate for ${temperature}°F`,
      `Mix and match with other items in your wardrobe for variety`
    ];

    console.log(`Returning outfit with ${transformedItems.length} items: ${itemNames}`)

    return NextResponse.json({
      items: transformedItems,
      reasoning: reasoning,
      stylingTips: stylingTips,
      occasion,
      weather,
    })
  } catch (error) {
    console.error("Outfit recommendation error:", error)
    return NextResponse.json({ error: "Failed to generate outfit recommendation" }, { status: 500 })
  }
}
