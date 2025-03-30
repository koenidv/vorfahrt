import { Weather } from "@vorfahrt/shared"
import { EntityManager } from "typeorm"
import { WeatherData } from "Weather/Weather.types"

import GeoPoint from "../../GeoPoint"
import { RelationalStoreObserver } from "../../RelationalStoreObserver"
import { Tile } from "../../tiles/Tile"

export class WeatherRelationalStore {
  manager: EntityManager
  observer: RelationalStoreObserver

  constructor(manager: EntityManager, observer: RelationalStoreObserver) {
    this.manager = manager
    this.observer = observer
  }

  public saveWeather(tile: Tile, data: WeatherData) {
    const trafficFlow = new Weather()
    trafficFlow.tile = new GeoPoint(tile.x, tile.y).toString()
    trafficFlow.northwest = tile.northwest.toString()
    trafficFlow.southeast = tile.southeast.toString()
    trafficFlow.zoom = tile.zoom

    trafficFlow.areaname = data.areaname
    trafficFlow.weatherCode = data.weatherCode
    trafficFlow.temperature = data.temperature
    trafficFlow.minTemperature = data.minTemperature
    trafficFlow.maxTemperature = data.maxTemperature
    trafficFlow.feelslike = data.feelslike
    trafficFlow.precipitation = data.precipitation
    trafficFlow.humidity = data.humidity
    trafficFlow.pressure = data.pressure
    trafficFlow.uvIndex = data.uvIndex
    trafficFlow.visibility = data.visibility
    trafficFlow.windspeed = data.windspeed
    trafficFlow.winddirection = data.winddirection
    trafficFlow.cloudcover = data.cloudcover

    this.manager.save(trafficFlow)
  }
}
