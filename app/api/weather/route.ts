import { type NextRequest, NextResponse } from "next/server"

// Fallback coordinates for common US cities
// In app/api/weather/route.ts
const FALLBACK_COORDINATES = {
  "Houston, TX": { lat: 29.7604, lon: -95.3698, name: "Houston" },
  "San Antonio, TX": { lat: 29.4241, lon: -98.4936, name: "San Antonio" },
  "Dallas, TX": { lat: 32.7767, lon: -96.7970, name: "Dallas" },
  "Austin, TX": { lat: 30.2672, lon: -97.7431, name: "Austin" },
  "New York, NY": { lat: 40.7128, lon: -74.0060, name: "New York" },
  "Los Angeles, CA": { lat: 34.0522, lon: -118.2437, name: "Los Angeles" },
  "Chicago, IL": { lat: 41.8781, lon: -87.6298, name: "Chicago" },
  "Phoenix, AZ": { lat: 33.4484, lon: -112.0740, name: "Phoenix" },
  "Philadelphia, PA": { lat: 39.9526, lon: -75.1652, name: "Philadelphia" },
  "San Diego, CA": { lat: 32.7157, lon: -117.1611, name: "San Diego" },
  "San Francisco, CA": { lat: 37.7749, lon: -122.4194, name: "San Francisco" },
  "Seattle, WA": { lat: 47.6062, lon: -122.3321, name: "Seattle" },
  "Miami, FL": { lat: 25.7617, lon: -80.1918, name: "Miami" },
  "Atlanta, GA": { lat: 33.7490, lon: -84.3880, name: "Atlanta" },
  "Denver, CO": { lat: 39.7392, lon: -104.9903, name: "Denver" },
  // ✅ add Omaha
  "Omaha, NE": { lat: 41.2565, lon: -95.9345, name: "Omaha" },
};


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    
    console.log("Weather API called for location:", location)

    if (!location) {
      console.log("Error: Location parameter is missing")
      return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
    }

    // Use Tomorrow.io API key
    const apiKey = process.env.TOMORROW_API_KEY || "CRUxuNhMVDcurWmuQJer1A94OOwpEcNc"
    console.log("Using Tomorrow.io API Key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5))
    
    if (!apiKey) {
      console.log("Error: Weather API key not configured")
      return NextResponse.json({ error: "Weather API key not configured" }, { status: 500 })
    }

    let lat, lon, locationName;
    
    // Check if we have fallback coordinates for this location
    if (FALLBACK_COORDINATES[location]) {
      console.log("Using fallback coordinates for:", location);
      const fallback = FALLBACK_COORDINATES[location];
      lat = fallback.lat;
      lon = fallback.lon;
      locationName = fallback.name;
    } else {
      // Try to get coordinates from Tomorrow.io's geocoding API
      const geocodingUrl = `https://api.tomorrow.io/v4/geocode?query=${encodeURIComponent(location)}&apikey=${apiKey}`
      console.log("Fetching geo data from Tomorrow.io:", geocodingUrl)
      
      const geoResponse = await fetch(geocodingUrl)
      const geoData = await geoResponse.json()
      console.log("Geo API response status:", geoResponse.status)
      
      if (!geoResponse.ok || !geoData.locations || geoData.locations.length === 0) {
        console.log("Error: Location not found in Tomorrow.io geo API")
        return NextResponse.json({ error: "Location not found" }, { status: 404 })
      }

      const location_data = geoData.locations[0]
      lat = location_data.lat
      lon = location_data.lon
      locationName = location_data.name
    }
    
    console.log("Location coordinates:", { lat, lon, locationName })

    // Get current weather data from Tomorrow.io
    const weatherUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&units=imperial&apikey=${apiKey}`
    console.log("Fetching weather data from Tomorrow.io:", weatherUrl)
    
    const weatherResponse = await fetch(weatherUrl)
    const weatherData = await weatherResponse.json()
    console.log("Weather API response status:", weatherResponse.status)
    
    if (!weatherResponse.ok) {
      console.log("Error: Failed to fetch weather data from Tomorrow.io")
      return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
    }

    // Map Tomorrow.io weather codes to conditions
    const getConditionFromCode = (weatherCode) => {
      const codeMap = {
        1000: "Clear",
        1100: "Mostly Clear",
        1101: "Partly Cloudy",
        1102: "Mostly Cloudy",
        1001: "Cloudy",
        2000: "Fog",
        2100: "Light Fog",
        4000: "Drizzle",
        4001: "Rain",
        4200: "Light Rain",
        4201: "Heavy Rain",
        5000: "Snow",
        5001: "Flurries",
        5100: "Light Snow",
        5101: "Heavy Snow",
        6000: "Freezing Drizzle",
        6001: "Freezing Rain",
        6200: "Light Freezing Rain",
        6201: "Heavy Freezing Rain",
        7000: "Ice Pellets",
        7101: "Heavy Ice Pellets",
        7102: "Light Ice Pellets",
        8000: "Thunderstorm"
      };
      return codeMap[weatherCode] || "Unknown";
    };

    // Map Tomorrow.io weather codes to OpenWeather-like icon codes
    const getIconFromCode = (weatherCode) => {
      const codeMap = {
        1000: "01d", // clear sky
        1100: "02d", // few clouds
        1101: "03d", // scattered clouds
        1102: "04d", // broken clouds
        1001: "04d", // overcast clouds
        2000: "50d", // fog
        2100: "50d", // light fog
        4000: "09d", // drizzle
        4001: "10d", // rain
        4200: "09d", // light rain
        4201: "10d", // heavy rain
        5000: "13d", // snow
        5001: "13d", // flurries
        5100: "13d", // light snow
        5101: "13d", // heavy snow
        6000: "09d", // freezing drizzle
        6001: "10d", // freezing rain
        6200: "09d", // light freezing rain
        6201: "10d", // heavy freezing rain
        7000: "13d", // ice pellets
        7101: "13d", // heavy ice pellets
        7102: "13d", // light ice pellets
        8000: "11d"  // thunderstorm
      };
      return codeMap[weatherCode] || "01d";
    };

    const values = weatherData.data.values;
    const weatherCode = values.weatherCode;
    const condition = getConditionFromCode(weatherCode);
    const icon = getIconFromCode(weatherCode);

    return NextResponse.json({
      location: locationName,
      temperature: Math.round(values.temperature),
      condition: condition,
      description: condition.toLowerCase(),
      humidity: values.humidity,
      windSpeed: values.windSpeed || 0,
      icon: icon,
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
