"use client"

import { useEffect, useState } from "react"
import { CloudRain, Snowflake, Sun, Wind, CloudDrizzle, Umbrella, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WeatherData {
  temperature: number
  condition: string
  location: string
}

interface WeatherAlert {
  icon: React.ReactNode
  message: string
  color: string
  bgColor: string
}

export function WeatherAlerts() {
  const [alert, setAlert] = useState<WeatherAlert | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [tomorrowWeather, setTomorrowWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    // Check if alert was dismissed today
    const dismissedDate = localStorage.getItem("weatherAlertDismissed")
    const today = new Date().toDateString()
    if (dismissedDate === today) {
      setIsDismissed(true)
      return
    }

    // Fetch tomorrow's weather
    fetchTomorrowWeather()
  }, [])

  const fetchTomorrowWeather = async () => {
    try {
      // Get user's location from localStorage or use default
      const location = localStorage.getItem("userLocation") || "New York, NY"
      
      // In a real app, you'd call a weather API here
      // For now, we'll use mock data based on current weather
      const mockTomorrowWeather: WeatherData = {
        temperature: 42,
        condition: "Light Rain",
        location: location
      }

      setTomorrowWeather(mockTomorrowWeather)
      generateAlert(mockTomorrowWeather)
    } catch (error) {
      console.error("Failed to fetch weather:", error)
    }
  }

  const generateAlert = (weather: WeatherData) => {
    const condition = weather.condition.toLowerCase()
    const temp = weather.temperature

    let alertData: WeatherAlert | null = null

    // Rain alerts
    if (condition.includes("rain") || condition.includes("drizzle")) {
      alertData = {
        icon: <CloudRain className="w-5 h-5" />,
        message: `It's raining tomorrow! Don't forget your rain jacket and umbrella. ☔`,
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200"
      }
    }
    // Snow alerts
    else if (condition.includes("snow")) {
      alertData = {
        icon: <Snowflake className="w-5 h-5" />,
        message: `Snow expected tomorrow! Bundle up with your warmest coat and boots. ❄️`,
        color: "text-cyan-700",
        bgColor: "bg-cyan-50 border-cyan-200"
      }
    }
    // Cold weather
    else if (temp < 40) {
      alertData = {
        icon: <Wind className="w-5 h-5" />,
        message: `It'll be cold tomorrow (${temp}°F). Layer up with a warm jacket! 🧥`,
        color: "text-purple-700",
        bgColor: "bg-purple-50 border-purple-200"
      }
    }
    // Hot weather
    else if (temp > 85) {
      alertData = {
        icon: <Sun className="w-5 h-5" />,
        message: `Hot day ahead (${temp}°F)! Wear light, breathable fabrics and stay hydrated. ☀️`,
        color: "text-orange-700",
        bgColor: "bg-orange-50 border-orange-200"
      }
    }
    // Cloudy/mild
    else if (condition.includes("cloud")) {
      alertData = {
        icon: <CloudDrizzle className="w-5 h-5" />,
        message: `Cloudy tomorrow. Perfect weather for layering! 🌥️`,
        color: "text-slate-700",
        bgColor: "bg-slate-50 border-slate-200"
      }
    }

    setAlert(alertData)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem("weatherAlertDismissed", new Date().toDateString())
  }

  if (isDismissed || !alert) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative rounded-lg border p-4 ${alert.bgColor} ${alert.color} mb-6`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {alert.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Tomorrow's Weather Alert</p>
            <p className="text-sm mt-1">{alert.message}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
