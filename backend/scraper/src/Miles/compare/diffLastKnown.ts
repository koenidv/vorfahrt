import { getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt"
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"
import { VehicleLastKnown } from "@vorfahrt/shared"
import { MilesRelationalCache } from "Miles/DataStore/MilesRelationalCache"
import { MilesRelationalStore } from "Miles/DataStore/MilesRelationalStore"
import { MilesRelationalStoreObserver } from "Miles/MilesRelationalStoreObserver"
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
const opsStatus = "IN_OPS"

export async function diffLastKnown(
  newVehicle: apiVehicleJsonParsed,
  relationalStore: MilesRelationalStore,
  relationalCache: MilesRelationalCache,
  relationalObserver: MilesRelationalStoreObserver
): Promise<{ event: DiffResult; discountChanged: boolean }> {
  const newInfo = getInfoFromMilesVehicleStatus(
    newVehicle.idVehicleStatus as any
  )
  if (newInfo.isInLifecycle || opsStatus == newVehicle.idVehicleStatus) {
    return { event: DiffResult.LIFECYCLED, discountChanged: false }
  }

  const lastKnown = await relationalStore.getLastKnownVehicle(
    newVehicle.idVehicle
  )

  if (!lastKnown)
    return { event: DiffResult.INSIGNIFICANT, discountChanged: true } // only track discount if vehicle is new

  relationalObserver.onVehicleDiffed(lastKnown, newVehicle)

  return {
    event: diffVehicleEvent(
      newVehicle,
      lastKnown,
      await relationalCache.isVehicleKnown(newVehicle.idVehicle),
      relationalObserver.onTripMissed.bind(relationalObserver)
    ),
    discountChanged: discountChanged(newVehicle, lastKnown),
  }
}

function diffVehicleEvent(
  newVehicle: apiVehicleJsonParsed,
  lastKnown: VehicleLastKnown,
  isVehicleCached: boolean,
  onTripMissed: (
    lastKnown: VehicleLastKnown,
    newVehicle: apiVehicleJsonParsed
  ) => void
): DiffResult {
  if (newVehicle.idVehicleStatus === subscriptionStatus) {
    if (locationRelevant(newVehicle, lastKnown))
      return DiffResult.SUBSCRIPTION_MOVED
    else return DiffResult.INSIGNIFICANT
  }

  if (!isVehicleCached) {
    return DiffResult.INSIGNIFICANT
  }

  if (
    inRideStatuses.includes(newVehicle.idVehicleStatus) ||
    relocationStatus == newVehicle.idVehicleStatus
  ) {
    if (
      !inRideStatuses.includes(lastKnown.status) ||
      relocationStatus == lastKnown.status
    )
      return inRideStatuses.includes(newVehicle.idVehicleStatus)
        ? DiffResult.TRIP_STARTED
        : DiffResult.TRIP_STARTED_INTERNAL
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

  if (
    newVehicle.idVehicleStatus === bookedStatus &&
    lastKnown.status !== bookedStatus
  ) {
    return DiffResult.BOOKING_STARTED
  }

  if (
    lastKnown.status === bookedStatus &&
    newVehicle.idVehicleStatus !== bookedStatus
  ) {
    return DiffResult.BOOKING_ENDED
  }

  if (locationRelevant(newVehicle, lastKnown)) {
    onTripMissed(lastKnown, newVehicle)
    return DiffResult.TRIP_MISSED
  }

  return DiffResult.INSIGNIFICANT
}

export function discountChanged(
  newVehicle: apiVehicleJsonParsed,
  lastKnown: VehicleLastKnown
): boolean {
  return lastKnown.discountSource !== newVehicle.RentalPrice_discountSource
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
  return calculateLocationDelta(newVehicle, lastKnown) > 0.001 // ~111m in longitude or, in Berlin, ~68m in latitude
}
