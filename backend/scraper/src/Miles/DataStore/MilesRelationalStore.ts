import {
  MilesVehicleFuelReturn,
  MilesVehicleTransmissionReturn,
} from "@koenidv/abfahrt"
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"
import {
  Booking,
  City,
  DiscountChange,
  Trip,
  TripType,
  VehicleLastKnown,
  VehicleMeta,
  VehicleModel,
  VehicleSize,
} from "@vorfahrt/shared"
import clc from "cli-color"
import { determineTripType } from "../compare/determineTripType"
import { EntityManager, IsNull } from "typeorm"

import env from "../../env"
import GeoPoint from "../../GeoPoint"
import { diffLastKnown, DiffResult } from "../compare/diffLastKnown"
import { MilesCityMeta, MilesVehicleDetails } from "../Miles.types"
import { MilesRelationalStoreObserver } from "../MilesRelationalStoreObserver"
import {
  mapLastKnownToMilesWaypoint,
  mapMilesWaypoint,
} from "../utils/mapMilesWaypoint"
import { MilesRelationalCache } from "./MilesRelationalCache"
import {
  RESTORE_NORMAL_STATES,
  RESTORE_SLOW_STATES,
} from "./MilesRelationalStore.config"

export class MilesRelationalStore {
  manager: EntityManager
  cache: MilesRelationalCache
  observer: MilesRelationalStoreObserver
  getPostalCode: (lon: number, lat: number) => Promise<string | null>

  constructor(
    manager: EntityManager,
    observer: MilesRelationalStoreObserver,
    getPostalCode: (lon: number, lat: number) => Promise<string | null>
  ) {
    this.manager = manager
    this.cache = new MilesRelationalCache(manager)
    this.observer = observer
    this.getPostalCode = getPostalCode
  }

  /**
   * Saves cities from UserHello to the database
   * @param cities Array of cities from UserHello
   */
  async insertCitiesMeta(...cities: MilesCityMeta[]) {
    return await Promise.all(cities.map((city) => this.createCityMeta(city)))
  }

  async restoreVehicleQueue(): Promise<{
    normalQueue: number[]
    slowQueue: number[]
    highestId: number
  }> {
    const normalQueue = (
      await this.manager
        .createQueryBuilder()
        .select("v.milesId")
        .from(VehicleLastKnown, "v")
        .where("v.status IN (:...statuses)", {
          statuses: RESTORE_NORMAL_STATES,
        })
        .getRawMany()
    ).map((el: { v_milesId: string }) => Number(el.v_milesId))
    const slowQueue = (
      await this.manager
        .createQueryBuilder()
        .select("v.milesId")
        .from(VehicleLastKnown, "v")
        .where("v.status IN (:...statuses)", { statuses: RESTORE_SLOW_STATES })
        .getRawMany()
    ).map((el: { v_milesId: string }) => Number(el.v_milesId))
    const highestId = Number(
      (
        await this.manager
          .createQueryBuilder()
          .select("MAX(v.milesId)", "maxId")
          .from(VehicleLastKnown, "v")
          .getRawOne()
      ).maxId
    )

    this.cache.registerVehiclesKnown(...normalQueue, ...slowQueue)
    return { normalQueue, slowQueue, highestId }
  }

  private async createCityMeta(data: MilesCityMeta) {
    if (await this.manager.exists(City, { where: { milesId: data.idCity } }))
      return

    const city = new City()
    city.milesId = data.idCity
    city.name = data.name
    city.location = new GeoPoint(
      data.location_lat,
      data.location_long
    ).toString()
    return await this.manager.insert(City, city)
  }

  private async findCity(milesId: string): Promise<City | null> {
    return await this.manager.findOne(City, { where: { milesId } })
  }

