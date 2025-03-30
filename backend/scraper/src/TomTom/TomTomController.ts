import { WriteApi } from "@influxdata/influxdb-client"
import clc from "cli-color"
import { DataSource } from "typeorm"

import env from "../env"
import { RelationalStoreObserver } from "../RelationalStoreObserver"
import { SystemController } from "../SystemController"
import { Tile } from "../tiles/Tile"
import { TileAlgorithm, TileMapper } from "../tiles/TileMapper"
import TomTomDataHandler from "./DataStore/TomTomDataHandler"
import { TrafficFlowScraper } from "./Scraping/TrafficFlowScraper"

const FLOW_CYCLE_MINS = env.mpc_traffic_flow
const AREA_NORTHWEST = env.traffic_area_northwest
const AREA_SOUTHEAST = env.traffic_area_southeast
const FLOW_ZOOM = env.traffic_flow_zoom

export default class MilesController {
  private systemController: SystemController

  scraperTrafficFlow: TrafficFlowScraper | undefined

  dataSource: DataSource | undefined
  dataHandler: TomTomDataHandler | undefined

  constructor(
    systemController: SystemController,
    appDataSource: DataSource,
    observerWriteApi: WriteApi
  ) {
    console.log(clc.bgBlackBright("TomTomController"), clc.blue("Initializing"))
    this.systemController = systemController

    const dataHandler = this.createDataHandler(appDataSource, observerWriteApi)

    const tiles: Tile[] = new TileMapper(
      AREA_NORTHWEST,
      AREA_SOUTHEAST,
      FLOW_ZOOM
    ).getTiles(TileAlgorithm.ESPG3857)
    this.startTrafficFlowScraper(dataHandler, tiles)
  }

  private createDataHandler(
    appDataSource: DataSource,
    observerWriteApi: WriteApi
  ): TomTomDataHandler {
    this.dataSource = appDataSource
    const observer = new RelationalStoreObserver(observerWriteApi)
    this.dataHandler = new TomTomDataHandler(this.dataSource, observer)
    return this.dataHandler
  }

  private startTrafficFlowScraper(
    dataHandler: TomTomDataHandler,
    tiles: Tile[]
  ): TrafficFlowScraper {
    this.scraperTrafficFlow = new TrafficFlowScraper(
      1 / FLOW_CYCLE_MINS,
      tiles,
      "traffic-flow",
      this.systemController
    ).addListener(dataHandler.handleTrafficFlowResponses.bind(dataHandler))
    if (process.argv.includes("--start")) {
      this.scraperTrafficFlow.start().executeOnce()
    }
    return this.scraperTrafficFlow
  }
}
