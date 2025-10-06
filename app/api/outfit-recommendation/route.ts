import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { occasion, weather, userId, profileId, randomSeed, timestamp } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

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

    // CRITICAL FIX: We no longer need AI generation since we're directly selecting items
    // This ensures the chat text always matches the displayed images

    // CRITICAL FIX: Don't use AI-generated recommendations that don't match selected items
    // Instead, directly select appropriate items from the wardrobe based on occasion and weather
    let matchedItems = [];
    
    console.log(`Selecting outfit items for occasion: ${occasion}, weather: ${weather}`)
    console.log(`Available wardrobe items: ${wardrobeItems.length}`)
    
    // Create a more reliable selection algorithm with randomization
    const selectItemsByOccasion = (items: any[], occasion: string, maxItems: number = 4) => {
      const selected = [];
      
      // Shuffle items to ensure randomization
      const shuffledItems = [...items].sort(() => Math.random() - 0.5);
      
      // Categorize available items (using shuffled items for variety)
      const dresses = shuffledItems.filter(item => 
        item.category?.toLowerCase().includes('dress') || 
        item.name?.toLowerCase().includes('dress')
      );
      
      const tops = shuffledItems.filter(item => 
        item.category?.toLowerCase().includes('top') || 
        item.category?.toLowerCase().includes('shirt') || 
        item.name?.toLowerCase().includes('top') || 
        item.name?.toLowerCase().includes('shirt') || 
        item.name?.toLowerCase().includes('blouse') ||
        item.name?.toLowerCase().includes('sweater') ||
        item.name?.toLowerCase().includes('tank') ||
        item.name?.toLowerCase().includes('tee')
      );
      
      const bottoms = shuffledItems.filter(item => 
        item.category?.toLowerCase().includes('bottom') || 
        item.category?.toLowerCase().includes('pants') || 
        item.category?.toLowerCase().includes('skirt') || 
        item.name?.toLowerCase().includes('pants') || 
        item.name?.toLowerCase().includes('skirt') || 
        item.name?.toLowerCase().includes('jeans') ||
        item.name?.toLowerCase().includes('trousers') ||
        item.name?.toLowerCase().includes('shorts')
      );
      
      const outerwear = shuffledItems.filter(item => 
        item.category?.toLowerCase().includes('outerwear') || 
        item.category?.toLowerCase().includes('jacket') || 
        item.name?.toLowerCase().includes('jacket') || 
        item.name?.toLowerCase().includes('blazer') ||
        item.name?.toLowerCase().includes('coat') ||
        item.name?.toLowerCase().includes('cardigan')
      );
      
      const shoes = shuffledItems.filter(item => 
        item.category?.toLowerCase().includes('footwear') || 
        item.category?.toLowerCase().includes('shoes') || 
        item.name?.toLowerCase().includes('shoes') || 
        item.name?.toLowerCase().includes('boots') ||
        item.name?.toLowerCase().includes('sneakers') ||
        item.name?.toLowerCase().includes('heels') ||
        item.name?.toLowerCase().includes('sandals')
      );
      
      const accessories = shuffledItems.filter(item => 
        item.category?.toLowerCase().includes('accessory') || 
        item.category?.toLowerCase().includes('jewelry') ||
        item.name?.toLowerCase().includes('necklace') ||
        item.name?.toLowerCase().includes('earrings') ||
        item.name?.toLowerCase().includes('bracelet') ||
        item.name?.toLowerCase().includes('hat') ||
        item.name?.toLowerCase().includes('scarf')
      );
      
      console.log(`Categorized items: dresses(${dresses.length}), tops(${tops.length}), bottoms(${bottoms.length}), outerwear(${outerwear.length}), shoes(${shoes.length}), accessories(${accessories.length})`)
      
      // Check if this is a dress request
      const isDressRequest = occasion.toLowerCase().includes('dress');
      
      // Select items based on occasion with randomization
      if ((occasion === 'formal' || isDressRequest) && dresses.length > 0) {
        // For formal occasions or dress requests, prefer dresses
        selected.push(dresses[Math.floor(Math.random() * dresses.length)]);
        if (shoes.length > 0) selected.push(shoes[Math.floor(Math.random() * shoes.length)]);
        if (accessories.length > 0 && selected.length < maxItems) {
          selected.push(accessories[Math.floor(Math.random() * accessories.length)]);
        }
      } else if (isDressRequest && dresses.length === 0) {
        // Handle dress request when no dresses are available
        console.log("Dress requested but none available, creating alternative outfit");
        
        // Create a nice outfit with tops and bottoms as alternative
        if (tops.length > 0) {
          // Find a nice top that could work as a dress alternative
          const dressyTops = tops.filter(item => 
            item.name?.toLowerCase().includes('blouse') || 
            item.name?.toLowerCase().includes('elegant') ||
            item.name?.toLowerCase().includes('fancy') ||
            item.name?.toLowerCase().includes('formal')
          );
          
          selected.push(dressyTops.length > 0 ? 
            dressyTops[Math.floor(Math.random() * dressyTops.length)] : 
            tops[Math.floor(Math.random() * tops.length)]);
        }
        
        if (bottoms.length > 0) {
          // Find a nice bottom that could work as a dress alternative
          const dressyBottoms = bottoms.filter(item => 
            item.name?.toLowerCase().includes('skirt') || 
            item.name?.toLowerCase().includes('elegant') ||
            item.name?.toLowerCase().includes('fancy') ||
            item.name?.toLowerCase().includes('formal')
          );
          
          selected.push(dressyBottoms.length > 0 ? 
            dressyBottoms[Math.floor(Math.random() * dressyBottoms.length)] : 
            bottoms[Math.floor(Math.random() * bottoms.length)]);
        }
        
        // Add accessories for a dressier look
        if (accessories.length > 0 && selected.length < maxItems) {
          selected.push(accessories[Math.floor(Math.random() * accessories.length)]);
        }
        
        if (shoes.length > 0 && selected.length < maxItems) {
          // Find dressy shoes
          const dressyShoes = shoes.filter(item => 
            item.name?.toLowerCase().includes('heel') || 
            item.name?.toLowerCase().includes('elegant') ||
            item.name?.toLowerCase().includes('fancy') ||
            item.name?.toLowerCase().includes('formal')
          );
          
          selected.push(dressyShoes.length > 0 ? 
            dressyShoes[Math.floor(Math.random() * dressyShoes.length)] : 
            shoes[Math.floor(Math.random() * shoes.length)]);
        }
      } else if (occasion === 'work' && (tops.length > 0 && bottoms.length > 0)) {
        // For work, prefer tops and bottoms
        selected.push(tops[Math.floor(Math.random() * tops.length)]);
        selected.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
        if (outerwear.length > 0 && selected.length < maxItems) {
          selected.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
        }
        if (shoes.length > 0 && selected.length < maxItems) {
          selected.push(shoes[Math.floor(Math.random() * shoes.length)]);
        }
      } else {
        // Default casual selection with randomization
        const useDress = dresses.length > 0 && Math.random() > 0.6; // 40% chance to use dress
        
        if (useDress) {
          selected.push(dresses[Math.floor(Math.random() * dresses.length)]);
        } else if (tops.length > 0 && bottoms.length > 0) {
          selected.push(tops[Math.floor(Math.random() * tops.length)]);
          selected.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
        } else if (tops.length > 0) {
          // If no bottoms, just add a top
          selected.push(tops[Math.floor(Math.random() * tops.length)]);
        } else if (dresses.length > 0) {
          // If no tops/bottoms, use a dress
          selected.push(dresses[Math.floor(Math.random() * dresses.length)]);
        }
        
        // Add shoes if available
        if (shoes.length > 0 && selected.length < maxItems) {
          selected.push(shoes[Math.floor(Math.random() * shoes.length)]);
        }
        
        // Add outerwear for cold weather
        const temp = weather.match(/\d+/);
        const temperature = temp ? parseInt(temp[0]) : 70;
        
        if (weather.toLowerCase().includes('cold') || 
            weather.toLowerCase().includes('winter') || 
            temperature < 60) {
          if (outerwear.length > 0 && selected.length < maxItems) {
            selected.push(outerwear[Math.floor(Math.random() * outerwear.length)]);
          }
        }
        
        // Add accessories for variety
        if (accessories.length > 0 && selected.length < maxItems && Math.random() > 0.5) {
          selected.push(accessories[Math.floor(Math.random() * accessories.length)]);
        }
      }
      
      console.log(`Selected ${selected.length} items for outfit`)
      return selected.slice(0, maxItems);
    };
    
    matchedItems = selectItemsByOccasion(wardrobeItems, occasion, 4);

    // CRITICAL FIX: Transform items to ensure they have the correct image field
    // The chat page expects 'image' field, but database stores 'image_url'
    const transformedItems = matchedItems.map(item => ({
      ...item,
      image: item.image_url || item.image_path || item.image || '/images/placeholder.png'
    }));

    // Generate reasoning and styling tips based on the actual selected items
    const itemNames = transformedItems.map(item => item.name).join(', ');
    const reasoning = `I've selected these items from your wardrobe: ${itemNames}. This combination works well for ${occasion} occasions in ${weather} weather.`;
    
    const stylingTips = [
      `Perfect for ${occasion} activities`,
      `Weather-appropriate for ${weather}`,
      `Mix and match with other items in your wardrobe`
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
