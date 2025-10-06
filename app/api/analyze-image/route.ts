import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert the file to base64
    const buffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const base64ImageWithPrefix = `data:image/jpeg;base64,${base64Image}`;

    // Call OpenAI Vision API for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o which supports vision capabilities
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this clothing item and provide the following details in JSON format:\n" +
                    "1. name: Item name\n" +
                    "2. description: Detailed description\n" +
                    "3. category: One of: tops, bottoms, dresses, outerwear, shoes, accessories\n" +
                    "4. color: Main color\n" +
                    "5. weatherSuitability: Array with any of: hot, cold, rainy, windy\n" +
                    "6. seasonalUse: Array with any of: summer, winter, fall, spring\n" +
                    "7. activities: Array with any of: running, walking, hiking, gym, swimming, cycling, yoga\n" +
                    "8. occasions: Array with any of: casual, formal, work, exercise, date_night, entertainment\n" +
                    "Return ONLY valid JSON with these fields."
            },
            {
              type: "image_url",
              image_url: {
                url: base64ImageWithPrefix
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    // Extract and parse the JSON response
    const content = response.choices[0]?.message?.content || '';
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
    
    try {
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // Map the OpenAI analysis to our application's format
      const result = {
        name: analysisResult.name || '',
        description: analysisResult.description || '',
        category: analysisResult.category || 'tops',
        color: analysisResult.color || '',
        weatherSuitability: Array.isArray(analysisResult.weatherSuitability) ? analysisResult.weatherSuitability : [],
        seasonalUse: Array.isArray(analysisResult.seasonalUse) ? analysisResult.seasonalUse : [],
        activities: Array.isArray(analysisResult.activities) ? analysisResult.activities : [],
        occasions: Array.isArray(analysisResult.occasions) ? analysisResult.occasions : []
      };
      
      return NextResponse.json({ success: true, analysis: result });
    } catch (parseError) {
      console.error('Error parsing JSON from OpenAI response:', parseError);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}