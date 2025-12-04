import { type NextRequest, NextResponse } from "next/server"

// Fallback coordinates for US cities (covers all cities in the dropdown)
const FALLBACK_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  // Major cities
  "New York, NY": { lat: 40.7128, lon: -74.0060, name: "New York" },
  "Los Angeles, CA": { lat: 34.0522, lon: -118.2437, name: "Los Angeles" },
  "Chicago, IL": { lat: 41.8781, lon: -87.6298, name: "Chicago" },
  "Houston, TX": { lat: 29.7604, lon: -95.3698, name: "Houston" },
  "Phoenix, AZ": { lat: 33.4484, lon: -112.0740, name: "Phoenix" },
  "Philadelphia, PA": { lat: 39.9526, lon: -75.1652, name: "Philadelphia" },
  "San Antonio, TX": { lat: 29.4241, lon: -98.4936, name: "San Antonio" },
  "San Diego, CA": { lat: 32.7157, lon: -117.1611, name: "San Diego" },
  "Dallas, TX": { lat: 32.7767, lon: -96.7970, name: "Dallas" },
  "San Jose, CA": { lat: 37.3382, lon: -121.8863, name: "San Jose" },
  "Austin, TX": { lat: 30.2672, lon: -97.7431, name: "Austin" },
  
  // Florida
  "Miami, FL": { lat: 25.7617, lon: -80.1918, name: "Miami" },
  "Orlando, FL": { lat: 28.5383, lon: -81.3792, name: "Orlando" },
  "Tampa, FL": { lat: 27.9506, lon: -82.4572, name: "Tampa" },
  "St. Petersburg, FL": { lat: 27.7676, lon: -82.6403, name: "St. Petersburg" },
  "Hialeah, FL": { lat: 25.8576, lon: -80.2781, name: "Hialeah" },
  
  // Nevada
  "Las Vegas, NV": { lat: 36.1699, lon: -115.1398, name: "Las Vegas" },
  "Reno, NV": { lat: 39.5296, lon: -119.8138, name: "Reno" },
  "North Las Vegas, NV": { lat: 36.1989, lon: -115.1175, name: "North Las Vegas" },
  
  // Pacific Northwest
  "Seattle, WA": { lat: 47.6062, lon: -122.3321, name: "Seattle" },
  "Portland, OR": { lat: 45.5152, lon: -122.6784, name: "Portland" },
  "Spokane, WA": { lat: 47.6588, lon: -117.4260, name: "Spokane" },
  
  // California
  "San Francisco, CA": { lat: 37.7749, lon: -122.4194, name: "San Francisco" },
  "Fresno, CA": { lat: 36.7378, lon: -119.7871, name: "Fresno" },
  "Sacramento, CA": { lat: 38.5816, lon: -121.4944, name: "Sacramento" },
  "Long Beach, CA": { lat: 33.7701, lon: -118.1937, name: "Long Beach" },
  "Oakland, CA": { lat: 37.8044, lon: -122.2712, name: "Oakland" },
  "Bakersfield, CA": { lat: 35.3733, lon: -119.0187, name: "Bakersfield" },
  "Anaheim, CA": { lat: 33.8366, lon: -117.9143, name: "Anaheim" },
  "Santa Ana, CA": { lat: 33.7455, lon: -117.8677, name: "Santa Ana" },
  "Riverside, CA": { lat: 33.9533, lon: -117.3962, name: "Riverside" },
  "Stockton, CA": { lat: 37.9577, lon: -121.2908, name: "Stockton" },
  "Irvine, CA": { lat: 33.6846, lon: -117.8265, name: "Irvine" },
  "Chula Vista, CA": { lat: 32.6401, lon: -117.0842, name: "Chula Vista" },
  "Fremont, CA": { lat: 37.5485, lon: -121.9886, name: "Fremont" },
  
  // Colorado
  "Denver, CO": { lat: 39.7392, lon: -104.9903, name: "Denver" },
  "Aurora, CO": { lat: 39.7294, lon: -104.8319, name: "Aurora" },
  "Colorado Springs, CO": { lat: 38.8339, lon: -104.8214, name: "Colorado Springs" },
  
  // Arizona
  "Tucson, AZ": { lat: 32.2226, lon: -110.9747, name: "Tucson" },
  "Mesa, AZ": { lat: 33.4152, lon: -111.8315, name: "Mesa" },
  "Chandler, AZ": { lat: 33.3062, lon: -111.8413, name: "Chandler" },
  "Scottsdale, AZ": { lat: 33.4942, lon: -111.9261, name: "Scottsdale" },
  "Gilbert, AZ": { lat: 33.3528, lon: -111.7890, name: "Gilbert" },
  "Glendale, AZ": { lat: 33.5387, lon: -112.1860, name: "Glendale" },
  
  // Texas
  "Fort Worth, TX": { lat: 32.7555, lon: -97.3308, name: "Fort Worth" },
  "El Paso, TX": { lat: 31.7619, lon: -106.4850, name: "El Paso" },
  "Arlington, TX": { lat: 32.7357, lon: -97.1081, name: "Arlington" },
  "Corpus Christi, TX": { lat: 27.8006, lon: -97.3964, name: "Corpus Christi" },
  "Plano, TX": { lat: 33.0198, lon: -96.6989, name: "Plano" },
  "Laredo, TX": { lat: 27.5306, lon: -99.4803, name: "Laredo" },
  "Lubbock, TX": { lat: 33.5779, lon: -101.8552, name: "Lubbock" },
  "Garland, TX": { lat: 32.9126, lon: -96.6389, name: "Garland" },
  "Irving, TX": { lat: 32.8140, lon: -96.9489, name: "Irving" },
  
  // Midwest
  "Detroit, MI": { lat: 42.3314, lon: -83.0458, name: "Detroit" },
  "Minneapolis, MN": { lat: 44.9778, lon: -93.2650, name: "Minneapolis" },
  "Cleveland, OH": { lat: 41.4993, lon: -81.6944, name: "Cleveland" },
  "Columbus, OH": { lat: 39.9612, lon: -82.9988, name: "Columbus" },
  "Indianapolis, IN": { lat: 39.7684, lon: -86.1581, name: "Indianapolis" },
  "Milwaukee, WI": { lat: 43.0389, lon: -87.9065, name: "Milwaukee" },
  "Kansas City, MO": { lat: 39.0997, lon: -94.5786, name: "Kansas City" },
  "St. Louis, MO": { lat: 38.6270, lon: -90.1994, name: "St. Louis" },
  "Cincinnati, OH": { lat: 39.1031, lon: -84.5120, name: "Cincinnati" },
  "Toledo, OH": { lat: 41.6528, lon: -83.5379, name: "Toledo" },
  "Omaha, NE": { lat: 41.2565, lon: -95.9345, name: "Omaha" },
  "Wichita, KS": { lat: 37.6872, lon: -97.3301, name: "Wichita" },
  "Fort Wayne, IN": { lat: 41.0793, lon: -85.1394, name: "Fort Wayne" },
  
  // South
  "Atlanta, GA": { lat: 33.7490, lon: -84.3880, name: "Atlanta" },
  "Charlotte, NC": { lat: 35.2271, lon: -80.8431, name: "Charlotte" },
  "Nashville, TN": { lat: 36.1627, lon: -86.7816, name: "Nashville" },
  "New Orleans, LA": { lat: 29.9511, lon: -90.0715, name: "New Orleans" },
  "Memphis, TN": { lat: 35.1495, lon: -90.0490, name: "Memphis" },
  "Louisville, KY": { lat: 38.2527, lon: -85.7585, name: "Louisville" },
  "Baltimore, MD": { lat: 39.2904, lon: -76.6122, name: "Baltimore" },
  "Washington, DC": { lat: 38.9072, lon: -77.0369, name: "Washington" },
  "Virginia Beach, VA": { lat: 36.8529, lon: -75.9780, name: "Virginia Beach" },
  "Raleigh, NC": { lat: 35.7796, lon: -78.6382, name: "Raleigh" },
  "Greensboro, NC": { lat: 36.0726, lon: -79.7920, name: "Greensboro" },
  "Durham, NC": { lat: 35.9940, lon: -78.8986, name: "Durham" },
  "Winston-Salem, NC": { lat: 36.0999, lon: -80.2442, name: "Winston-Salem" },
  "Lexington, KY": { lat: 38.0406, lon: -84.5037, name: "Lexington" },
  "Chesapeake, VA": { lat: 36.7682, lon: -76.2875, name: "Chesapeake" },
  "Norfolk, VA": { lat: 36.8508, lon: -76.2859, name: "Norfolk" },
  
  // Northeast
  "Boston, MA": { lat: 42.3601, lon: -71.0589, name: "Boston" },
  "Pittsburgh, PA": { lat: 40.4406, lon: -79.9959, name: "Pittsburgh" },
  "Buffalo, NY": { lat: 42.8864, lon: -78.8784, name: "Buffalo" },
  "Newark, NJ": { lat: 40.7357, lon: -74.1724, name: "Newark" },
  "Jersey City, NJ": { lat: 40.7178, lon: -74.0431, name: "Jersey City" },
  
  // Alaska
  "Anchorage, AK": { lat: 61.2181, lon: -149.9003, name: "Anchorage" },
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
      // Try to find a partial match in fallback coordinates
      const locationLower = location.toLowerCase();
      const partialMatch = Object.entries(FALLBACK_COORDINATES).find(([key]) => 
        key.toLowerCase().includes(locationLower.split(',')[0].trim()) ||
        locationLower.includes(key.toLowerCase().split(',')[0].trim())
      );
      
      if (partialMatch) {
        console.log("Found partial match in fallback:", partialMatch[0]);
        lat = partialMatch[1].lat;
        lon = partialMatch[1].lon;
        locationName = partialMatch[1].name;
      } else {
        // Try to get coordinates from Tomorrow.io's geocoding API
        try {
          const geocodingUrl = `https://api.tomorrow.io/v4/geocode?query=${encodeURIComponent(location)}&apikey=${apiKey}`
          console.log("Fetching geo data from Tomorrow.io:", geocodingUrl)
          
          const geoResponse = await fetch(geocodingUrl, { 
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
          const geoData = await geoResponse.json()
          console.log("Geo API response status:", geoResponse.status, "data:", JSON.stringify(geoData).slice(0, 200))
          
          if (!geoResponse.ok || !geoData.locations || geoData.locations.length === 0) {
            console.log("Error: Location not found in Tomorrow.io geo API, using default NYC")
            // Fallback to New York if geocoding fails
            lat = 40.7128;
            lon = -74.0060;
            locationName = location.split(',')[0] || "Unknown";
          } else {
            const location_data = geoData.locations[0]
            lat = location_data.lat
            lon = location_data.lon
            locationName = location_data.name
          }
        } catch (geoError) {
          console.error("Geocoding error:", geoError);
          // Fallback to New York coordinates if geocoding completely fails
          lat = 40.7128;
          lon = -74.0060;
          locationName = location.split(',')[0] || "Unknown";
        }
      }
    }
    
    console.log("Location coordinates:", { lat, lon, locationName })

    // Get current weather data from Tomorrow.io
    const weatherUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&units=imperial&apikey=${apiKey}`
    console.log("Fetching weather data from Tomorrow.io:", weatherUrl)
    
    let weatherData: any;
    try {
      const weatherResponse = await fetch(weatherUrl, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      weatherData = await weatherResponse.json()
      console.log("Weather API response status:", weatherResponse.status, "data preview:", JSON.stringify(weatherData).slice(0, 300))
      
      if (!weatherResponse.ok) {
        console.log("Error: Failed to fetch weather data from Tomorrow.io:", weatherData)
        // Return fallback weather data instead of error
        return NextResponse.json({
          location: locationName,
          temperature: 65,
          condition: "Unknown",
          description: "weather data temporarily unavailable",
          humidity: 50,
          windSpeed: 5,
          icon: "01d",
        })
      }
    } catch (weatherError) {
      console.error("Weather fetch error:", weatherError)
      // Return fallback weather data
      return NextResponse.json({
        location: locationName,
        temperature: 65,
        condition: "Unknown",
        description: "weather data temporarily unavailable",
        humidity: 50,
        windSpeed: 5,
        icon: "01d",
      })
    }
    
    if (!weatherData?.data?.values) {
      console.log("Error: Invalid weather data structure:", weatherData)
      return NextResponse.json({
        location: locationName,
        temperature: 65,
        condition: "Unknown",
        description: "weather data temporarily unavailable",
        humidity: 50,
        windSpeed: 5,
        icon: "01d",
      })
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
