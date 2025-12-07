import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { outfitId, rating } = await request.json()

    // Validate inputs
    if (!outfitId) {
      return NextResponse.json(
        { error: "Outfit ID is required" },
        { status: 400 }
      )
    }

    if (!rating || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 }
      )
    }

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Update the outfit recommendation rating
    const { data, error } = await supabase
      .from("outfit_recommendations")
      .update({ rating })
      .eq("id", outfitId)
      .eq("user_id", user.id) // Ensure user owns this recommendation
      .select()
      .single()

    if (error) {
      console.error("Error updating outfit rating:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Outfit recommendation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: "Rating updated successfully"
    })
  } catch (error) {
    console.error("Unexpected error in rate-outfit API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve ratings
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all outfit recommendations with ratings for the user
    const { data, error } = await supabase
      .from("outfit_recommendations")
      .select("*")
      .eq("user_id", user.id)
      .not("rating", "is", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching outfit ratings:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Calculate aggregate statistics
    const ratings = data.map(item => item.rating).filter(r => r !== null)
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : null

    return NextResponse.json({ 
      success: true,
      data,
      stats: {
        totalRated: ratings.length,
        averageRating: avgRating ? parseFloat(avgRating.toFixed(2)) : null,
        highestRating: ratings.length > 0 ? Math.max(...ratings) : null,
        lowestRating: ratings.length > 0 ? Math.min(...ratings) : null,
      }
    })
  } catch (error) {
    console.error("Unexpected error in rate-outfit GET:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

