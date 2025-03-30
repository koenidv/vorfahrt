export type WeatherApiResult = {
  current_condition: [
    {
      temp_C: string
      FeelsLikeC: string
      cloudcover: string
      precipMM: string
      humidity: string
      pressure: string
      uvIndex: string
      visibility: string
      weatherCode: string
      winddirDegree: string
      windspeedKmph: string
    },
  ]
  nearest_area: [
    {
      areaName: [
        {
          value: string
        },
      ]
      country: [
        {
          value: string
        },
      ]
      latitude: string
      longitude: string
      population: string
    },
  ]
  weather: {
    date: string
    avgtempC: string
    maxtempC: string
    mintempC: string
  }[]
}

export type WeatherData = {
  areaname: string
  weatherCode: number
  temperature: number
  minTemperature: number
  maxTemperature: number
  feelslike: number
  precipitation: number
  humidity: number
  pressure: number
  uvIndex: number
  visibility: number
  windspeed: number
  winddirection: number
  cloudcover: number
}
