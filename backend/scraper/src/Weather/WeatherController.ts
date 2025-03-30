import { WriteApi } from "@influxdata/influxdb-client"
import clc from "cli-color"
import { DataSource } from "typeorm"

import env from "../env"
import { RelationalStoreObserver } from "../RelationalStoreObserver"
import { SystemController } from "../SystemController"
import { Tile } from "../tiles/Tile"
import { TileAlgorithm, TileMapper } from "../tiles/TileMapper"
import WeatherDataHandler from "./DataStore/WeatherDataHandler"
import { WeatherScraper } from "./Scraping/WeatherScraper"

const WEATHER_CYCLE_MINS = env.mpc_weather
const WEATHER_DELAY = env.delay_weather
const AREA_NORTHWEST = env.weather_area_northwest
const AREA_SOUTHEAST = env.weather_area_southeast
const WEATHER_ZOOM = env.weather_zoom

export default class WeatherController {
  private systemController: SystemController

  scraperTrafficFlow: WeatherScraper | undefined

  dataSource: DataSource | undefined
  dataHandler: WeatherDataHandler | undefined

  constructor(
    systemController: SystemController,
    appDataSource: DataSource,
    observerWriteApi: WriteApi
  ) {
    console.log(
      clc.bgBlackBright("WeatherController"),
      clc.blue("Initializing")
    )
    this.systemController = systemController

    const dataHandler = this.createDataHandler(appDataSource, observerWriteApi)

    const tiles: Tile[] = new TileMapper(
      AREA_NORTHWEST,
      AREA_SOUTHEAST,
      WEATHER_ZOOM
    ).getTiles(TileAlgorithm.ESPG3857)
    this.startWeatherScraper(dataHandler, tiles)
  }

  private createDataHandler(
    appDataSource: DataSource,
    observerWriteApi: WriteApi
  ): WeatherDataHandler {
    this.dataSource = appDataSource
    const observer = new RelationalStoreObserver(observerWriteApi)
    this.dataHandler = new WeatherDataHandler(this.dataSource, observer)
    return this.dataHandler
  }

  private startWeatherScraper(
    dataHandler: WeatherDataHandler,
    tiles: Tile[]
  ): WeatherScraper {
    this.scraperTrafficFlow = new WeatherScraper(
      1 / WEATHER_CYCLE_MINS,
      WEATHER_DELAY,
      tiles,
      "weather",
      this.systemController
    ).addListener(dataHandler.handleWeatherResponses.bind(dataHandler))
    if (process.argv.includes("--start")) {
      this.scraperTrafficFlow.start().executeOnce()
    }
    return this.scraperTrafficFlow
  }
}