  async handleVehicle(vehicle: apiVehicleJsonParsed) {
    await this.createVehicleMeta(vehicle)

    const diff = await diffLastKnown(vehicle, this, this.cache, this.observer)

    if (diff.discountChanged) {
      await this.saveDiscountChange(vehicle)
    }

    switch (diff.event) {
      case DiffResult.LIFECYCLED:
        await this.cancelTrip(vehicle.idVehicle)
        break
      case DiffResult.BOOKING_STARTED:
        this.cancelTrip(vehicle.idVehicle)
        await this.startBooking(vehicle)
        break
      case DiffResult.BOOKING_ENDED:
        await this.endBooking(vehicle.idVehicle)
        break
      case DiffResult.TRIP_STARTED:
        await this.startTrip(vehicle, TripType.PUBLIC)
        break
      case DiffResult.TRIP_STARTED_INTERNAL:
        await this.startTrip(vehicle, TripType.RELOCATION)
        break
      case DiffResult.TRIP_WAYPOINT:
        await this.saveWaypoint(vehicle)
        break
      case DiffResult.TRIP_ENDED:
        await this.finalizeTrip(vehicle)
        break
      case DiffResult.TRIP_MISSED:
        await this.cancelTrip(vehicle.idVehicle)
        await this.endBooking(vehicle.idVehicle) // make sure bookings are ended
        this.observer.onTripMissed(
          await this.getLastKnownVehicle(vehicle.idVehicle),
          vehicle
        )
        break
      case DiffResult.SUBSCRIPTION_MOVED:
        await this.updateSubscriptionTrip(vehicle)
        break
    }

    if (await this.cache.isVehicleKnown(vehicle.idVehicle))
      await this.saveLastKnown(vehicle)
  }

  private async createVehicleMeta(vehicle: apiVehicleJsonParsed) {
    if (await this.cache.isVehicleKnown(vehicle.idVehicle)) return

    const firstCity = await this.findCity(vehicle.idCity)
    if (!firstCity) {
      console.error(
        clc.bgRedBright("MilesRelationalStore"),
        clc.red(
          `Skipping vehicle ${vehicle.idVehicle}: City ${vehicle.idCity} not found`
        )
      )
      return
    }

    const vehicleDetails = vehicle.JSONFullVehicleDetails
    if (!vehicleDetails) {
      console.error(
        clc.bgRedBright("MilesRelationalStore"),
        clc.red(`Skipping vehicle ${vehicle.idVehicle} - No details found`)
      )
      return
    }

    const model = await this.createVehicleModel(
      vehicle,
      await this.createVehicleSize(vehicle.VehicleSize),
      vehicleDetails.vehicleDetails
    )
    if (model === undefined) return

    const newVehicle = new VehicleMeta()
    newVehicle.milesId = vehicle.idVehicle
    newVehicle.licensePlate = vehicle.LicensePlate
    newVehicle.model = model
    newVehicle.color = vehicle.VehicleColor
    newVehicle.firstFoundCity = firstCity
    newVehicle.isCharity =
      typeof vehicle.isCharity === "boolean"
        ? vehicle.isCharity
        : vehicleDetails.vehicleDescriptors.isCharity
    newVehicle.image = vehicle.URLVehicleImage.replace(
      "https://api.app.miles-mobility.com/static/img/cars/small/",
      ""
    )

    await this.manager.save(newVehicle)
    this.cache.registerVehicleKnown(vehicle.idVehicle)
  }

  private async createVehicleSize(name: string): Promise<VehicleSize> {
    const existing = await this.manager.findOne(VehicleSize, {
      where: { name },
    })
    if (existing) return existing

    const size = new VehicleSize()
    size.name = name
    return await this.manager.save(VehicleSize, size)
  }

  private async createVehicleModel(
    vehicle: apiVehicleJsonParsed,
    size: VehicleSize,
    details: MilesVehicleDetails
  ): Promise<VehicleModel | undefined> {
    const existing = await this.manager.findOne(VehicleModel, {
      where: { name: vehicle.VehicleType },
    })
    if (existing) return existing

    const model = new VehicleModel()
    model.name = vehicle.VehicleType
    model.size = size
    model.seats = Number(
      details.find((d) => d.key === "vehicle_details_seats")!.value
    )
    model.electric = vehicle.isElectric
    model.enginePower =
      vehicle.EnginePower ??
      Number(
        details
          .find((d) => d.key === "vehicle_details_engine_power")!
          .value.replace("PS", "")
      )
    model.transmission = details.find(
      (d) => d.key === "vehicle_details_transmission"
    )!.value as keyof typeof MilesVehicleTransmissionReturn
    model.fuelType = details.find((d) => d.key === "vehicle_details_fuel")!
      .value as keyof typeof MilesVehicleFuelReturn

    try {
      return await this.manager.save(VehicleModel, model)
    } catch (e) {
      console.error(
        clc.bgRedBright("MilesRelationalStore"),
        clc.red(`Error saving vehicle ${vehicle.idVehicle}: ${e}`)
      )
      return
    }
  }

