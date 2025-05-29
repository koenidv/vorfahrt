import { WriteApi } from "@influxdata/influxdb-client"
import { MilesClient } from "@koenidv/abfahrt"
import clc from "cli-color"
import { DataSource, EntityManager } from "typeorm"

import berlinPostalCodes from "../assets/berlin_plz_simple.json"
import env from "../env"
import { SystemController } from "../SystemController"
import MilesDataHandler from "./DataStore/MilesDataHandler"
import { MilesRelationalStoreObserver } from "./MilesRelationalStoreObserver"
import { MetaScraperMilesDensity } from "./Scraping/MetaScraperMilesDensity"
import MilesScraperCitiesMeta from "./Scraping/MilesScraperCitiesMeta"
import MilesScraperHub from "./Scraping/MilesScraperHub"
import MilesScraperMap from "./Scraping/MilesScraperMap"
import MilesScraperVehicles, {
  QueryPriority,
} from "./Scraping/MilesScraperVehicles"
import { PostalCodeFeature, PostalCodeLookup } from "./utils/PostcalCodeLookup"
import { VehicleQueue, VehicleQueueInterface } from "./utils/VehicleQueue"

const RPM_VEHICLE = env.rpm_vehicle
const RPM_MAP = env.rpm_map
const RPM_CITES = env.rpm_cities
const RPM_HUBS = env.rpm_hubs
const HUB_LIST = env.hub_list
const DENSITY_MINUTES = env.mpc_miles_density

export default class MilesController {
  private systemController: SystemController

  scraperMap: MilesScraperMap | undefined
  scraperVehicles: MilesScraperVehicles | undefined
  scraperCitiesMeta: MilesScraperCitiesMeta | undefined
  scraperHubs: MilesScraperHub | undefined

  dataSource: DataSource | undefined
  dataHandler: MilesDataHandler | undefined

  constructor(
    systemController: SystemController,
    appDataSource: DataSource,
    observerWriteApi: WriteApi
  ) {
    console.log(clc.bgBlackBright("MilesController"), clc.blue("Initializing"))
    this.systemController = systemController

    const abfahrt = new MilesClient()
    abfahrt.setRandomDeviceKey()
    const postalLookup = this.createPostalCodeLookup()
    const dataHandler = this.createDataHandler(
      appDataSource,
      observerWriteApi,
      postalLookup
    )

    const scraperMap = this.startMapScraper(abfahrt, dataHandler)
    this.startCitiesMetaScraper(abfahrt, scraperMap)

    const scraperVehicles = this.startVehiclesScraper(abfahrt, dataHandler)
    dataHandler.vehicleScraper = scraperVehicles

    this.startHubScraper(abfahrt, dataHandler)

    this.startDensityMetaScraper(
      appDataSource.manager,
      postalLookup,
      dataHandler
    )

    this.populateVehiclesQueue(scraperVehicles, dataHandler)
  }

  private createPostalCodeLookup() {
    return new PostalCodeLookup(
      berlinPostalCodes as { features: PostalCodeFeature[] }
    )
  }

  private createDataHandler(
    appDataSource: DataSource,
    observerWriteApi: WriteApi,
    postalLookup: PostalCodeLookup
  ): MilesDataHandler {
    this.dataSource = appDataSource
    const observer = new MilesRelationalStoreObserver(observerWriteApi)
    this.dataHandler = new MilesDataHandler(
      this.dataSource,
      observer,
      postalLookup
    )
    return this.dataHandler
  }

  private startVehiclesScraper(
    abfahrt: MilesClient,
    dataHandler: MilesDataHandler
  ): MilesScraperVehicles {
    let queue: VehicleQueueInterface
    queue = new VehicleQueue()

    this.scraperVehicles = new MilesScraperVehicles(
      abfahrt,
      RPM_VEHICLE,
      "miles-vehicles",
      this.systemController,
      queue
    ).addListener(dataHandler.handleVehicles.bind(dataHandler))
    if (process.argv.includes("--start") && RPM_VEHICLE > 0)
      this.scraperVehicles.start()
    return this.scraperVehicles
  }

  private startMapScraper(
    abfahrt: MilesClient,
    dataHandler: MilesDataHandler
  ): MilesScraperMap {
    this.scraperMap = new MilesScraperMap(
      abfahrt,
      RPM_MAP,
      "miles-map",
      this.systemController
    ).addListener(dataHandler.handleVehicles.bind(dataHandler))
    if (process.argv.includes("--start") && RPM_MAP > 0) this.scraperMap.start()
    return this.scraperMap
  }

  private async startCitiesMetaScraper(
    abfahrt: MilesClient,
    mapScraper: MilesScraperMap
  ): Promise<MilesScraperCitiesMeta> {
    this.scraperCitiesMeta = new MilesScraperCitiesMeta(
      abfahrt,
      RPM_CITES,
      "miles-cities-meta",
      this.systemController
    )
      .addListener(mapScraper.setAreas.bind(mapScraper))
      .addListener(this.dataHandler!.handleCitiesMeta.bind(this.dataHandler))
    await this.scraperCitiesMeta.executeOnce() // Cities meta is always executed once on start
    if (process.argv.includes("--start") && RPM_CITES > 0)
      this.scraperCitiesMeta.start()
    return this.scraperCitiesMeta
  }

  private startHubScraper(
    abfahrt: MilesClient,
    dataHandler: MilesDataHandler
  ): MilesScraperHub {
    this.scraperHubs = new MilesScraperHub(
      abfahrt,
      RPM_HUBS,
      "miles-hubs",
      this.systemController
    )
      .setHubs(HUB_LIST)
      .addListener(dataHandler.handleVehicles.bind(dataHandler))
    if (process.argv.includes("--start") && RPM_MAP > 0)
      this.scraperHubs.start()
    return this.scraperHubs
  }

  private startDensityMetaScraper(
    entityManager: EntityManager,
    postalLookup: PostalCodeLookup,
    dataHandler: MilesDataHandler
  ): MetaScraperMilesDensity {
    const densityMetaScraper = new MetaScraperMilesDensity(
      1 / DENSITY_MINUTES,
      0,
      [...postalLookup.listPostalCodes().values()],
      "miles-meta-density",
      this.systemController,
      entityManager
    ).addListener(dataHandler.handleDensityResult.bind(dataHandler))
    if (process.argv.includes("--start") && DENSITY_MINUTES > 0)
      densityMetaScraper.start()
    return densityMetaScraper
  }

  private async populateVehiclesQueue(
    vehicleScraper: MilesScraperVehicles,
    dataHandler: MilesDataHandler
  ) {
    const values = await dataHandler.restoreVehicleQueue()
    vehicleScraper.register(values.normalQueue, QueryPriority.NORMAL, true)
    vehicleScraper.register(values.slowQueue, QueryPriority.LOW, true)
    // also register the next 2000 vehicles to normal queue
    // todo should regularly check for new vehicles, i.e. preemptively add to queue
    vehicleScraper.register(
      Array.from({ length: 2000 }, (_, i) => values.highestId + i),
      QueryPriority.NORMAL,
      true
    )
  }
}
