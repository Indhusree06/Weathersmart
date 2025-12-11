import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { outfit, profileId, userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    if (!outfit || !outfit.items || outfit.items.length === 0) {
      return NextResponse.json({ error: "Invalid outfit data" }, { status: 400 })
    }

    // 1. Save outfit to history
    const { data: savedOutfit, error: outfitError } = await supabase
      .from("outfits")
      .insert({
        user_id: userId,
        name: `Outfit - ${new Date().toLocaleDateString()}`,
        items: outfit.items,
        occasion: outfit.occasion || 'Daily wear',
        weather_condition: outfit.weather || null,
        location: outfit.location || null,
        style_notes: outfit.style_notes || '',
        worn_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (outfitError) {
      console.error("Error saving outfit:", outfitError)
      return NextResponse.json({ error: "Failed to save outfit to history", details: outfitError.message }, { status: 500 })
    }

    // 2. Update wear count and last_worn for each item
    const itemIds = outfit.items.map((item: any) => item.id).filter(Boolean)
    
    if (itemIds.length > 0) {
      // Update each item individually to avoid RPC issues
      for (const itemId of itemIds) {
        // Get current wear count
        const { data: item } = await supabase
          .from("wardrobe_items")
          .select("wear_count")
          .eq("id", itemId)
          .single()

        const newWearCount = (item?.wear_count || 0) + 1

        // Update wear count and last_worn
        await supabase
          .from("wardrobe_items")
          .update({ 
            wear_count: newWearCount,
            last_worn: new Date().toISOString()
          })
          .eq("id", itemId)
      }
    }

    return NextResponse.json({ 
      success: true, 
      outfitId: savedOutfit.id,
      message: "Outfit saved and wear counts updated!"
    })

  } catch (error) {
    console.error("Error in save-outfit-worn:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