  private async saveLastKnown(vehicle: apiVehicleJsonParsed) {
    const lastKnown = new VehicleLastKnown()
    lastKnown.milesId = vehicle.idVehicle
    lastKnown.status = vehicle.idVehicleStatus.trim()
    lastKnown.latitude = vehicle.Latitude
    lastKnown.longitude = vehicle.Longitude
    const charging =
      vehicle.EVPlugged ||
      vehicle.JSONFullVehicleDetails?.vehicleBanner.some(
        (banner) => banner.text === "⚡Vehicle plugged"
      ) === true
    lastKnown.charging = charging
    lastKnown.charge = vehicle.FuelPct_parsed!
    lastKnown.range = vehicle.RemainingRange_parsed!
    lastKnown.discounted = vehicle.RentalPrice_discounted_parsed !== null
    lastKnown.discountSource = vehicle.RentalPrice_discountSource ?? null
    lastKnown.damageCount = vehicle.JSONVehicleDamages?.length ?? 0
    lastKnown.coverageGsm = vehicle.GSMCoverage!
    lastKnown.coverageGps = vehicle.SatelliteNumber!
    return await this.manager.save(VehicleLastKnown, lastKnown)
  }

  public async getLastKnownVehicle(
    id: number,
    manager = this.manager
  ): Promise<VehicleLastKnown | null> {
    return await manager.findOne(VehicleLastKnown, {
      where: { milesId: id },
    })
  }

  public async startBooking(vehicle: apiVehicleJsonParsed) {
    const booking = new Booking()
    booking.milesId = vehicle.idVehicle
    booking.startTime = new Date()
    booking.longitude = vehicle.Longitude
    booking.latitude = vehicle.Latitude
    booking.postcode = await this.getPostalCode(
      vehicle.Longitude,
      vehicle.Latitude
    )
    booking.discount = vehicle.RentalPrice_discountSource ?? null
    await this.manager.save(booking)
  }

  public async endBooking(
    vehicleId: number,
    manager = this.manager
  ): Promise<Booking | null> {
    const pending = await manager.findOne(Booking, {
      where: { milesId: vehicleId, endTime: IsNull() },
      order: { id: "DESC" },
    })
    if (!pending) return null
    pending.endTime = new Date()
    return await manager.save(pending)
  }

  public async startTrip(vehicle: apiVehicleJsonParsed, tripType: TripType) {
    const pendingTrip = await this.findPendingTrip(vehicle.idVehicle)
    if (pendingTrip) {
      const tripType = determineTripType(vehicle)
      if (pendingTrip.type != tripType) {
        this.updateTripType(pendingTrip, tripType)
      }
      await this.saveWaypoint(vehicle)
      this.observer.onTripStarted(await this.getPendingTripsCount())
      return
    }

    if (!this.cache.isVehicleKnown(vehicle.idVehicle)) {
      console.error(
        "Trip could not be started: vehicle with id",
        vehicle.idVehicle,
        "is not known"
      )
      return
    }

    const fromBooking = await this.endBooking(vehicle.idVehicle)

    await this.manager.transaction(async (manager) => {
      const trip = new Trip()
      trip.milesId = vehicle.idVehicle
      trip.fromBooking = fromBooking
      trip.type = determineTripType(vehicle)
      trip.discount = vehicle.RentalPrice_discountSource ?? null
      await manager.save(trip)
      const startPoint = await mapMilesWaypoint(
        trip,
        vehicle,
        this.getPostalCode
      )
      await manager.save(startPoint)
      trip.startPoint = startPoint
      await manager.save(trip)
    })
  }

  private async updateTripType(
    trip: Trip,
    tripType: TripType,
    manager = this.manager
  ) {
    trip.type = tripType
    await manager.save(trip)
  }

  public async startTripFromLastKnown(vehicleId: number) {
    await this.manager.transaction(async (transaction) => {
      const lastKnown = await this.getLastKnownVehicle(vehicleId, transaction)
      if (!lastKnown) {
        console.error(
          "Trip could not be started: no last known found for vehicle with id",
          vehicleId
        )
        return
      }

      const fromBooking = await this.endBooking(vehicleId, transaction)

      const trip = new Trip()
      trip.milesId = lastKnown.milesId
      trip.fromBooking = fromBooking
      await transaction.save(trip)
      const startPoint = await mapLastKnownToMilesWaypoint(
        trip,
        lastKnown,
        this.getPostalCode
      )
      await transaction.save(startPoint)
      trip.startPoint = startPoint
      await transaction.save(trip)
    })
  }

