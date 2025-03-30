import { WeatherApiResult, WeatherData } from "../Weather.types"

export function mapWeatherData(res: WeatherApiResult): WeatherData | null {
  const current = res.current_condition[0]
  const today = res.weather[0]
  const areaname = res.nearest_area[0]?.areaName[0]?.value
  if (!current || !today || !areaname) return null

  const weatherData: WeatherData = {
    areaname: areaname,
    weatherCode: parseInt(current.weatherCode),
    temperature: parseFloat(current.temp_C),
    feelslike: parseFloat(current.FeelsLikeC),
    minTemperature: parseFloat(today.mintempC),
    maxTemperature: parseFloat(today.maxtempC),
    precipitation: parseFloat(current.precipMM),
    humidity: parseFloat(current.humidity),
    pressure: parseFloat(current.pressure),
    uvIndex: parseFloat(current.uvIndex),
    visibility: parseFloat(current.visibility),
    windspeed: parseFloat(current.windspeedKmph),
    winddirection: parseFloat(current.winddirDegree),
    cloudcover: parseFloat(current.cloudcover),
  }

  return weatherData
}
