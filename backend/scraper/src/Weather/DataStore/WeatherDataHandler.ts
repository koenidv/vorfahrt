import { Tile } from "tiles/Tile"
import { DataSource } from "typeorm"
import { WeatherSource } from "Weather/Scraping/WeatherScraper"
import { WeatherApiResult } from "Weather/Weather.types"
import { mapWeatherData } from "../utils/mapWeatherData"

import { RelationalStoreObserver } from "../../RelationalStoreObserver"
import { WeatherRelationalStore } from "./WeatherRelationalStore"

export default class WeatherDataHandler {
  private relationalStore: WeatherRelationalStore

  constructor(
    dataSource: DataSource,
    relationalObserver: RelationalStoreObserver
  ) {
    this.relationalStore = new WeatherRelationalStore(
      dataSource.manager,
      relationalObserver
    )
  }

  async handleWeatherResponses(
    results: WeatherApiResult[],
    source: WeatherSource
  ) {
    results.forEach((it) => {
      this.handleWeatherResponse(it, source.tile)
    }, this)
  }

  async handleWeatherResponse(response: WeatherApiResult, tile: Tile) {
    const data = mapWeatherData(response)
    if (data) this.relationalStore.saveWeather(tile, data)
  }
}