  public async findPendingTrip(
    vehicleId: number,
    manager = this.manager
  ): Promise<Trip | null> {
    return await manager.findOne(Trip, {
      where: { milesId: vehicleId, endPoint: IsNull() },
    })
  }

  public async getPendingTripsCount(): Promise<number> {
    return await this.manager.count(Trip, { where: { endPoint: IsNull() } })
  }

  public async finalizeTrip(vehicle: apiVehicleJsonParsed) {
    try {
      await this.manager.transaction(async (transaction) => {
        const pendingTrip = await this.findPendingTrip(
          vehicle.idVehicle,
          transaction
        )
        if (!pendingTrip) {
          console.error(
            "Trip could not be finalized: no pending trip found for vehicle with id",
            vehicle.idVehicle
          )
          return
        }

        pendingTrip.endPoint = await mapMilesWaypoint(
          pendingTrip,
          vehicle,
          this.getPostalCode
        )
        await transaction.save(pendingTrip)
      })
    } catch (e) {
      console.error(
        clc.bgRedBright("MilesRelationalStore"),
        clc.red(`Error finalizing trip for vehicle ${vehicle.idVehicle}: ${e}`)
      )
      this.observer.onDbError(e ?? {})
    }
  }

  public async cancelTrip(vehicleId: number) {
    try {
      await this.manager.transaction(async (transaction) => {
        await this.endBooking(vehicleId, transaction)
        const tripToDelete = await transaction
          .createQueryBuilder()
          .select("id")
          .from(Trip, "MilesTrip")
          .where('"milesId" = :vehicleId', { vehicleId })
          .andWhere('"endPoint" IS NULL')
          .orderBy("id", "DESC")
          .limit(1)
          .getRawOne()

        if (tripToDelete) {
          await transaction
            .createQueryBuilder()
            .delete()
            .from("MilesPoint")
            .where('"tripId" = :tripId', { tripId: tripToDelete.id })
            .execute()
          await transaction
            .createQueryBuilder()
            .delete()
            .from("MilesTrip")
            .where('"id" = :tripId', { tripId: tripToDelete.id })
            .execute()
        }
      })
    } catch (e) {
      console.error(
        clc.bgRedBright("MilesRelationalStore"),
        clc.red(`Error canceling trip for vehicle ${vehicleId}: ${e}`)
      )
      this.observer.onDbError(e ?? {})
    }
  }

  public async saveWaypoint(vehicle: apiVehicleJsonParsed) {
    try {
      await this.manager.transaction(async (transaction) => {
        const trip = await this.findPendingTrip(vehicle.idVehicle, transaction)
        if (!trip) {
          console.error(
            "Waypoint could not be saved: no pending trip found for vehicle with id",
            vehicle.idVehicle
          )
          // todo create new trip, for subsciption vehicles
          return
        }

        const waypoint = await mapMilesWaypoint(
          trip,
          vehicle,
          this.getPostalCode
        )
        await transaction.save(waypoint)
      })
    } catch (e) {
      console.error(
        clc.bgRedBright("MilesRelationalStore"),
        clc.red(`Error saving waypoint for vehicle ${vehicle.idVehicle}: ${e}`)
      )
      this.observer.onDbError(e ?? {})
    }
  }

  public async updateSubscriptionTrip(vehicle: apiVehicleJsonParsed) {
    const pending = await this.findPendingTrip(vehicle.idVehicle)
    if (pending) {
      await this.saveWaypoint(vehicle)
    } else {
      await this.startTrip(vehicle, TripType.SUBSCRIPTION)
    }
  }

  public async saveDiscountChange(vehicle: apiVehicleJsonParsed) {
    try {
      if (!this.cache.isVehicleKnown(vehicle.idVehicle)) return
      const discountChange = new DiscountChange()
      discountChange.milesId = vehicle.idVehicle
      discountChange.discount = vehicle.RentalPrice_discountSource ?? "NONE"
      await this.manager.save(discountChange)
    } catch (e) {
      if (
        env.scrape_single_city_id &&
        vehicle.idCity !== env.scrape_single_city_id
      ) {
        return
      }
      console.error(
        clc.bgYellow("MilesRelationalStore"),
        clc.yellow(
          `Could not save discount change for ${vehicle.idVehicle}, the vehicle is likely unknown (${e})`
        )
      )
      this.observer.onDbError(e ?? {})
    }
  }
}
