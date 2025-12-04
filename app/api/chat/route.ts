import { Message as AIMessage } from "ai"
import OpenAI from "openai"
import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service key to bypass RLS and fetch wardrobe items server-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface AIMessage {
  role: string;
  content: string;
}

function validateMessage(message: any): message is AIMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof message.role === 'string' &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.length > 0
  )
}

function validateMessages(messages: any[]): messages is AIMessage[] {
  return messages.every(validateMessage)
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let body: any
    try {
      body = await req.json()
    } catch (error) {
      console.error("Request body parsing error:", error)
      return new Response("Invalid JSON in request body", { 
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }

    // Extract and validate messages
    const { messages, profileId, weather, userId } = body

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid request format:", { body })
      return new Response("Request must include 'messages' array", { 
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }

    if (messages.length === 0) {
      console.error("Empty messages array")
      return new Response("Messages array cannot be empty", { 
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }

    // Validate each message in the array
    for (const message of messages) {
      if (!message.role || !message.content) {
        console.error("Invalid message format in request:", message)
        return new Response("Invalid message format in request", { 
          status: 400,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        })
      }
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error("OpenAI API key not found")
      return new Response("OpenAI API key not found", { 
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }

    // Get wardrobe items for the user
    let wardrobeItems: any[] = []
    try {
      if (userId) {
        console.log(`[Chat API] Fetching wardrobe items for userId: ${userId}, profileId: ${profileId || 'none'}`)
        
        // First try to get items with profile filter if profileId is provided
        if (profileId && profileId !== 'owner' && profileId !== 'family') {
          try {
            const { data: profileItems, error: profileError } = await supabase
              .from('wardrobe_items')
              .select('*')
              .eq('user_id', userId)
              .eq('wardrobe_profile_id', profileId)
            
            if (profileError) {
              console.error("[Chat API] Error fetching profile-specific wardrobe items:", profileError)
            } else if (profileItems && profileItems.length > 0) {
              wardrobeItems = profileItems
              console.log(`[Chat API] Fetched ${wardrobeItems.length} wardrobe items for profile ${profileId}`)
            } else {
              console.log(`[Chat API] No items found for profile ${profileId}, will fall back to all user items`)
            }
          } catch (error) {
            console.error("[Chat API] Error with profile filtering:", error)
          }
        }
        
        // If no items found with profile filter or no profileId provided, get all user items
        if (wardrobeItems.length === 0) {
          const { data: allUserItems, error } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', userId)
          
          if (error) {
            console.error("[Chat API] Error fetching all user wardrobe items:", error)
          } else {
            wardrobeItems = allUserItems || []
            console.log(`[Chat API] Fetched ${wardrobeItems.length} total wardrobe items for user ${userId}`)
          }
        }
      } else {
        console.warn("[Chat API] No userId provided - cannot fetch wardrobe items")
      }
    } catch (error) {
      console.error("[Chat API] Error accessing wardrobe data:", error)
    }
    
    // Log wardrobe item summary for debugging
    if (wardrobeItems.length > 0) {
      console.log(`[Chat API] Wardrobe items being sent to AI: ${wardrobeItems.map(item => item.name).join(', ')}`)
    } else {
      console.warn("[Chat API] WARNING: No wardrobe items found for this user!")
    }

    // Create a system message with wardrobe information
    const systemMessage = {
      role: "system",
      content: `You are a helpful fashion assistant that helps users pick outfits based on weather, occasion, and their wardrobe.
Current weather: ${weather ? `${weather.temperature}°F ${weather.condition}` : 'Unknown'}
Available wardrobe items: ${wardrobeItems.length > 0 ? 
  wardrobeItems.map(item => `${item.name} (${item.category}, ${item.color})`).join(', ') : 
  'No items available - provide general fashion advice instead'}
  
IMPORTANT: When no wardrobe items are available, DO NOT respond with an error message. Instead, provide helpful fashion advice and suggest what types of items would work well for the request.

STRICT RECOMMENDATION RULES:
1. ALWAYS recommend ONLY items that are explicitly listed in the user's wardrobe above.
2. NEVER suggest generic items that aren't in their wardrobe.
3. If the user has no items in a needed category (e.g., no dresses when asked for a dress), clearly state this limitation and suggest alternatives from their ACTUAL wardrobe.
4. When responding to button clicks like "Show me weekend casual looks", ALWAYS provide specific outfit recommendations from their wardrobe.
5. CRITICAL: Use the EXACT item names, colors, and categories as they appear in the wardrobe list. Do not modify, abbreviate or paraphrase item names.

IMPORTANT: You have full access to the user's wardrobe items which are provided to you. NEVER say you don't have access to the wardrobe.
If no wardrobe items are available, provide general fashion advice but DO NOT say "I don't have access to your wardrobe items".
Instead say something like "Based on fashion principles, I recommend..." or "Here are some general suggestions..."

BUTTON RESPONSES:
- For "Show me weekend casual looks" - Recommend specific casual outfits from their wardrobe suitable for weekend activities
- For "What should I wear today?" - Suggest a complete outfit from their wardrobe based on current weather
- For "Pick a dress for me" - Recommend a specific dress from their wardrobe if available
- For "Suggest a work outfit" - Recommend business or smart casual items from their wardrobe
- For "Can you recommend an outfit for today?" - Provide a complete outfit from their wardrobe based on weather

CASUAL WEAR RECOMMENDATIONS:
- When asked about casual wear or what to wear today, prioritize comfortable everyday items from their wardrobe like jeans, t-shirts, casual dresses, and comfortable shoes.
- Always consider the current weather in your recommendations (e.g., layers for cold, breathable fabrics for heat).
- For "Pick a dress for me" requests, recommend ONLY dresses that exist in their wardrobe based on weather and casual settings. Use EXACT names of items as they appear in the wardrobe list.
- Include specific styling tips based on the current weather conditions that apply to their actual wardrobe items.
- IMPORTANT: Always use the EXACT names of items as they appear in the wardrobe list above. Do not paraphrase or rename items.

WEATHER-BASED STYLING TIPS:
- Hot weather: Suggest breathable fabrics, light colors, sun protection with their existing items
- Cold weather: Recommend layering techniques using their actual wardrobe items, warm accessories they own
- Rainy weather: Suggest water-resistant items they have, appropriate footwear from their collection
- Windy conditions: Recommend secure accessories they own, anti-flyaway clothing options from their wardrobe

When recommending outfits, ALWAYS include a section labeled "OUTFIT:" followed by a list of specific items from the user's wardrobe that would work well together. For example:

OUTFIT: Blue jeans, White t-shirt, Black leather jacket

This format helps the app identify your recommendations and display them visually to the user.`
    }

    // Make API request to OpenAI
    /* FETCH-BASED IMPLEMENTATION COMMENTED OUT
    let response: Response
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 800,
        }),
      })
    } catch (error) {
      console.error("Network error during OpenAI API call:", error)
      return new Response("Failed to connect to OpenAI API", { 
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }

    // Check response status
    if (!response.ok) {
      console.error("OpenAI API error:", {
        status: response.status,
        statusText: response.statusText
      })
      return new Response(`OpenAI API error: ${response.statusText}`, { 
        status: response.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }

    // Parse response data
    let data: any
    try {
      data = await response.json()
    } catch (error) {
      console.error("Error parsing OpenAI API response:", error)
      return new Response("Invalid response from OpenAI API", { 
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }
    
    // Validate response structure
    if (!data || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Invalid OpenAI API response structure:", data)
      return new Response("Invalid response structure from OpenAI API", { 
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }
    
    // Extract content
    const content = data.choices[0]?.message?.content
    if (typeof content !== 'string') {
      console.error("Missing content in OpenAI API response:", data.choices[0])
      return new Response("Missing content in OpenAI API response", { 
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      })
    }
    
    // Return the content as plain text
    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    })
    */












  const openai = new OpenAI({ 
      apiKey,
      timeout: 60000, // 60 second timeout
      maxRetries: 3   // Retry up to 3 times on failures
    })
    
    try {
      // Log the request parameters for debugging
      console.log("OpenAI API request:", {
        model: "gpt-4o-mini",
        messagesCount: messages.length,
        maxTokens: 1000,
        temperature: 0.7
      })

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          systemMessage,
          ...messages.map((m: AIMessage) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          }))
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })

      // Log the raw response for debugging
      console.log("OpenAI API raw response:", JSON.stringify(response))

      if (!response || typeof response !== 'object') {
        const error = new Error("Invalid OpenAI response format")
        console.error(error.message, { response })
        return new Response(error.message, { status: 500 })
      }

      if (!Array.isArray(response.choices)) {
        const error = new Error("Missing choices array in OpenAI response")
        console.error(error.message, { response })
        return new Response(error.message, { status: 500 })
      }

      if (response.choices.length === 0) {
        const error = new Error("Empty choices array in OpenAI response")
        console.error(error.message, { response })
        return new Response(error.message, { status: 500 })
      }

      const firstChoice = response.choices[0]
      if (!firstChoice || typeof firstChoice !== 'object') {
        const error = new Error("Invalid first choice in OpenAI response")
        console.error(error.message, { firstChoice })
        return new Response(error.message, { status: 500 })
      }

      if (!firstChoice.message || typeof firstChoice.message !== 'object') {
        const error = new Error("Invalid message format in OpenAI response")
        console.error(error.message, { firstChoice })
        return new Response(error.message, { status: 500 })
      }

      const { content } = firstChoice.message
      if (typeof content !== 'string') {
        const error = new Error("Invalid content format in OpenAI response")
        console.error(error.message, { content })
        return new Response(error.message, { status: 500 })
      }

      if (content.length === 0) {
        const error = new Error("Empty content in OpenAI response")
        console.error(error.message)
        return new Response(error.message, { status: 500 })
      }

      // Log successful response
      console.log("OpenAI API success:", {
        contentLength: content.length,
        firstFewChars: content.slice(0, 50)
      })

      return new Response(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      })
    } catch (error) {
      // Log detailed error information
      console.error("OpenAI API error:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })

      const errorMessage = error instanceof Error 
        ? `OpenAI API error: ${error.message}`
        : "Unknown error calling OpenAI API"

      return new Response(errorMessage, { 
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      })
    }
  } catch (error) {
    console.error("Chat error:", error)
    return new Response("Error processing chat request", { 
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    })
  }
}
