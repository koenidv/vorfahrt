import { WriteApi } from "@influxdata/influxdb-client"
import { getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt"
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"
import { VehicleLastKnown } from "@vorfahrt/shared"
import { MilesRelationalCache } from "Miles/DataStore/MilesRelationalCache"
import { MilesRelationalStore } from "Miles/DataStore/MilesRelationalStore"
import { RelationalStoreObserver } from "RelationalStoreObserver"

export enum DiffResult {
  INSIGNIFICANT,
  LIFECYCLED,
  BOOKING_STARTED,
  BOOKING_ENDED,
  TRIP_STARTED,
  TRIP_STARTED_INTERNAL,
  TRIP_ENDED,
  TRIP_WAYPOINT,
  TRIP_MISSED,
  SUBSCRIPTION_MOVED,
}

const inRideStatuses = ["USER_IN_RIDE", "PAUSED_BY_USER"]
const bookedStatus = "BOOKED_BY_USER"
const subscriptionStatus = "CAR_SUBSCRIPTION"
const relocationStatus = "IN_RELOCATION_TRIP"

export async function diffLastKnown(
  newVehicle: apiVehicleJsonParsed,
  relationalStore: MilesRelationalStore,
  relationalCache: MilesRelationalCache,
  relationalObserver: RelationalStoreObserver
): Promise<DiffResult> {
  const newInfo = getInfoFromMilesVehicleStatus(
    newVehicle.idVehicleStatus as any
  )
  if (newInfo.isInLifecycle) return DiffResult.LIFECYCLED
  const lastKnown = await relationalStore.getLastKnownVehicle(
    newVehicle.idVehicle
  )
  if (!lastKnown) return DiffResult.INSIGNIFICANT // do not record if a vehicle is new

  relationalObserver.onVehicleDiffed(lastKnown, newVehicle)

  if (newVehicle.idVehicleStatus === subscriptionStatus) {
    if (locationRelevant(newVehicle, lastKnown))
      return DiffResult.SUBSCRIPTION_MOVED
    else return DiffResult.INSIGNIFICANT
  }

  if (!(await relationalCache.isVehicleKnown(newVehicle.idVehicle))) {
    return DiffResult.INSIGNIFICANT
  }

  if (inRideStatuses.includes(newVehicle.idVehicleStatus)) {
    if (!inRideStatuses.includes(lastKnown.status))
      return DiffResult.TRIP_STARTED
    else if (
      locationRelevant(newVehicle, lastKnown) ||
      lastKnown.status !== newVehicle.idVehicleStatus
    )
      return DiffResult.TRIP_WAYPOINT
  }

  if (
    !inRideStatuses.includes(newVehicle.idVehicleStatus) &&
    inRideStatuses.includes(lastKnown.status)
  ) {
    return DiffResult.TRIP_ENDED
  }

  if (newVehicle.idVehicleStatus === bookedStatus && lastKnown.status !== bookedStatus) {
    return DiffResult.BOOKING_STARTED
  }

  if (lastKnown.status === bookedStatus && newVehicle.idVehicleStatus !== bookedStatus) {
    return DiffResult.BOOKING_ENDED
  }

  if (locationRelevant(newVehicle, lastKnown)) {
    return DiffResult.TRIP_MISSED
  }

  return DiffResult.INSIGNIFICANT
}

function calculateLocationDelta(
  newVehicle: apiVehicleJsonParsed,
  lastKnown: VehicleLastKnown
): number {
  // pythagorean is fine here as we'll only ever be within 50km
  return Math.sqrt(
    Math.pow(newVehicle.Latitude - lastKnown.latitude, 2) +
      Math.pow(newVehicle.Longitude - lastKnown.longitude, 2)
  )
}

function locationRelevant(
  newVehicle: apiVehicleJsonParsed,
  lastKnown: VehicleLastKnown
): boolean {
  return calculateLocationDelta(newVehicle, lastKnown) > 0.0005
}
