import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { outfit, profileId } = body

    if (!outfit || !outfit.items || outfit.items.length === 0) {
      return NextResponse.json({ error: "Invalid outfit data" }, { status: 400 })
    }

    // 1. Save outfit to history
    const { data: savedOutfit, error: outfitError } = await supabase
      .from("outfit_history")
      .insert({
        user_id: user.id,
        profile_id: profileId || null,
        worn_date: new Date().toISOString(),
        outfit_data: outfit,
        weather: outfit.weather || null,
        location: outfit.location || null,
        occasion: outfit.occasion || null
      })
      .select()
      .single()

    if (outfitError) {
      console.error("Error saving outfit:", outfitError)
      return NextResponse.json({ error: "Failed to save outfit" }, { status: 500 })
    }

    // 2. Update wear count for each item
    const itemIds = outfit.items.map((item: any) => item.id)
    
    // Increment wear_count for all items in the outfit
    const { error: updateError } = await supabase.rpc('increment_wear_count', {
      item_ids: itemIds
    })

    if (updateError) {
      console.error("Error updating wear counts:", updateError)
      // Don't fail the request, outfit is already saved
    }

    // 3. Update last_worn date for each item
    const { error: dateError } = await supabase
      .from("wardrobe_items")
      .update({ last_worn: new Date().toISOString() })
      .in("id", itemIds)

    if (dateError) {
      console.error("Error updating last worn dates:", dateError)
    }

    return NextResponse.json({ 
      success: true, 
      outfitId: savedOutfit.id,
      message: "Outfit saved and wear counts updated!"
    })

  } catch (error) {
    console.error("Error in save-outfit-worn:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
