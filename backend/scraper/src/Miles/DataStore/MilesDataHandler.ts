import {
  getInfoFromMilesVehicleStatus,
  MilesVehicleStatus,
} from "@koenidv/abfahrt"
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"
import clc from "cli-color"
import { DataSource } from "typeorm"

import { MilesRelationalStoreObserver } from "Miles/MilesRelationalStoreObserver"
import { PostalCodeLookup } from "Miles/utils/PostcalCodeLookup"
import { SOURCE_TYPE, ValueSource } from "../../types"
import { MilesCityMeta } from "../Miles.types"
import { MilesMapSource } from "../Scraping/MilesScraperMap"
import MilesScraperVehicles, {
  MilesVehicleSource,
  QueryPriority,
} from "../Scraping/MilesScraperVehicles"
import { MilesRelationalStore } from "./MilesRelationalStore"
import { MilesVehiclesPerCityCache } from "./MilesVehiclesPerCityCache"

export default class MilesDataHandler {
  private relationalStore: MilesRelationalStore
  private _vehicleScraper: MilesScraperVehicles | undefined = undefined
  set vehicleScraper(value: MilesScraperVehicles) {
    this._vehicleScraper = value
  }
  private vehiclesPerCity = new MilesVehiclesPerCityCache()

  constructor(
    dataSource: DataSource,
    relationalObserver: MilesRelationalStoreObserver,
    postalLookup: PostalCodeLookup
  ) {
    this.relationalStore = new MilesRelationalStore(
      dataSource.manager,
      relationalObserver,
      postalLookup.getPostalCode.bind(postalLookup)
    )
  }

  async restoreVehicleQueue() {
    return await this.relationalStore.restoreVehicleQueue()
  }

  async handleCitiesMeta(cities: MilesCityMeta[]) {
    await this.relationalStore.insertCitiesMeta(...cities)
  }

  async handleVehicles(vehicles: apiVehicleJsonParsed[], source: ValueSource) {
    // fixme currently saving vehicles one after another - otherwise, insertion into postgres might fail
    // todo to fix the above, move iteration to the stores - also use influx writePoints instead of writePoint
    for (const vehicle of vehicles) {
      await this.handleSingleVehicleResponse(vehicle, source)
    }
    if (source.source === SOURCE_TYPE.MAP) {
      this.handleDisenqueuedVehicles(vehicles)
      if ((source as MilesMapSource).isFinal) {
        const disappearedIds = this.vehiclesPerCity.saveVehiclesDiffDisappeared(
          source as MilesMapSource,
          vehicles
        )
        if (disappearedIds.length)
          console.log(
            clc.bgBlackBright("MilesDataHandler"),
            disappearedIds.length,
            "vehicles became invisible in",
            (source as MilesMapSource).cityId
          )
        await this.handleEnqueueDisappearedIds(disappearedIds)
      }
    } else if (source.source === SOURCE_TYPE.VEHICLE) {
      for (const vehicle of vehicles) {
        this.handleMoveQueues(vehicle, source as MilesVehicleSource)
      }
    } else if (source.source === SOURCE_TYPE.PERCENTAGE) {
      this.handleDisenqueuedVehicles(vehicles)
    }
  }

  private async handleSingleVehicleResponse(
    vehicle: apiVehicleJsonParsed,
    source: ValueSource
  ) {
    await this.relationalStore.handleVehicle(vehicle)
  }

  private handleMoveQueues(
    vehicle: apiVehicleJsonParsed,
    source: MilesVehicleSource
  ) {
    if (!this._vehicleScraper) {
      console.error(
        clc.bgRed("MilesDataHandler"),
        clc.red("MilesVehicleScraper is undefined")
      )
      return
    }

    if (vehicle.idVehicleStatus === MilesVehicleStatus.DEPLOYED_FOR_RENTAL) {
      this._vehicleScraper.deregister([vehicle.idVehicle])
    } else if (
      getInfoFromMilesVehicleStatus(
        vehicle.idVehicleStatus as keyof typeof MilesVehicleStatus
      ).isInLifecycle
    ) {
      // once a vehicle has entered the organizational lifecycle, it will only be tracked once it publically reappears
      this._vehicleScraper.deregister([vehicle.idVehicle])
    } else if (vehicle.idVehicleStatus == MilesVehicleStatus.CAR_SUBSCRIPTION) {
      this._vehicleScraper.register([vehicle.idVehicle], QueryPriority.LOW)
    } else {
      this._vehicleScraper.register([vehicle.idVehicle], QueryPriority.NORMAL)
    }
  }

  private async handleEnqueueDisappearedIds(vehicleIds: number[]) {
    if (!this._vehicleScraper) {
      console.error(
        clc.bgRed("MilesDataHandler"),
        clc.red("MilesVehicleScraper is undefined")
      )
      return
    }
    this._vehicleScraper.register(vehicleIds, QueryPriority.HIGH)

    // falsely started trip for lifecycled vehicles will be deleted once the vehicle query completes
    await Promise.allSettled(
      vehicleIds.map(async (vehicleId) => {
        await this.relationalStore.startTripFromLastKnown(vehicleId)
      })
    )
  }

  private handleDisenqueuedVehicles(vehicles: apiVehicleJsonParsed[]) {
    if (!this._vehicleScraper) {
      console.error(
        clc.bgRed("MilesDataHandler"),
        clc.red("MilesVehicleScraper is undefined")
      )
      return
    }
    this._vehicleScraper.deregister(vehicles.map((el) => el.idVehicle))
  }
}
